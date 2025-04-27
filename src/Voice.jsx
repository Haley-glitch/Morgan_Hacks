import React, { useState, useEffect } from "react";

var a;
const AudioPlay = ({ onAudioUploaded }) => {
  const [buttonName, setButtonName] = useState("Play");
  const [audio, setAudio] = useState();
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (a) {
      a.pause();
      a = null;
      setButtonName("Play");
    }
    if (audio) {
      a = new Audio(audio);
      a.onended = () => {
        setButtonName("Play");
      };
    }
  }, [audio]);

  const handleClick = () => {
    if (buttonName === "Play") {
      if (audio) {
        a.play();
        setButtonName("Pause");
      } else if (selectedFile) {
        // Optionally play if a file is selected but not yet playing
        setAudio(URL.createObjectURL(selectedFile));
        setButtonName("Pause");
      } else {
        alert("Please upload an audio file.");
      }
    } else {
      a.pause();
      setButtonName("Play");
    }
  };

  const addFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setAudio(URL.createObjectURL(file)); // Preview the audio
      if (onAudioUploaded) {
        onAudioUploaded(file); // Pass the file to the parent component
      }
    }
  };

  return (
    <div>
      <button onClick={handleClick}>{buttonName}</button>
      <input type="file" accept="audio/*" onChange={addFile} />
    </div>
  );
};

export default AudioPlay;