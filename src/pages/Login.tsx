import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LoginUI from '../components/LoginUI';

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

