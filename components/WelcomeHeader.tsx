import React, { useState, useEffect } from 'react';

/**
 * A welcome header component that displays the current date, time, and a greeting.
 */
const WelcomeHeader: React.FC = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000); // Update every second

    // Cleanup interval on component unmount
    return () => clearInterval(timer);
  }, []);

  /**
   * Formats the date and time in English.
   * e.g., "Monday, 17 November 15:25:10"
   */
  const formatDateTime = (date: Date): string => {
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const weekday = weekdays[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

    return `${weekday}, ${day} ${month} ${time}`;
  };

  /**
   * Returns a greeting based on the time of day.
   */
  const getGreeting = (date: Date): string => {
    const hour = date.getHours();
    if (hour >= 5 && hour < 12) {
      return "Good Morning";
    } else if (hour >= 12 && hour < 18) {
      return "Good Afternoon";
    } else {
      return "Good Night";
    }
  };

  // Static name for the greeting message
  const name = "FOZILBEK";

  return (
    <div className="bg-white dark:bg-zinc-800/50 rounded-2xl shadow-lg p-8 w-full text-center border border-zinc-200 dark:border-zinc-700/50">
      <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-300">{formatDateTime(currentDateTime)}</p>
      <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mt-2 tracking-wide">{getGreeting(currentDateTime)}, {name}</h1>
    </div>
  );
};

export default WelcomeHeader;
