import React from 'react';

/**
 * A simple, static header component for the application.
 * Displays the main title and a subtitle.
 */
const Header: React.FC = () => {
  return (
    <header className="mb-8">
      <h1 className="text-4xl font-bold text-white tracking-tight">Salary & Goal Tracker</h1>
      <p className="text-gray-400 mt-2 text-lg">
        Monitor your monthly income and track your goals seamlessly.
      </p>
    </header>
  );
};

export default Header;
