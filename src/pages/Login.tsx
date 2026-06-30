import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LoginUI from '../components/LoginUI';
import { ActivityService } from '../services/ActivityService';
import { toast } from 'sonner';

export default function Login() {
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const now = Date.now();

    // Check if account is locked
    if (lockedUntil && now < lockedUntil) {
      const secondsLeft = Math.ceil((lockedUntil - now) / 1000);
      setError(
        `Too many failed attempts. Please try again in ${secondsLeft} second${
          secondsLeft !== 1 ? 's' : ''
        }.`
      );
      return;
    }

    setError(null);
    setIsSubmitting(true);

    // Validation
    if (!username && !password) {
      setError('Invalid Credentials.');
      setIsSubmitting(false);
      return;
    }

    if (!username) {
      setError('Username is required.');
      setIsSubmitting(false);
      return;
    }

    if (!password) {
      setError('Password is required.');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await login(username, password);

      if (!result.success) {
        const newAttempts = failedAttempts + 1;

        if (newAttempts >= 5) {
          setLockedUntil(Date.now() + 10000); // 10 seconds
          setFailedAttempts(0);

          setError(
            'Too many failed attempts. Login has been locked for 10 seconds.'
          );
        } else {
          setFailedAttempts(newAttempts);

          setError(
            `${result.error || 'Invalid credentials'}`
          );
        }

        setIsSubmitting(false);
        return;
      }

      // Successful login
      setFailedAttempts(0);
      setLockedUntil(null);
      setError(null);

      if (result.user) {
        await ActivityService.logAction(result.user.id, 'Logged in', 'User Authentication');
      }
      
     toast.success("Login successful! Welcome back.");
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LoginUI
      onSubmit={handleSubmit}
      username={username}
      setUsername={setUsername}
      password={password}
      setPassword={setPassword}
      error={error}
      isSubmitting={isSubmitting}
    />
  );
}