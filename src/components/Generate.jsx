import React, { useState, useRef, useEffect } from 'react';
import { storage, db }                     from '../firebase';              // one import of storage + db
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import NavBar        from './NavBar';
import CameraIcon    from './CameraIcon';
import DocIcon       from './DocIcon';
import '../App.css';

export default function Generate() {
  const [uploading, setUploading] = useState(false);
  const [videoURL, setVideoURL]   = useState('');
  const [jobId, setJobId]         = useState(null);
  const [status, setStatus]       = useState('');
  const [summary, setSummary]     = useState('');
  const [notes, setNotes]         = useState([]);
  const fileInputRef = useRef();

  // User clicks → pick file
  const onChooseFile = () => fileInputRef.current.click();

  // After picking → upload & enqueue job
  const onFileSelected = async e => {
    const file = e.target.files[0];
    if (!file) return;

    const id = `${file.name}-${Date.now()}`;
    setJobId(id);
    setUploading(true);

    // 1️⃣ upload to Storage
    const vidRef = ref(storage, `videos/${id}.mp4`);
    const task  = uploadBytesResumable(vidRef, file);

    task.on(
      'state_changed',
      null,
      err => {
        console.error(err);
        setUploading(false);
      },
      async () => {
        const url = await getDownloadURL(vidRef);
        setVideoURL(url);

        // 2️⃣ enqueue job in Firestore
        await setDoc(doc(db, 'videoJobs', id), {
          status:    'queued',
          videoURL:  url,
          createdAt: serverTimestamp()
        });
        setUploading(false);
      }
    );
  };

  // Listen for backend updates (status, summary, notes)
  useEffect(() => {
    if (!jobId) return;
    const unsub = onSnapshot(doc(db, 'videoJobs', jobId), snap => {
      const data = snap.data() || {};
      setStatus(data.status || '');
      if (data.status === 'done') {
        setSummary(data.summary || '');
        setNotes(data.notes || []);
      }
    });
    return unsub;
  }, [jobId]);

  return (
    <div className="page-container background-2">
      <NavBar />
      <div className="line-spacer" /><div className="line-spacer" />

      {/* hidden file input */}
      <input
        type="file"
        accept="video/*"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={onFileSelected}
      />

      <div className="left-half-frame">
        <div className="row-container add-gaps">
          <div className="col-container secondary-text">
            Upload Video
            <div className="upload-button" onClick={onChooseFile}>
              <CameraIcon />
            </div>
          </div>
          <div className="col-container secondary-text">
            Or Upload Image
            <div className="upload-button">
              <DocIcon />
            </div>
          </div>
        </div>
      </div>

      <div className="line-spacer" />
      {uploading && <p>Uploading…</p>}
      {videoURL  && <p>Stored at: <a href={videoURL}>{videoURL}</a></p>}
      {status    && <p>Status: {status}</p>}

      {status === 'done' && (
        <>
          <h3>Summary</h3>
          <p>{summary}</p>
          <h3>Notes</h3>
          <ul>{notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
        </>
      )}
    </div>
  );
}
