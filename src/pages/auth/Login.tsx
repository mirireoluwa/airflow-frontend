import { useState } from 'react';
import { useAirflow } from '../../context/AirflowContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

export function Login() {
  const { login } = useAirflow();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      console.log('Attempting login with:', { email, password });
      login({ email, password });
      console.log('Login successful, navigating to dashboard');
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Background image */}
      <div className="absolute inset-0">
        <img 
          src="/kaleidico-26MJGnCM0Wc-unsplash.jpg" 
          alt="Workspace" 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Centered Login Form */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-4">
        <Card variant="flat" className="w-full max-w-md bg-white/95 backdrop-blur-sm">
          <CardContent className="p-6 pt-6">
          <div className="text-center mb-8">
            <img 
              src="/Airtel/Airtel_ido6_-mlV0_5.svg" 
              alt="Airtel" 
              className="h-12 w-auto mx-auto mb-4" 
            />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
            <p className="text-gray-600">Sign in to your account to continue</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="relative">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@airtel.com"
                required
              />
            </div>

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 z-10 p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Link 
                to="/forgot-password" 
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              variant="apple-primary"
              disabled={isLoading || !email || !password}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  Sign In
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                className="text-red-600 hover:text-red-700 font-medium transition-colors"
              >
                Create one here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}


