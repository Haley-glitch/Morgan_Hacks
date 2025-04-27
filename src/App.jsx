import { API_KEY } from './keys.js';
import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import AudioPlay from './Voice';
import ImageUpload from './Image';
import {
  extractMathSnippets,
  generateQuestionsFromMath
} from './utils/questionTemplates';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';
import ReactMarkdown from 'react-markdown';
import {JoplinIcon, ObsidianIcon, DocIcon, CameraIcon, MicIcon } from"./Icons.jsx";
import mammoth from 'mammoth';

const GEMINI_KEY = API_KEY;

function NavBar() {
  return (
    <div className="navbar-container">
      <div className="navbar-name" onClick={() => window.location.replace("/")}>
        DIGITEXT
      </div>
      <div className="row-container add-gaps">
        <div className="navbar-button" onClick={() => window.location.replace("/about")}>About</div>
        <div className="navbar-button" onClick={() => window.location.replace("/generate")}>Generate</div>
      </div>
    </div>
  );
}

function About() {
  return (
    <div className="page-container background-1">
      <NavBar />
      <div className="line-spacer"></div>
      <div className="line-spacer"></div>
      <div className="row-container emphasis-text">
        Digitalize Your
        <div className="text-spacer"></div>
        <div className="accent-text">[Notes]</div>
      </div>
      <div className="content-box secondary-text">
        Bring your notes into the most popular digital note-taking apps.
      </div>
      <div className="content-box secondary-text">
        Translate your handwriting into Markdown and KaTex (LaTex for Web).
      </div>
      <div className="content-box row-container secondary-text">
        Supports:
        <div className="text-spacer"></div>
        <JoplinIcon />
        <ObsidianIcon />
      </div>
      <div className="line-spacer"></div>
      <div className="content-box redirect-button" onClick={() => window.location.replace("/generate")}>
          Get Started
      </div>
    </div>
  );
}

function MarkdownWithMath({ text }) {
  if (!text) return null;
  
  const chunks = text.split(/(\$\$[\s\S]*?\$\$)/g);
  
  return (
    <div>
      {chunks.map((chunk, index) => {
        if (chunk.startsWith('$$') && chunk.endsWith('$$')) {
          const mathExpression = chunk.slice(2, -2);
          return <BlockMath key={index} math={mathExpression} />;
        }
        
        const inlineChunks = chunk.split(/(\$[^\$]+?\$)/g);
        
        return (
          <span key={index}>
            {inlineChunks.map((inlineChunk, inlineIndex) => {
              if (inlineChunk.startsWith('$$') && inlineChunk.endsWith('$$')) {
                const inlineMathExpression = inlineChunk.slice(1, -1);
                return <BlockMath key={`inline-${inlineIndex}`} math={inlineMathExpression} />;
              }

              if (inlineChunk.startsWith('$') && inlineChunk.endsWith('$')) {
                const inlineMathExpression = inlineChunk.slice(1, -1);
                return <InlineMath key={`inline-${inlineIndex}`} math={inlineMathExpression} />;
              }
              
              return (
                <ReactMarkdown key={`md-${inlineIndex}`}>
                  {inlineChunk.replace(/ /g, "&nbsp;")}
                </ReactMarkdown>
              );
            })}
          </span>
        );
      })}
    </div>
  );
}

