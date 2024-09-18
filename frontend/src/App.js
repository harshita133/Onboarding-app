import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Import React Router components
import OnBoardingSteps from './OnboardingSteps'; // Onboarding steps component
import Dashboard from './Dashboard'; // Create a Dashboard component
import Home from './Home';

function App() {

  // useEffect(() => {
  //   // Fetch data from your API on port 5000
  //   fetch(`http://localhost:5000/api/hello`)
  //     .then((response) => {
  //       if (!response.ok) {
  //         throw new Error('Network response was not ok');
  //       }
  //       return response.json();
  //     })
  //     .then((data) => {
  //         console.log("first Time table created")
  //     })
  //     .catch((error) => {
  //         console.log("error")
  //     });
  // }, []); 



  return (
    <Router>
      <div className="App">
        {/* Define your routes */}
        <Routes>
          {/* Home route (default route) */}
          <Route path="/" element={<Home />} />

          {/* Dashboard route with dynamic firstName */}
          <Route path="/dashboard/:firstName" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
