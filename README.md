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
```bash
npm install
npm run dev

- Automatic sync with v0.app deployments

## Live Demo
https://v0-invoice-to-excel.vercel.app/

## Deployment Dashboard
https://vercel.com/vikumar162006-gmailcoms-projects/v0-invoice-to-excel

## Tech Stack
- v0.app
- Vercel
- Web-based interface

## Build & Development
This project is created and maintained using v0.app.

To continue building or modifying the application, visit:
https://v0.app/chat/k1Om5dPPBre

## How It Works
1. Build and update the application using v0.app
2. Deploy directly from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version to production

## License
Specify your license here