function Generate() {
  const [transcription, setTranscription] = useState('');
  const [outputText, setOutputText] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [manualInput, setManualInput] = useState("")

  useEffect(() => {
    if (outputText) {
      const snippets = extractMathSnippets(outputText);
      setQuestions(generateQuestionsFromMath(snippets));
    } else {
      setQuestions([]);
    }
  }, [outputText]);

  const handleAudioUpload = (file) => {
    setAudioFile(file);
    setImageFile(null);
  };
const handleManualRender = async () => {
  if (!manualInput.trim()) {
    setError("Please paste some Markdown/KaTeX first.");
    return;
  }

  setIsLoading(true);
  setError(null);

  try {
    // call Gemini just like you do for images/audio
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text:
                    "Convert the following raw text into Markdown with KaTeX notation. " +
                    "Wrap inline math in $...$ and block math in $$...$$."
                },
                {
                  text: manualInput
                }
              ]
            }
          ],
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_HATE_SPEECH",  threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
          ],
          generationConfig: { maxOutputTokens: 2048, temperature: 0.0 }
        })
      }
    );

    if (!response.ok) {
      let err = await response.json();
      throw new Error(err.error?.message || response.statusText);
    }

    const data = await response.json();
    const converted = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!converted) throw new Error("No content in Gemini response.");

    // set both panels
    setTranscription(converted);
    setOutputText(converted);
  } catch (e) {
    console.error(e);
    setError(`Conversion failed: ${e.message}`);
  } finally {
    setIsLoading(false);
  }
};

  const handleImageUpload = async (file) => {
    if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      try {
        setIsLoading(true);
        setError(null);
        const text = await extractTextFromDocx(file);
        setTranscription(text);
        setOutputText(text);
        setManualInput(text);
      } catch (error) {
        setError(`Error processing Word document: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    } else {
      setImageFile(file);
      setAudioFile(null);
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result?.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const extractTextFromDocx = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const arrayBuffer = reader.result;
          const result = await mammoth.convertToMarkdown({ arrayBuffer: arrayBuffer });
          resolve(result.value);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const transcribeAudio = async () => {
    if (!audioFile) {
      setError('Please upload an audio file first.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const base64Audio = await fileToBase64(audioFile);
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: 
                    "Transcribe this audio to text with high accuracy, preserving all spoken content. When encountering mathematical notation or expressions, format them precisely using KaTeX notation according to these guidelines:\n\n" +
                    "When you identify mathematical expressions in the audio, convert verbal descriptions into formal mathematical notation. Format inline mathematics with single dollar signs ($...$) and use double dollar signs ($$...$$) for standalone equations.\n\n" +
                    "Use proper KaTeX escape sequences for all mathematical symbols and operations. For fractions, use the \\frac{numerator}{denominator} structure. For exponents, use the ^ symbol, and for subscripts, use the _ symbol.\n\n" +
                    "Apply appropriate variable naming conventions in the transcription. Capitalize variables in the context of sets or probability (like $X$, $Y$, $Z$ for random variables and $A$, $B$, $C$ for sets). Use lowercase letters for deterministic variables, parameters, or indices (like $x$, $y$, $z$).\n\n" +
                    "Represent all Greek letters with their proper escape sequences. Use \\alpha, \\beta, \\gamma, etc., for lowercase Greek letters, and \\Gamma, \\Delta, \\Theta, etc., for uppercase Greek letters.\n\n" +
                    "For probability and statistics notation, use $P(A)$ for probability, $E[X]$ for expected value, and $\\sigma^2$ or $Var(X)$ for variance.\n\n" +
                    "When encountering sentences that describe mathematical relationships, translate these verbal descriptions into precise KaTeX notation whenever possible." },
                  {
                    inlineData: {
                      mimeType: audioFile.type,
                      data: base64Audio,
                    },
                  },
                ],
              },
            ],
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
            ],
            generationConfig: {
              maxOutputTokens: 2048,
              temperature: 0.0
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error?.message || response.statusText);
      }

      const data = await response.json();
      if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        const transcribedText = data.candidates[0].content.parts[0].text;
        setTranscription(transcribedText);
        setOutputText(transcribedText);
        setManualInput(transcribedText);
      } else {
        throw new Error('Could not extract transcription from the API response.');
      }
    } catch (error) {
      console.error('Error during audio transcription:', error);
      setError(`Transcription failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const readImage = async () => {
    if (!imageFile) {
      setError('Please upload an image file first.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const base64Image = await fileToBase64(imageFile);
      const response = await fetch(

        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: "Translate the text from this image into a combination of Markdown syntax and KaTex syntax. Only provide the translation without any introductory text. Use Markdown syntax by default. When encountering mathematical notation or expressions, format them precisely using KaTeX notation according to these guidelines:\n\n" +
                    "When you identify mathematical expressions in the audio, convert verbal descriptions into formal mathematical notation. Format inline mathematics with single dollar signs ($...$) and use double dollar signs ($$...$$) for standalone equations.\n\n" + "Use proper KaTeX escape sequences for all mathematical symbols and operations. For fractions, use the \\frac{numerator}{denominator} structure. For exponents, use the ^ symbol, and for subscripts, use the _ symbol.\n\n" +
                    "Apply appropriate variable naming conventions in the transcription. Capitalize variables in the context of sets or probability (like $X$, $Y$, $Z$ for random variables and $A$, $B$, $C$ for sets). Use lowercase letters for deterministic variables, parameters, or indices (like $x$, $y$, $z$).\n\n" +
                    "Represent all Greek letters with their proper escape sequences. Use \\alpha, \\beta, \\gamma, etc., for lowercase Greek letters, and \\Gamma, \\Delta, \\Theta, etc., for uppercase Greek letters.\n\n" +
                    "For probability and statistics notation, use $P(A)$ for probability, $E[X]$ for expected value, and $\\sigma^2$ or $Var(X)$ for variance.\n\n" +
                    "When encountering sentences that describe mathematical relationships, translate these verbal descriptions into precise KaTeX notation whenever possible."
                  },
                  {
                    inlineData: {
                      mimeType: imageFile.type,
                      data: base64Image,
                    },
                  },
                ],
              },
            ],
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
            ],
            generationConfig: {
              maxOutputTokens: 2048,
              temperature: 0.0
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error?.message || response.statusText);
      }

      const data = await response.json();
      if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        const transcribedText = data.candidates[0].content.parts[0].text;
        setTranscription(transcribedText);
        setOutputText(transcribedText);
        setManualInput(transcribedText);
      } else {
        throw new Error('Could not extract interpretation from the API response.');
      }
    } catch (error) {
      console.error('Error during image interpretation:', error);
      setError(`Image processing failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const MarkdownWithMath = ({ text }) => {
    if (!text) return null;
    
    const chunks = text.split(/(\$\$[\s\S]*?\$\$)/g);
    
    return (
      <div>
        {chunks.map((chunk, index) => {
          if (chunk.startsWith('$$') && chunk.endsWith('$$')) {
            const mathExpression = chunk.slice(2, -2);
            return <BlockMath key={index} math={mathExpression} />;
          }
          
          const inlineChunks = chunk.split(/(\$[^\$]+?\$)/g);
          
          return (
            <span key={index}>
              {inlineChunks.map((inlineChunk, inlineIndex) => {
                if (inlineChunk.startsWith('$') && inlineChunk.endsWith('$')) {
                  const mathExpression = inlineChunk.slice(1, -1);
                  return <InlineMath key={`inline-${inlineIndex}`} math={mathExpression} />;
                }
                return (
                  <ReactMarkdown key={`md-${inlineIndex}`}>
                    {inlineChunk.replace(/ /g, "&nbsp;")}
                  </ReactMarkdown>
                );
              })}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="page-container background-2">
      <NavBar />

      <div className="line-spacer"></div>
      <div className="line-spacer"></div>

      <div className="row-container add-gaps">
        <div className="upload-section">
          <div className="secondary-text">
            <CameraIcon className="upload-icon" />
            <DocIcon className="upload-icon" />
          </div>
          <div className="file-input-container">
            <label className="file-input-label">
              Choose File
              <input 
                type="file" 
                className="file-input" 
                accept="image/*,.pdf,.docx"
                onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0])}
              />
            </label>
            <div className="file-name">
              {imageFile ? imageFile.name : "No file chosen"}
            </div>
          </div>
          <button 
            className={`process-button ${isLoading && imageFile ? 'processing' : ''}`} 
            onClick={readImage} 
            disabled={!imageFile || isLoading}
          >
            {isLoading && imageFile ? (
              <span className="button-loading">
                <span className="spinner"></span> Processing...
              </span>
            ) : 'Process Content'}
          </button>
        </div>

        <div className="upload-section">
          <div className="secondary-text">
            <MicIcon className="upload-icon" />
          </div>
          <div className="file-input-container">
            <label className="file-input-label">
              Choose File
              <input 
                type="file" 
                className="file-input" 
                accept="audio/*"
                onChange={(e) => e.target.files[0] && handleAudioUpload(e.target.files[0])}
              />
            </label>
            <div className="file-name">
              {audioFile ? audioFile.name : "No file chosen"}
            </div>
          </div>
          <button 
            className="process-button" 
            onClick={transcribeAudio} 
            disabled={!audioFile || isLoading}
          >
            {isLoading ? 'Transcribing...' : 'Transcribe Audio'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="line-spacer"></div>

      <div className="row-container add-gaps">
      <div className="secondary-text stretch-children">
  Markdown & KaTeX Input
  <textarea
    className="display-panel textarea-input"
    placeholder="Type or paste your Markdown/KaTeX here…"
    value={manualInput}
    onChange={e => setManualInput(e.target.value)}
  />
  <button
    className="process-button"
    onClick={handleManualRender}
    disabled={isLoading || !manualInput.trim()}
  >
    {isLoading ? "Converting…" : "Convert Text"}
  </button>
</div>

        <div className="secondary-text stretch-children">
          Render Output
          <div className="display-panel render-panel">
  <MarkdownWithMath text={outputText} />

  {questions.length > 0 && (
    <div className="questions-panel">
      <h3>Check Your Understanding</h3>
      <ol className="questions-list">
        {questions.map((q, i) => (
          <li key={i}>{q}</li>
        ))}
      </ol>
    </div>
  )}
</div>

        </div>
      </div>
    </div>
    
  );
}

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<About />} />
        <Route path="/about" element={<About />} />
        <Route path="/generate" element={<Generate />} />
      </Routes>
    </div>
  );
}

export default App;