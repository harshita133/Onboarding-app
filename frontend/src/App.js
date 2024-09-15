import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Import React Router components
import OnBoardingSteps from './OnboardingSteps'; // Onboarding steps component
import Dashboard from './Dashboard'; // Create a Dashboard component
import Home from './Home';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/hello')
      .then((response) => response.json())
      .then((data) => setMessage(data.message))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  return (
    <Router>
      <div className="App">

        {/* Define your routes */}
        <Routes>
          {/* Onboarding Steps route (default route) */}
          <Route path="/" element={<Home />} />

          {/* Dashboard route */}
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
