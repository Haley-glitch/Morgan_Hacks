import { useState } from 'react';

function TextComponent() {
  const [inputText, setInputText] = useState('');
  const [convertedText, setConvertedText] = useState('');

  const handleInputChange = (e) => {
    const text = e.target.value;
    setInputText(text);
    setConvertedText(text.toUpperCase());
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      padding: '40px',
      gap: '30px',
      justifyContent: 'center', 
      alignItems: 'center',     
      backgroundColor: '#1e1e1e', 
    }}>
      <textarea
        style={{
          width: '500px',   
          height: '80%',
          padding: '15px',
          fontSize: '16px',
          backgroundColor: '#2c2c2c',
          color: 'white',
          border: '1px solid #555',
          borderRadius: '8px',
          resize: 'none',
        }}
        placeholder="Enter your text here..."
        value={inputText}
        onChange={handleInputChange}
      />
      <textarea
        style={{
          width: '500px',  
          height: '80%',
          padding: '15px',
          fontSize: '16px',
          backgroundColor: '#f5f5f5',
          color: 'black',
          border: '1px solid #ccc',
          borderRadius: '8px',
          resize: 'none',
        }}
        placeholder="Converted text will appear here..."
        value={convertedText}
        readOnly
      />
    </div>
  );
}

export default TextComponent;
