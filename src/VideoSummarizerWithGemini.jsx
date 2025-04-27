import React, { useState, useEffect } from 'react';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import { Whisper } from 'whisper-wasm';

export default function VideoSummarizerWithGemini() {
  const [apiKey, setApiKey]       = useState(process.env.REACT_APP_GEMINI_KEY || '');
  const [ffmpeg, setFfmpeg]       = useState(null);
  const [whisper, setWhisper]     = useState(null);
  const [file, setFile]           = useState(null);
  const [status, setStatus]       = useState('');
  const [summary, setSummary]     = useState('');
  const [notes, setNotes]         = useState([]);

  useEffect(() => {
    (async () => {
      const ff = createFFmpeg({ log: true });
      await ff.load();
      setFfmpeg(ff);

      const wh = new Whisper();
      await wh.load();
      setWhisper(wh);
    })();
  }, []);

  const callGemini = async (transcript) => {
    const model = 'gemini-2.0-flash';
    const url   = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{
        parts: [{
          text: `
Given this transcript,
1) Provide a 2–3 sentence summary prefixed "Summary:"
2) Then bullet-point the key ideas under "Notes:"

Transcript:
"""${transcript}"""
          `
        }]
      }]
    };

    const res = await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload)
    });
    const json = await res.json();
    const raw  = json.response.candidates[0].content.parts[0].text;

    // parse
    const lines     = raw.split(/\r?\n/).filter(l => l.trim());
    const sumLine   = lines.find(l => /^Summary[:\-]/i.test(l)) || '';
    const noteLines = lines.filter(l => /^[-•]/.test(l));

    return {
      summary: sumLine.replace(/^Summary[:\-]\s*/i, ''),
      notes:   noteLines.map(l => l.replace(/^[-•]\s*/, ''))
    };
  };

  const onFileChange = e => setFile(e.target.files[0]);

  const onRun = async () => {
    if (!file || !ffmpeg || !whisper || !apiKey) return;
    setStatus('⏳ extracting audio…');

    // extract audio
    ffmpeg.FS('writeFile', 'in.mp4', await fetchFile(file));
    await ffmpeg.run('-i', 'in.mp4', '-ac', '1', '-ar', '16000', 'out.wav');
    const audioData = ffmpeg.FS('readFile', 'out.wav');

    // transcribe
    setStatus('⏳ transcribing audio…');
    const { text: transcript } = await whisper.transcribe(audioData.buffer);

    // summarize via Gemini
    setStatus('⏳ summarizing & making notes…');
    const { summary, notes } = await callGemini(transcript);

    setSummary(summary);
    setNotes(notes);
    setStatus('✅ done!');
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto' }}>
      <h2>Video → Summary & Notes</h2>

      <label>
        Gemini API Key
        <input
          type="password"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          style={{ width: '100%' }}
        />
      </label>

      <input
        type="file"
        accept="video/*"
        onChange={onFileChange}
        style={{ marginTop: 12 }}
      />

      <button
        onClick={onRun}
        disabled={!file || !apiKey || !ffmpeg || !whisper}
        style={{ marginTop: 12 }}
      >
        Run
      </button>

      <p><em>{status}</em></p>

      {summary && (
        <>
          <h3>Summary</h3>
          <p>{summary}</p>

          <h3>Notes</h3>
          <ul>{notes.map((n,i)=><li key={i}>{n}</li>)}</ul>
        </>
      )}
    </div>
  );
}
