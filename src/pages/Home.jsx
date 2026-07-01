import React from 'react';
import Navbar from '../components/Navbar';
import RAGDiagram from '../components/RAGDiagram';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      <Navbar />
      <div className="content-container">
        <h1 className="hero-heading">
          RAG Knowledge System — <span className="highlight">Real World Use Case</span>
        </h1>
        <p className="hero-subtext">
          Instantly answer employee questions from your company documentation without manual searching.
        </p>
        <RAGDiagram />
      </div>
    </div>
  );
};

export default Home;
