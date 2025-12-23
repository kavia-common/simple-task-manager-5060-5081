import React, { useState, useEffect } from 'react';
import './App.css';
import TodoApp from './TodoApp';

// PUBLIC_INTERFACE
function App() {
  // Retain theme toggle for demonstration, but embed TodoApp as main UI
  const [theme, setTheme] = useState('light');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="App">
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
      </button>
      <TodoApp />
    </div>
  );
}

export default App;
