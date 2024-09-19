
import React, { useState } from 'react';
import { message } from 'antd';
import SecondOnboardingStep from './SecondOnboardingStep';
import ThirdOnboardingStep from './ThirdOnboardingStep';

const ParentComponent = () => {
  const [file1, setFile1] = useState(null); 
  const [file2, setFile2] = useState(null); 

  
  const isSameFile = (file1, file2) => {
    return file1 && file2 && file1.name === file2.name && file1.size === file2.size;
  };

  
  const handleUpload1 = (file) => {
    setFile1(file);
    message.success(`${file.name} uploaded successfully in first upload.`);
  };

  
  const handleUpload2 = (file) => {
    if (isSameFile(file1, file)) {
      message.error("You cannot upload the same file twice!");
      return;
    }
    setFile2(file);
    message.success(`${file.name} uploaded successfully in second upload.`);
  };

  return (
    <div>
      <SecondOnboardingStep handleUpload={handleUpload1} />
      <ThirdOnboardingStep handleUpload={handleUpload2} />
    </div>
  );
};

export default ParentComponent;
