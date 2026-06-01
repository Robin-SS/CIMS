import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Coffee, Lock, User, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!username || !password) {
      setError('Please fill out all fields.');
      setIsSubmitting(false);
      return;
    }

    const result = await login(username, password);

    if (!result.success) {
      setError(result.error || 'Invalid credentials');
      setIsSubmitting(false);
    } else {
      // Temporary alert to prove it worked until we set up routes!
      alert('Login successful! Welcome back.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-stone-200">
        
        {/* Header/Banner Section */}
        <div className="bg-amber-700 p-8 text-center text-white flex flex-col items-center">
          <div className="bg-amber-600 p-3 rounded-full mb-3 shadow-inner">
            <Coffee className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-wide">Cafe IMS & POS</h1>
          <p className="text-amber-100 text-sm mt-1">Management & Terminal Portal</p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* Error Message Alert */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded flex items-start space-x-2 text-red-700 text-sm animate-shake">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Username Input Field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider block">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g., admin01"
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Password Input Field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider block">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-amber-700 hover:bg-amber-800 text-white font-medium py-3 rounded-xl transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isSubmitting ? 'Verifying Account...' : 'Sign In to Terminal'}
          </button>
        </form>

        {/* Footer info text */}
        <div className="bg-stone-50 px-8 py-4 border-t border-stone-100 text-center">
          <p className="text-xs text-stone-400">
            Authorized Personnel Access Only.
          </p>
        </div>

      </div>
    </div>
  );
}