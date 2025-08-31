# Social Media Content Analyzer

[cite_start]This project is a web application that extracts text from uploaded PDF and image files and uses AI to generate suggestions for improving social media engagement[cite: 6].

[cite_start]This project was built for the Software Engineer technical assessment[cite: 1, 3].

## Features

* [cite_start]**File Upload**: Supports drag-and-drop or file picker for PDF and image files[cite: 9, 10].
* [cite_start]**Text Extraction**: Parses text from PDFs and uses OCR for images.
* [cite_start]**AI Analysis**: Integrates with Google's Gemini API to provide engagement suggestions.
* [cite_start]**User Experience**: Includes loading states and clear error handling[cite: 16, 17].

## Tech Stack

* **Frontend**: React (Vite), Axios, React-Dropzone
* **Backend**: Node.js, Express, Multer
* **Text Extraction**: `pdf-parse` (for PDFs), `tesseract.js` (for OCR)
* **AI**: Google Gemini API

## Local Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/social-media-analyzer.git](https://github.com/your-username/social-media-analyzer.git)
    cd social-media-analyzer
    ```
2.  **Setup Backend:**
    ```bash
    cd server
    npm install
    # Create a .env file and add your GEMINI_API_KEY
    npm start 
    ```
3.  **Setup Frontend:**
    ```bash
    cd client
    npm install
    npm run dev
    ```
The application will be running at `http://localhost:5173`.