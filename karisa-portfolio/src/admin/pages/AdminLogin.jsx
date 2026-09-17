import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const next = {};
    if (!email) next.email = 'Enter your email address.';
    else if (!EMAIL_RE.test(email)) next.email = 'That does not look like an email address.';
    if (!password) next.password = 'Enter your password.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (!supabase) {
      setErrors({ submit: 'The admin is not configured on this deployment.' });
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data?.session?.user) navigate('/admin');
    } catch (error) {
      setErrors({ submit: error?.message || 'Sign-in failed. Try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cloth-100 px-4 py-12 text-mark-900">
      <div className="w-full max-w-sm">
        <div className="hem">
          <h1 className="font-display text-3xl font-bold tracking-[-0.03em]">Sign in</h1>
          <p className="mt-2 text-sm text-mark-600">The private side of voyani.tech.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
          <div>
            <label htmlFor="email" className="field-label">Email address</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={errors.email ? 'true' : undefined}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className="field"
            />
            {errors.email && <p id="email-error" className="mt-2 text-sm text-alarm">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="field-label">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={errors.password ? 'true' : undefined}
              aria-describedby={errors.password ? 'password-error' : undefined}
              className="field"
            />
            {errors.password && <p id="password-error" className="mt-2 text-sm text-alarm">{errors.password}</p>}
          </div>

          {errors.submit && (
            <p role="alert" className="border border-alarm px-4 py-3 text-sm text-alarm">{errors.submit}</p>
          )}

          <button type="submit" disabled={isLoading} className="btn-pindo w-full disabled:cursor-not-allowed disabled:bg-cloth-400">
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-8 text-sm">
          <Link to="/" className="link">Back to the site</Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
