import { useMemo, useState } from 'react';
import { useAirflow } from '../../context/AirflowContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

export function Signup() {
  const { signup } = useAirflow();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'employee' as 'employee' | 'admin' | 'manager',
    department: '',
    auid: '',
    password: '',
    confirm: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    if (!/^\d{8}$/.test(form.auid)) {
      setError('AUID must be an 8-digit number');
      return;
    }
    try {
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
    }
  };

  const roleOptions = [
    { value: 'employee', label: 'Employee' },
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card variant="flat" className="w-full max-w-lg">
        <CardContent className="p-6 pt-6">
          <div className="text-center mb-6">
            <img src="/Airtel/Airtel_ido6_-mlV0_5.svg" alt="Airtel" className="h-10 w-auto mx-auto mb-2" />
            <h1 className="text-2xl font-bold text-gradient">Create your account</h1>
            <p className="text-sm text-gray-600">Join your team on Airflow</p>
          </div>
          <form className="space-y-4" onSubmit={onSubmit}>
            <Input label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select label="Role" options={roleOptions} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as any })} />
              <Input label="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
            </div>
            <Input label="AUID" placeholder="8-digit ID" value={form.auid} onChange={(e) => setForm({ ...form, auid: e.target.value })} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Input label="Password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="pr-10" />
                <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-8 text-gray-500 hover:text-gray-700" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff className="h-4 w-4 m-4 mt-2" /> : <Eye className="h-4 w-4 m-4 mt-2" />}
                </button>
              </div>
              <div className="relative">
                <Input label="Confirm Password" type={showConfirm ? 'text' : 'password'} value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} className="pr-10" />
                <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-3 top-8 text-gray-500 hover:text-gray-700" aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}>
                  {showConfirm ? <EyeOff className="h-4 w-4 m-4 mt-2" /> : <Eye className="h-4 w-4 m-4 mt-2" />}
                </button>
              </div>
            </div>
            {form.password && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600">Password strength</span>
                  <span className="text-xs text-gray-500">{passwordChecks.score}%</span>
                </div>
                <ProgressBar value={passwordChecks.score} className="h-2" variant={passwordChecks.score >= 80 ? 'success' : passwordChecks.score >= 60 ? 'warning' : 'danger'} />
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs">
                  <li className={passwordChecks.lengthOk ? 'text-green-600' : 'text-gray-500'}>• At least 8 characters</li>
                  <li className={passwordChecks.upperOk ? 'text-green-600' : 'text-gray-500'}>• One uppercase letter</li>
                  <li className={passwordChecks.lowerOk ? 'text-green-600' : 'text-gray-500'}>• One lowercase letter</li>
                  <li className={passwordChecks.digitOk ? 'text-green-600' : 'text-gray-500'}>• One number</li>
                  <li className={passwordChecks.specialOk ? 'text-green-600' : 'text-gray-500'}>• One special character</li>
                </ul>
              </div>
            )}
            {form.confirm && (
              <p className={`text-sm ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>Passwords {passwordsMatch ? 'match' : 'do not match'}</p>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full">Sign Up</Button>
          </form>
          <p className="text-sm text-gray-600 text-center mt-4">
            Already have an account? <Link to="/login" className="text-red-600 font-medium">Log in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


