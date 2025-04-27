import React, { useState } from 'react';
import './App.css';

function AudioUploadToKatex() {
  const [fileContent, setFileContent] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setFileContent(text);
      // Here you would then convert `text` to KaTeX
      console.log('File Content:', text);
      // TODO: Render KaTeX using something like `katex.render()`
    };
    reader.readAsText(file);
  };

  const triggerFileUpload = () => {
    document.getElementById('file-upload').click();
  };

  return (
    <div className="audio-upload-container">
      <input 
        type="file" 
        id="file-upload" 
        style={{ display: 'none' }} 
        accept=".txt"
        onChange={handleFileChange}
      />

      <button onClick={triggerFileUpload} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
        {/* Smiley microphone icon */}
        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 14a4 4 0 0 0 4-4V6a4 4 0 0 0-8 0v4a4 4 0 0 0 4 4z" stroke="#000" strokeWidth="2" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="#000" strokeWidth="2" />
          <path d="M8 21h8" stroke="#000" strokeWidth="2" strokeLinecap="round" />
          <path d="M12 17v4" stroke="#000" strokeWidth="2" strokeLinecap="round" />
          <circle cx="9" cy="7" r="1" fill="#000"/>
          <circle cx="15" cy="7" r="1" fill="#000"/>
          <path d="M9 10c.5.5 1.5.5 2 0" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      {fileContent && (
        <div className="katex-output">
          {/* Render KaTeX here */}
          <pre>{fileContent}</pre>
        </div>
      )}
    </div>
  );
}

export default AudioUploadToKatex;
