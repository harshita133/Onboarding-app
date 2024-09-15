//to make sure that user does not upload same file to step 3 as done in step 2
// ParentComponent.js
import React, { useState } from 'react';
import { message } from 'antd';
import SecondOnboardingStep from './SecondOnboardingStep';
import ThirdOnboardingStep from './ThirdOnboardingStep';

const ParentComponent = () => {
  const [file1, setFile1] = useState(null); // State for file from SecondOnboardingStep
  const [file2, setFile2] = useState(null); // State for file from ThirdOnboardingStep

  // Function to check if a file is the same as the already uploaded one
  const isSameFile = (file1, file2) => {
    return file1 && file2 && file1.name === file2.name && file1.size === file2.size;
  };

  // Handle first file upload (SecondOnboardingStep)
  const handleUpload1 = (file) => {
    setFile1(file);
    message.success(`${file.name} uploaded successfully in first upload.`);
  };

  // Handle second file upload (ThirdOnboardingStep) and check for duplicates
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
