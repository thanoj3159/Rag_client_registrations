import React from 'react';
import { MessageSquare } from 'lucide-react';
import './HeroCard.css';

const HeroCard = () => {
  return (
    <div className="hero-container">
      <div className="hero-card">
        <div className="icon-container">
          <MessageSquare className="chat-icon" size={32} />
        </div>
        <h2 className="hero-title">Testing update</h2>
        <p className="hero-subtitle">Ask anything to get started</p>
      </div>
    </div>
  );
};

export default HeroCard;
