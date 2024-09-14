import React, { useState, useEffect } from 'react';
import OnBoardingSteps from './OnboardingSteps';


function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/hello')
      .then((response) => response.json())
      .then((data) => setMessage(data.message))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  return (
    <div className="App">
      <OnBoardingSteps />
    </div>
  );
}

export default App;
