import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Demo: store reset token
    const token = Math.random().toString(36).slice(2);
    localStorage.setItem('airflow_reset_token', JSON.stringify({ 
      email, 
      token, 
      createdAt: Date.now() 
    }));
    
    setSent(true);
    setIsLoading(false);
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-red-50 to-red-100">
        <Card variant="flat" className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
            <p className="text-gray-600 mb-6">
              If an account exists for <span className="font-medium text-gray-900">{email}</span>, 
              you'll receive reset instructions shortly.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/login')} 
                className="w-full"
              >
                Back to Login
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSent(false);
                  setEmail('');
                }} 
                className="w-full"
              >
                Try another email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-red-50 to-red-100">
      <Card variant="flat" className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <img 
              src="/Airtel/Airtel_ido6_-mlV0_5.svg" 
              alt="Airtel" 
              className="h-12 w-auto mx-auto mb-4" 
            />
            <h1 className="text-3xl font-bold text-gradient mb-2">Forgot Password?</h1>
            <p className="text-gray-600">
              No worries! Enter your email and we'll send you reset instructions.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@airtel.com"
                className="pl-10"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !email}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <Link 
              to="/login" 
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
