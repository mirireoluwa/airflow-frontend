import { useMemo, useState } from 'react';
import { useAirflow } from '../../context/AirflowContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Building, Hash, ArrowRight } from 'lucide-react';

export function Signup() {
  const { signup } = useAirflow();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'employee' as 'employee' | 'admin' | 'project_manager' | 'functional_manager',
    department: '',
    auid: '',
    password: '',
    confirm: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const passwordChecks = useMemo(() => {
    const lengthOk = form.password.length >= 8;
    const upperOk = /[A-Z]/.test(form.password);
    const lowerOk = /[a-z]/.test(form.password);
    const digitOk = /\d/.test(form.password);
    const specialOk = /[^A-Za-z0-9]/.test(form.password);
    const passed = [lengthOk, upperOk, lowerOk, digitOk, specialOk].filter(Boolean).length;
    const score = Math.round((passed / 5) * 100);
    return { lengthOk, upperOk, lowerOk, digitOk, specialOk, score };
  }, [form.password]);

  const passwordsMatch = form.password.length > 0 && form.password === form.confirm;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    if (!/^\d{8}$/.test(form.auid)) {
      setError('AUID must be an 8-digit number');
      setIsLoading(false);
      return;
    }
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      signup({
        name: form.name,
        email: form.email,
        role: form.role,
        department: form.department,
        auid: form.auid,
        password: form.password
      });
      navigate('/login');
    } catch (err) {
      setError('Unable to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    { value: 'employee', label: 'Employee' },
    { value: 'admin', label: 'Admin' },
    { value: 'project_manager', label: 'Project Manager' },
    { value: 'functional_manager', label: 'Functional Manager' }
  ];

  return (
    <div className="min-h-screen relative">
      {/* Background image */}
      <div className="absolute inset-0">
        <img 
          src="/marissa-grootes-flRm0z3MEoA-unsplash.jpg" 
          alt="Workspace" 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Centered Signup Form */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-4">
        <Card variant="flat" className="w-full max-w-lg bg-white/95 backdrop-blur-sm">
          <CardContent className="p-6 pt-6">
          <div className="text-center mb-6">
            <img 
              src="/Airtel/Airtel_ido6_-mlV0_5.svg" 
              alt="Airtel" 
              className="h-10 w-auto mx-auto mb-3" 
            />
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
            <p className="text-sm text-gray-600">Join your team on Airflow and get started</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Personal Information */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-gray-900">Personal Information</h3>
              
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  label="Full Name" 
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="pl-5"
                  required
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  label="Email Address" 
                  type="email" 
                  value={form.email} 
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@airtel.com"
                  className="pl-5"
                  required
                />
              </div>
            </div>

            {/* Work Information */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-gray-900">Work Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Select 
                  label="Role" 
                  options={roleOptions} 
                  value={form.role} 
                  onChange={(e) => setForm({ ...form, role: e.target.value as any })} 
                />
                
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input 
                    label="Department" 
                    value={form.department} 
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    placeholder="e.g., Engineering"
                    className="pl-5"
                  />
                </div>
              </div>

              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                  label="AUID (8-digit ID)" 
                  placeholder="12345678" 
                  value={form.auid} 
                  onChange={(e) => setForm({ ...form, auid: e.target.value })}
                  className="pl-5"
                  required
                />
              </div>
            </div>

            {/* Password Section */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-gray-900">Security</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="relative">
                  <Input 
                    label="Password" 
                    type={showPassword ? 'text' : 'password'} 
                    value={form.password} 
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Create a password"
                    className="pr-10"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(p => !p)} 
                    className="absolute right-3 top-2/3 mr-2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                <div className="relative">
                  <Input 
                    label="Confirm Password" 
                    type={showConfirm ? 'text' : 'password'} 
                    value={form.confirm} 
                    onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                    placeholder="Confirm your password"
                    className="pr-10"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirm(p => !p)} 
                    className="absolute right-3 top-2/3 mr-2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {form.password && (
                <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700">Password strength</span>
                    <span className="text-xs text-gray-500">{passwordChecks.score}%</span>
                  </div>
                  <ProgressBar 
                    value={passwordChecks.score} 
                    className="h-1.5" 
                    variant={passwordChecks.score >= 80 ? 'success' : passwordChecks.score >= 60 ? 'warning' : 'danger'} 
                  />
                  <ul className="grid grid-cols-2 gap-1 text-xs">
                    <li className={passwordChecks.lengthOk ? 'text-green-600' : 'text-gray-500'}>• 8+ chars</li>
                    <li className={passwordChecks.upperOk ? 'text-green-600' : 'text-gray-500'}>• Uppercase</li>
                    <li className={passwordChecks.lowerOk ? 'text-green-600' : 'text-gray-500'}>• Lowercase</li>
                    <li className={passwordChecks.digitOk ? 'text-green-600' : 'text-gray-500'}>• Number</li>
                    <li className={passwordChecks.specialOk ? 'text-green-600' : 'text-gray-500'}>• Special</li>
                  </ul>
                </div>
              )}

              {form.confirm && (
                <div className={`p-2 rounded-lg ${passwordsMatch ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <p className={`text-xs ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                    Passwords {passwordsMatch ? 'match' : 'do not match'}
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !form.name || !form.email || !form.password || !form.confirm}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating account...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  Create Account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-red-600 hover:text-red-700 font-medium transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}