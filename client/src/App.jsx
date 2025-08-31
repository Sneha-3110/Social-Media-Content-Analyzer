import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import './App.css';
import GradientBlinds  from './reactComponents/GradientBlinds/GradientBlinds';


function App() {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [extractedText, setExtractedText] = useState('');
    const [suggestions, setSuggestions] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [fileName, setFileName] = useState('');
    const resultsRef = useRef(null);

  useEffect(() => {
    if ((extractedText || suggestions) && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [extractedText, suggestions]);

    const onDrop = useCallback((acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
        setFile(selectedFile);
        setFileName(selectedFile.name);
        
        if (selectedFile.type.startsWith('image/')) {
            const previewUrl = URL.createObjectURL(selectedFile);
            setPreview(previewUrl);
        } else {
            setPreview('https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg'); 
        }
        
        setExtractedText('');
        setSuggestions('');
        setError('');
    }
}, []);

const handleExtract = async () => {
    if (!file){
      setError('No file uploaded. Please select a file first.');
      return;
    }

    setIsLoading(true);
    setError('');
    setExtractedText('');
    setSuggestions('');

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await axios.post('http://localhost:5000/api/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        setExtractedText(response.data.extractedText);
        setSuggestions(response.data.suggestions);
    } catch (err) {
        setError(err.response?.data?.error || 'An unexpected error occurred.');
    } finally {
        setIsLoading(false);
    }
};

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'image/jpeg': ['.jpeg', '.jpg'],
            'image/png': ['.png'],
        },
        multiple: false,
    });

    const cleanText = (text) => {
      return text.split('\n').map(line => line.replace(/[^a-zA-Z0-9\s.,?!]/g, '').trim()).filter(line => line.length > 0).join('\n');                             
    };

return (  
  <div className="relative min-h-screen overflow-hidden">
    <div className="absolute inset-0 -z-10">
      <GradientBlinds
        gradientColors={['#FF9FFC', '#5227FF']}
        angle={30}
        noise={0.3}
        blindCount={12}
        blindMinWidth={50}
        spotlightRadius={0.6}
        spotlightSoftness={1}
        spotlightOpacity={0.8}
        mouseDampening={0.15}
        distortAmount={0}
        shineDirection="left"
        mixBlendMode="lighten"
      />
    </div>

    <div className="container relative z-10 mt-20">
      <header className="text-center py-6 pb-20">
        <h1 className="text-6xl font-extrabold text-white bg-clip-text leading-tight">
          Social Media Content Analyzer
        </h1>
        <p className="text-2xl text-white">
          Upload a document, then click Extract to get AI-powered suggestions.
        </p>
      </header>

      <main className="flex flex-col items-center">
        <div
          {...getRootProps()}
          className={`dropzone ${isDragActive ? 'active' : ''} 
            bg-gray-300/50 backdrop-blur-lg border-4 border-dashed border-gray-200 
            p-6 rounded-xl text-center shadow-md transition 
            w-full max-w-[800px] h-64 resize overflow-auto hover:border-blue-400 mx-auto`}
        >
          <input {...getInputProps()} />
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="max-w-full max-h-full mx-auto my-auto object-contain rounded-md"
            />
          ) : isDragActive ? (
            <p className="text-xl">Drop the file here...</p>
          ) : (
            <p className="text-xl">Drag & drop a file, or click to select</p>
          )}
        </div>

        {file && !isLoading && (
          <p className="file-name text-white font-bold ... mt-4">
            Selected: {fileName}
          </p>
        )}

        <div className="extract-container mt-4">
          <div className="flex justify-center items-center">
            <button onClick={handleExtract} className="extract-button bg-violet-700 text-white text-xl font-bold px-4 py-2 rounded-lg shadow hover:bg-violet-900 justify-center items-center" disabled={isLoading} >
              {isLoading ? (
                <div className="button-loader"></div> 
                  ) : (
                  'Extract Text' 
                )}
            </button>
          </div>
        </div>

        {isLoading && <div className="loader mt-4"></div>}
        {error && <div className="error-message mt-4 text-red-500">{error}</div>}

        {(extractedText || suggestions) && (
          <div ref={resultsRef} className="results-grid mt-6 grid md:grid-cols-2 gap-6 w-full">
              <div className="result-card bg-white/80 p-4 rounded-xl shadow h-80 overflow-y-auto break-words">
                <h2 className="font-semibold mb-2 text-black text-2xl text-center">
                  Extracted Text
                </h2>
                <pre className="text-content text-black whitespace-pre-wrap">
                  {cleanText(extractedText)}
                </pre>
              </div>

              <div className="result-card bg-white/80 p-4 rounded-xl shadow h-80 overflow-y-auto break-words">
                <h2 className="font-semibold mb-2 text-black text-2xl text-center">
                  AI Suggestions
                </h2>
                {suggestions ? (
                  <ul className="list-disc list-inside space-y-2 text-black">
                    {suggestions.split('\n').map((line, index) => {
                      if (line.trim() === '') return null;
                      const formattedLine = line.replace(/^-\s*/, '').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
                      return (
                        <li key={index} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: formattedLine }}/>
                      );
                    })}
                  </ul>
                  ) : (
                    <p className="text-gray-500">No suggestions yet.</p>
                  )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;