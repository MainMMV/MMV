import React, { useState, useEffect } from 'react';
import { LockIcon, UnlockIcon, ShieldIcon } from './Icons';

interface AuthScreenProps {
  onAuthenticated: (pin: string) => void;
  savedPin: string;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated, savedPin }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (pin === savedPin) {
      onAuthenticated(pin);
    } else {
      setError("Incorrect PIN");
      setPin('');
      setShake(true);
    }
  };

  useEffect(() => {
      if (shake) {
          const timer = setTimeout(() => setShake(false), 500);
          return () => clearTimeout(timer);
      }
  }, [shake]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 font-sans transition-colors duration-300 relative overflow-hidden">
      
      <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse delay-700"></div>

      <div className={`w-full max-w-md bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50 dark:border-gray-700/50 flex flex-col items-center relative z-10 transition-transform duration-300 ${shake ? 'translate-x-[-5px] translate-x-[5px]' : ''}`} style={shake ? {animation: 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both'} : {}}>
        
        <style>{`
            @keyframes shake {
                10%, 90% { transform: translate3d(-1px, 0, 0); }
                20%, 80% { transform: translate3d(2px, 0, 0); }
                30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                40%, 60% { transform: translate3d(4px, 0, 0); }
            }
        `}</style>

        <div className="mb-6 p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-inner border border-gray-100 dark:border-gray-700 z-10">
            <LockIcon className="w-10 h-10 text-indigo-500" />
        </div>

        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 z-10 tracking-tight">
          Welcome Back
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-8 text-sm z-10 max-w-xs leading-relaxed">
          Enter your secure system PIN to access your dashboard.
        </p>

        <form onSubmit={handlePinSubmit} className="w-full space-y-5 z-10">
          <div className="relative group">
              <input
                type="password"
                value={pin}
                onChange={(e) => { setError(''); setPin(e.target.value); }}
                placeholder="Enter PIN"
                className="w-full text-center text-3xl tracking-[0.5em] py-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-gray-900 dark:text-white transition-all placeholder:text-gray-300 dark:placeholder:text-gray-700 font-bold shadow-sm"
                inputMode="numeric"
                autoFocus
                maxLength={8}
              />
          </div>
          
          {error && (
            <p className="text-rose-500 text-sm text-center font-bold bg-rose-50 dark:bg-rose-900/20 py-2 rounded-lg animate-pulse border border-rose-100 dark:border-rose-900/30">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 text-white dark:text-gray-900 rounded-2xl font-bold text-lg shadow-xl shadow-gray-200 dark:shadow-none transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 active:scale-95"
          >
            Unlock Dashboard
            <UnlockIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthScreen;