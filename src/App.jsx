import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ApplicationForm from './pages/ApplicationForm';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/application" element={<ApplicationForm />} />
      </Routes>
    </Router>
  );
}

export default App;
