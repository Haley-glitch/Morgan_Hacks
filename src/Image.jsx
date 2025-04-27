import React, { useState, useEffect } from "react";

const ImageUpload = ({ onImageUploaded }) => {
  const [image, setImage] = useState();
  const [selectedFile, setSelectedFile] = useState(null);

  const addFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImage(URL.createObjectURL(file));
      if (onImageUploaded) {
        onImageUploaded(file); // Pass the file to the parent component
      }
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={addFile} />
    </div>
  );
};

export default ImageUpload;