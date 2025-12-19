"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Upload, FileImage, CheckCircle2, AlertCircle, Download, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

type UploadStatus = "idle" | "uploading" | "processing" | "success" | "error"

export function ImageUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [status, setStatus] = useState<UploadStatus>("idle")
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const validateFile = (file: File): boolean => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png"]
    if (!validTypes.includes(file.type)) {
      setError("Invalid file type. Please upload a JPG or PNG image.")
      return false
    }
    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      setError("File size too large. Please upload an image under 10MB.")
      return false
    }
    return true
  }

  const handleFileSelect = useCallback((selectedFile: File) => {
    if (!validateFile(selectedFile)) {
      return
    }

    setFile(selectedFile)
    setError(null)
    setStatus("idle")

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(selectedFile)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile) {
        handleFileSelect(droppedFile)
      }
    },
    [handleFileSelect],
  )

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFileSelect(selectedFile)
    }
  }

  const handleExtract = async () => {
    if (!file) return

    setStatus("uploading")
    setError(null)

    const formData = new FormData()
    formData.append("image", file)

    try {
      setStatus("processing")

      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Extraction failed. Please try again.")
      }

      // Get the blob and create a download link
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${file.name.split(".")[0]}_extracted.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setStatus("success")
    } catch (err) {
      setStatus("error")
      setError(err instanceof Error ? err.message : "Extraction failed. Please try again.")
    }
  }

  const resetUploader = () => {
    setFile(null)
    setPreview(null)
    setStatus("idle")
    setError(null)
  }

  return (
    <Card className="overflow-hidden shadow-lg">
      <CardContent className="p-8">
        {/* Upload Area */}
        {!file && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-lg p-12 text-center transition-all
              ${isDragging ? "border-primary bg-primary/5 scale-[1.02]" : "border-border hover:border-primary/50"}
            `}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleFileInput}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground mb-1">Drop your invoice image here</p>
                  <p className="text-sm text-muted-foreground">or click to browse • JPG, PNG up to 10MB</p>
                </div>
              </div>
            </label>
          </div>
        )}

        {/* File Preview */}
        {file && preview && (
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-background flex-shrink-0 border border-border">
                <img src={preview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <FileImage className="w-4 h-4 text-primary flex-shrink-0" />
                  <p className="font-medium text-foreground truncate">{file.name}</p>
                </div>
                <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              {status === "idle" && (
                <Button variant="ghost" size="sm" onClick={resetUploader} className="flex-shrink-0">
                  Change
                </Button>
              )}
            </div>

            {/* Action Button */}
            {status === "idle" && (
              <Button onClick={handleExtract} className="w-full h-12 text-base font-semibold" size="lg">
                <Upload className="w-5 h-5 mr-2" />
                Extract to Excel
              </Button>
            )}

            {/* Processing State */}
            {(status === "uploading" || status === "processing") && (
              <div className="flex flex-col items-center gap-4 py-8">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <div className="text-center">
                  <p className="text-lg font-semibold text-foreground mb-1">
                    {status === "uploading" ? "Uploading..." : "Extracting data..."}
                  </p>
                  <p className="text-sm text-muted-foreground">This may take a few moments</p>
                </div>
              </div>
            )}

            {/* Success State */}
            {status === "success" && (
              <Alert className="bg-accent/10 border-accent">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <AlertDescription className="text-accent-foreground">
                  <span className="font-semibold">Excel file ready!</span> Your file has been downloaded successfully.
                </AlertDescription>
              </Alert>
            )}

            {/* Success Actions */}
            {status === "success" && (
              <div className="flex gap-3">
                <Button onClick={handleExtract} variant="outline" className="flex-1 bg-transparent">
                  <Download className="w-4 h-4 mr-2" />
                  Download Again
                </Button>
                <Button onClick={resetUploader} variant="outline" className="flex-1 bg-transparent">
                  Upload New Image
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
