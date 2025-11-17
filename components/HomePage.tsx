import React from 'react';
import WelcomeHeader from './WelcomeHeader';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-start pt-8" style={{minHeight: 'calc(100vh - 200px)'}}>
      <WelcomeHeader />
    </div>
  );
};

export default HomePage;