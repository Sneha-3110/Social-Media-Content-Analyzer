const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdf = require('pdf-parse');
const { createWorker } = require('tesseract.js');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config(); 

const app = express();
const port = process.env.PORT || 5000;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const corsOptions = {
//   origin: "http://localhost:5173",
  origin: "https://post-analyzer.netlify.app/",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
};
app.use(cors(corsOptions));

app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/api/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    try {
        let text = '';
        const fileBuffer = req.file.buffer;

        if (req.file.mimetype === 'application/pdf') {
            const data = await pdf(fileBuffer);
            text = data.text;
        } else if (req.file.mimetype.startsWith('image/')) {
            // const worker = await createWorker();
            // const { data } = await worker.recognize(fileBuffer);
            // text = data.text;
            // await worker.terminate();

            // const worker = await createWorker({ logger: (m) => console.log('TESSERACT:', m) });
            const worker = await createWorker();
            try {
                // await worker.load();
                // await worker.loadLanguage('eng');
                // await worker.initialize('eng');
                const { data } = await worker.recognize(fileBuffer);
                text = data?.text || '' ;
            } finally {
                await worker.terminate();
            }

        } else {
            return res.status(400).json({ error: 'Unsupported file type. Please upload a PDF or image.' });
        }
        
        if (!text.trim()) {
            return res.status(400).json({ error: 'Could not extract text from the document.' });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        // const prompt = `You are a social media expert. Analyze the following post and provide 3-5 actionable bullet points to improve its engagement. Format your response clearly. Post: "${text}"`;
        const prompt = `You are a social media expert. Analyze the following post and respond in the following format:
        1. **Post Summary:** Briefly summarize in 2-3 sentences what the post is about.
        2. **AI Suggestions:** Provide 3-5 actionable bullet points to improve engagement.
        Post: "${text}"`;

        const result = await model.generateContent(prompt);
        console.log('AI generateContent result:', result);
        const response = await result.response;
        const aiSuggest = response.text();
        
        res.json({ 
            extractedText: text,
            suggestions: aiSuggest
        });

    } catch (error) {
        console.error('Error processing file:', error.message);
        
        if (error.message && (error.message.includes('XRef') || error.message.includes('Invalid PDF'))) {
            return res.status(400).json({ error: 'The uploaded PDF file is corrupted or improperly formatted. Please try a different file.' });
        }

        res.status(500).json({ error: 'An unexpected error occurred on the server.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});