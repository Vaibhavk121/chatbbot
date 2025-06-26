import React from 'react';
import { FaPen } from 'react-icons/fa';
import './Navbar.css';

const Navbar = ({ style, setStyle }) => {
  const toggleStyle = () => {
    setStyle(prev => prev === 'formal' ? 'casual' : 'formal');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <FaPen className="navbar-icon" />
        <h1>AI Chat Rewriter</h1>
      </div>
      <div className="navbar-controls">
        <div className="style-toggle">
          <span className={style === 'formal' ? 'active' : ''}>Formal</span>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={style === 'casual'} 
              onChange={toggleStyle} 
            />
            <span className="slider round"></span>
          </label>
          <span className={style === 'casual' ? 'active' : ''}>Casual</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;