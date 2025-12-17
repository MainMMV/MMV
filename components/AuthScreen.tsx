
import React, { useState, useEffect } from 'react';
import { LockIcon, UnlockIcon, ShieldIcon } from './Icons';

interface AuthScreenProps {
  onAuthenticated: (pin: string) => void;
  savedPin: string | null;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated, savedPin }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isSetupMode, setIsSetupMode] = useState(!savedPin);
  const [error, setError] = useState('');

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSetupMode) {
      if (confirmPin && pin !== confirmPin) {
        setError("PINs do not match");
        return;
      }
      if (pin.length < 4) {
        setError("PIN must be at least 4 digits");
        return;
      }
      if (!confirmPin) {
          // Move to confirmation step if UI handled differently, but here we expect both filled
          // actually let's simplify: simple state check
      }
      onAuthenticated(pin); // This will save the PIN in App.tsx
    } else {
      if (pin === savedPin) {
        onAuthenticated(pin);
      } else {
        setError("Incorrect PIN");
        setPin('');
      }
    }
  };

  const handleNumClick = (num: string) => {
      if (error) setError('');
      if (isSetupMode && !confirmPin && pin.length >= 4 && !confirmPin) {
          // If setup and first PIN done, maybe focus confirm? 
          // For simplicity, just appending to current focused field logic logic is complex without refs.
          // Let's just use the keypad for the 'active' concept conceptually or just simple inputs.
          // We'll stick to a simple input field for now to avoid complexity.
      }
      
      // Basic keypad logic for the single active input (simplified for this demo)
      if (isSetupMode && pin.length >= 4) {
           setConfirmPin(prev => prev + num);
      } else {
           setPin(prev => prev + num);
      }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 font-sans">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700 flex flex-col items-center">
        
        <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-full">
            {isSetupMode ? <ShieldIcon className="w-12 h-12 text-emerald-600 dark:text-emerald-400" /> : <LockIcon className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {isSetupMode ? "Set App Lock" : "Welcome Back"}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-8 text-sm">
          {isSetupMode 
            ? "Create a secure PIN to protect your financial data." 
            : "Enter your PIN to access your dashboard."}
        </p>

        <form onSubmit={handlePinSubmit} className="w-full space-y-4">
          <input
            type="password"
            value={pin}
            onChange={(e) => { setError(''); setPin(e.target.value); }}
            placeholder={isSetupMode ? "Enter new PIN" : "Enter PIN"}
            className="w-full text-center text-2xl tracking-widest py-3 rounded-xl bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white transition-all"
            inputMode="numeric"
            autoFocus
          />
          
          {isSetupMode && (
            <input
              type="password"
              value={confirmPin}
              onChange={(e) => { setError(''); setConfirmPin(e.target.value); }}
              placeholder="Confirm PIN"
              className="w-full text-center text-2xl tracking-widest py-3 rounded-xl bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white transition-all animate-fade-in"
              inputMode="numeric"
            />
          )}

          {error && (
            <p className="text-rose-500 text-sm text-center font-medium animate-pulse">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-500/30 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            {isSetupMode ? "Set PIN" : "Unlock"} <UnlockIcon className="w-5 h-5" />
          </button>
        </form>
        
        {!isSetupMode && (
            <button onClick={() => { if(window.confirm("Resetting will clear local data. Continue?")) { localStorage.clear(); window.location.reload(); } }} className="mt-6 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 underline">
                Forgot PIN? Reset App
            </button>
        )}
      </div>
    </div>
  );
};

export default AuthScreen;
