import { ImageUploader } from "@/components/image-uploader"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-foreground">SnapToSheet</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
              Convert invoice images into Excel in seconds
            </h2>
            <p className="text-lg text-muted-foreground text-pretty">
              Upload an invoice image and instantly download a structured Excel file
            </p>
          </div>

          {/* Upload Card */}
          <ImageUploader />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Powered by OCR technology
          <br/>
          Made By Vikas
        </div>
      </footer>
    </div>
  )
}
