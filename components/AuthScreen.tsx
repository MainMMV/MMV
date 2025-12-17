
import React, { useState, useEffect, useMemo } from 'react';
import { LockIcon, ShieldIcon, UnlockIcon, GoogleIcon, BackspaceIcon } from './Icons';
import { googleAuth } from '../services/google';

interface AuthScreenProps {
  onAuthenticated: (pin: string, googleUser?: any) => void;
  savedPin: string | null;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated, savedPin }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isSetupMode, setIsSetupMode] = useState(!savedPin);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Detect if device is likely a touch device (Mobile/Tablet)
  const isTouchDevice = useMemo(() => {
    return (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
  }, []);

  const handlePinSubmit = () => {
    setError('');

    if (isSetupMode) {
      if (confirmPin && pin !== confirmPin) {
        setError("PINs do not match");
        setShake(true); setPin(''); setConfirmPin('');
        return;
      }
      if (pin.length < 4) {
        setError("PIN must be at least 4 digits");
        setShake(true);
        return;
      }
      if (confirmPin === '') {
          setConfirmPin(pin);
          setPin('');
          return;
      }
      onAuthenticated(pin);
    } else {
      if (pin === savedPin) {
        onAuthenticated(pin);
      } else {
        setError("Incorrect PIN");
        setPin('');
        setShake(true);
      }
    }
  };

  useEffect(() => {
    if (shake) {
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [shake]);

  const handleDigit = (digit: string) => {
      setError('');
      if (pin.length < 8) {
          setPin(prev => prev + digit);
      }
  };

  const handleBackspace = () => {
      setPin(prev => prev.slice(0, -1));
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
        const user = await googleAuth.signIn();
        onAuthenticated(savedPin || "0625", user);
    } catch (err) {
        setError("Google Login failed");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4 font-sans transition-colors duration-300 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>

      <div className={`w-full max-w-sm bg-white/10 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl p-8 border border-white/10 flex flex-col items-center relative z-10 transition-all duration-300 ${shake ? 'animate-shake' : ''}`}>
        
        <div className="mb-6 p-4 bg-white/5 rounded-3xl shadow-inner border border-white/5">
            {isSetupMode ? <ShieldIcon className="w-10 h-10 text-emerald-400" /> : <LockIcon className="w-10 h-10 text-indigo-400" />}
        </div>

        <h1 className="text-2xl font-black text-white mb-1 tracking-tight">
          {isSetupMode ? (confirmPin ? "Verify PIN" : "Setup Secure PIN") : "Security Check"}
        </h1>
        <p className="text-gray-400 text-center mb-8 text-xs max-w-[200px] leading-relaxed">
          {isSetupMode 
            ? (confirmPin ? "Re-enter to confirm." : "Create a 4-8 digit access code.") 
            : "Authorized personnel only."}
        </p>

        {/* Display for PIN dots */}
        <div className="flex gap-4 mb-10 h-4 items-center">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${pin.length > i ? 'bg-indigo-400 border-indigo-400 scale-125 shadow-[0_0_10px_rgba(129,140,248,0.5)]' : 'border-gray-600 scale-100'}`}></div>
            ))}
        </div>

        {error && (
          <p className="text-rose-400 text-[10px] text-center font-bold bg-rose-500/10 px-4 py-2 rounded-xl mb-8 border border-rose-500/20 w-full animate-fade-in">{error}</p>
        )}

        {/* Numeric Keypad - Shows on Mobile/Tablet or based on logic */}
        {isTouchDevice ? (
            <div className="grid grid-cols-3 gap-6 mb-10 w-full">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map(d => (
                    <button key={d} onClick={() => handleDigit(d)} className="w-16 h-16 rounded-full bg-white/5 text-2xl font-bold text-white flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all mx-auto border border-white/5">{d}</button>
                ))}
                <button onClick={handleBackspace} className="w-16 h-16 rounded-full flex items-center justify-center text-gray-500 hover:text-rose-400 active:scale-90 transition-all mx-auto"><BackspaceIcon className="w-8 h-8" /></button>
                <button onClick={() => handleDigit("0")} className="w-16 h-16 rounded-full bg-white/5 text-2xl font-bold text-white flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all mx-auto border border-white/5">0</button>
                <button 
                    onClick={handlePinSubmit} 
                    className="w-16 h-16 rounded-full bg-indigo-500 text-white flex items-center justify-center hover:bg-indigo-600 active:scale-90 transition-all mx-auto shadow-lg shadow-indigo-500/30"
                >
                    <UnlockIcon className="w-6 h-6" />
                </button>
            </div>
        ) : (
            <div className="w-full space-y-4 mb-10">
                <input
                    type="password"
                    value={pin}
                    onChange={(e) => { setError(''); setPin(e.target.value.replace(/\D/g, '').slice(0, 8)); }}
                    onKeyDown={(e) => { if(e.key === 'Enter') handlePinSubmit(); }}
                    className="w-full text-center text-3xl tracking-[0.5em] py-4 rounded-2xl bg-white/5 border border-white/10 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-white transition-all font-bold shadow-inner"
                    inputMode="numeric" autoFocus maxLength={8}
                />
                <button onClick={handlePinSubmit} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-900/20 transition-all active:scale-95 flex items-center justify-center gap-3">
                    {isSetupMode ? (confirmPin ? "CONFIRM" : "CONTINUE") : "UNLOCK SYSTEM"}
                </button>
            </div>
        )}

        <div className="w-full flex flex-col items-center gap-5 border-t border-white/5 pt-8">
            <button 
                onClick={handleGoogleLogin} 
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-4 px-4 bg-white text-[#0f172a] rounded-2xl text-sm font-black hover:bg-gray-100 transition-all shadow-xl active:scale-95 disabled:opacity-50"
            >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-[#0f172a]/20 border-t-[#0f172a] rounded-full animate-spin"></div>
                ) : (
                    <GoogleIcon className="w-5 h-5" />
                )}
                SIGN IN WITH GOOGLE
            </button>
            {!isSetupMode && (
                <button onClick={() => { if(window.confirm("Format entire system and start over?")) { localStorage.clear(); window.location.reload(); } }} className="text-[10px] text-gray-600 hover:text-rose-400 uppercase tracking-[0.2em] font-black transition-colors">Factory Reset</button>
            )}
        </div>
      </div>
      <style>{`
        @keyframes shake {
            10%, 90% { transform: translate3d(-1px, 0, 0); }
            20%, 80% { transform: translate3d(2px, 0, 0); }
            30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
            40%, 60% { transform: translate3d(4px, 0, 0); }
        }
        .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default AuthScreen;
