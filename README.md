# Invoice to Excel

## Description
Invoice to Excel is a web-based application that allows users to upload invoice files and convert them into structured Excel spreadsheets. The project is built and managed using v0.app, with automatic deployment and synchronization through Vercel.

## Features
- Upload invoice documents
- Automatically extract invoice data
- Convert invoices into Excel format
- Cloud deployment with Vercel# Invoice to Excel

## Description
Invoice to Excel is a web-based application that converts invoice images into clean, structured Excel spreadsheets using OCR technology. The system extracts key invoice fields and organizes them into readable, well-formatted sheets.

---

## Features
- Upload invoice images (PNG, JPG)
- OCR-based text extraction (Tesseract)
- Automatic detection of:
  - Invoice number
  - Date
  - Vendor
  - Total amount
  - Line items
- Multi-sheet Excel output:
  - Invoice Overview
  - Line Items
  - Raw OCR Text
- Optional PDF generation
- ZIP download containing all outputs
- Docker-ready deployment

---

## Live Demo
https://invoice-to-sheet.vercel.app  
*(Update if URL changes)*

---

## Tech Stack
- Next.js (App Router)
- TypeScript
- Node.js
- Tesseract OCR
- xlsx
- pdfkit
- jszip
- Docker

---

## How It Works
1. User uploads an invoice image
2. OCR extracts raw text
3. Text is analyzed and structured
4. Excel and PDF files are generated
5. Files are downloaded as a ZIP

---

## Run Locally
npm install
npm run dev

## Run with Docker
docker build -t invoice-ocr .
docker run -p 3000:3000 invoice-ocr

##Project Structure
app/
 ├── api/extract/route.ts   # OCR + parsing + export logic
 ├── layout.tsx             # Metadata
 ├── page.tsx               # UI

## Limitations

- OCR accuracy depends on image quality
- Highly complex invoice layouts may reduce accuracy

## Future Improvements

- ML-based invoice layout detection
- Confidence scoring
- Manual correction UI
- Multi-language OCR

## License

MIT

## Author

Built by \Vikas Kumar
