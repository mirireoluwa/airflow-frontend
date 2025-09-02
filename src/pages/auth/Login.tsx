import { useState } from 'react';
import { useAirflow } from '../../context/AirflowContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';

export function Login() {
  const { login } = useAirflow();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      login({ email, password });
      navigate('/');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card variant="flat" className="w-full max-w-md">
        <CardContent className="p-6 pt-6">
          <div className="text-center mb-6">
            <img src="/Airtel/Airtel_ido6_-mlV0_5.svg" alt="Airtel" className="h-10 w-auto mx-auto mb-2" />
            <h1 className="text-2xl font-bold text-gradient">Welcome back</h1>
            <p className="text-sm text-gray-600">Log in to continue</p>
          </div>
          <form className="space-y-4" onSubmit={onSubmit}>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@airtel.com"
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4 m-4 mt-2" /> : <Eye className="h-4 w-4 m-4 mt-2" />}
              </button>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full">Log In</Button>
            <div className="text-right">
              <button type="button" onClick={() => setForgotOpen(true)} className="text-xs text-gray-500 hover:text-gray-700 underline mt-1">Forgot password?</button>
            </div>
          </form>
          <p className="text-sm text-gray-600 text-center mt-4">
            Don't have an account? <Link to="/signup" className="text-red-600 font-medium">Sign up</Link>
          </p>
        </CardContent>
      </Card>

      {/* Forgot Password Modal */}
      <Modal isOpen={forgotOpen} onClose={() => setForgotOpen(false)} title="Reset password">
        {sent ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-700">If an account exists for {resetEmail}, you’ll receive reset instructions shortly.</p>
            <Button className="w-full" onClick={() => setForgotOpen(false)}>Close</Button>
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              // demo: mark as sent and store a token
              const token = Math.random().toString(36).slice(2);
              localStorage.setItem('airflow_reset_token', JSON.stringify({ email: resetEmail, token, createdAt: Date.now() }));
              setSent(true);
            }}
          >
            <Input
              label="Email"
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="you@airtel.com"
            />
            <Button type="submit" className="w-full">Send reset link</Button>
          </form>
        )}
      </Modal>
    </div>
  );
}


