import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Zap,
  User,
  IdCard,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import uniPulseLogo from '../assets/home/uniPulseLogo.png';
import campusBg from '../assets/home/sliit_campus.jpg';

export default function RegistrationPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [sliitId, setSliitId] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const googleRegisterUrl = 'http://localhost:8081/api/auth/google/register/start';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      alert('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8081/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          sliitId,
          role,
          email,
          password,
        }),
      });

      const raw = await response.text();
      let data: any = {};

      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = { message: raw };
      }

      if (!response.ok) {
        const message = data?.message || data?.error || 'Registration failed';
        setError(message);
        alert(message);
        throw new Error(message);
      }

      login(data.user, data.token, 'user');
      navigate('/', { replace: true });
    } catch (err) {
      console.error(err);

      if (err instanceof Error && err.message) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'block w-full rounded-full border border-blue-100 bg-white py-3 pl-11 pr-4 text-slate-900 placeholder-slate-400 shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:text-sm';

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 py-10 font-sans">
      <div
        className="absolute inset-0 scale-105 bg-cover bg-center blur-md"
        style={{ backgroundImage: `url(${campusBg})` }}
      />

      <div className="absolute inset-0 bg-white/82" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(251,146,60,0.14),transparent_32%)]" />

      <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/80 bg-white/95 shadow-2xl backdrop-blur-xl lg:grid-cols-[1.12fr_0.88fr]">
        <div className="relative hidden min-h-[760px] overflow-hidden bg-white p-10 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-6 overflow-hidden rounded-[2rem] shadow-2xl shadow-blue-500/20">
            <img
              src={campusBg}
              alt="Campus Background"
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-br from-blue-700/88 via-indigo-700/82 to-blue-500/78" />
            <div className="absolute inset-0 bg-black/10" />

            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            <div className="absolute -right-16 top-24 h-36 w-36 rounded-full bg-orange-300/30 blur-sm" />
            <div className="absolute bottom-[-40px] left-[-40px] h-44 w-44 rotate-45 rounded-[2.5rem] bg-orange-400/45" />
            <div className="absolute bottom-20 left-28 h-24 w-24 rotate-45 rounded-[2rem] bg-orange-300/35" />
            <div className="absolute bottom-28 right-24 h-28 w-28 rotate-45 rounded-[2rem] bg-blue-900/20" />

            <div className="absolute bottom-16 left-16 h-1 w-40 -rotate-45 rounded-full bg-orange-300/70" />
            <div className="absolute bottom-24 left-36 h-1 w-32 -rotate-45 rounded-full bg-white/40" />
            <div className="absolute bottom-8 right-20 h-1 w-36 -rotate-45 rounded-full bg-orange-300/70" />
            <div className="absolute bottom-44 right-10 h-1 w-28 -rotate-45 rounded-full bg-white/40" />
          </div>

          <div className="relative z-10 flex items-center gap-3 px-4 pt-4">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white p-2 shadow-lg">
              <img
                src={uniPulseLogo}
                alt="UniPulse Logo"
                className="h-full w-full object-contain"
              />
            </div>

            <span className="text-2xl font-extrabold tracking-tight text-white">
              UniPulse
            </span>
          </div>

          <div className="relative z-10 max-w-lg px-4">
            <div className="mb-5 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-blue-50 backdrop-blur">
              Create Your Campus Account
            </div>

            <h1 className="text-5xl font-extrabold leading-tight text-white">
              Join the <br />
              Campus Community.
            </h1>

            <p className="mt-5 max-w-md text-base font-medium leading-relaxed text-blue-50">
              Register to access university services, manage resource bookings,
              receive notifications, and stay connected with campus operations.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-4 px-4 pb-4 text-sm font-medium text-blue-50">
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 shadow-lg backdrop-blur">
              <ShieldCheck size={18} className="text-orange-200" />
              Secure Access
            </div>

            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 shadow-lg backdrop-blur">
              <Zap size={18} className="text-orange-200" />
              Fast Workflow
            </div>
          </div>
        </div>

        <div className="flex min-h-[760px] items-center justify-center bg-white px-6 py-10 sm:px-12">
          <div className="w-full max-w-sm rounded-[2rem] border border-slate-100 bg-white p-7 shadow-2xl shadow-slate-300/60">
            <div className="mb-7 flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-3xl border border-blue-100 bg-white p-2 shadow-lg shadow-blue-100">
                <img
                  src={uniPulseLogo}
                  alt="UniPulse Logo"
                  className="h-full w-full object-contain"
                />
              </div>

              <p className="text-sm font-bold uppercase tracking-wide text-blue-600">
                User Registration
              </p>

              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                Create Account
              </h2>

              <p className="mt-2 text-sm font-medium text-slate-500">
                Sign up to get started with UniPulse.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-3 text-center text-sm font-semibold text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <a
                href={googleRegisterUrl}
                className="flex w-full items-center justify-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 shadow-md shadow-slate-100 outline-none transition-all hover:border-blue-200 hover:bg-blue-50 focus:ring-4 focus:ring-blue-100"
              >
                <svg viewBox="0 0 48 48" className="h-5 w-5">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                Sign up with Google
              </a>

              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-slate-200" />
                <span className="mx-4 flex-shrink-0 text-xs font-semibold text-slate-400">
                  or
                </span>
                <div className="flex-grow border-t border-slate-200" />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-700">
                    First name
                  </label>

                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <User className="h-5 w-5 text-blue-500" />
                    </div>

                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={inputClass}
                      placeholder="John"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-700">
                    Last name
                  </label>

                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <User className="h-5 w-5 text-blue-500" />
                    </div>

                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className={inputClass}
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700">
                  SLIIT ID
                </label>

                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <IdCard className="h-5 w-5 text-blue-500" />
                  </div>

                  <input
                    type="text"
                    value={sliitId}
                    onChange={(e) => setSliitId(e.target.value)}
                    className={inputClass}
                    placeholder="IT12345678"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700">
                  Role
                </label>

                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <GraduationCap className="h-5 w-5 text-blue-500" />
                  </div>

                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="block w-full rounded-full border border-blue-100 bg-white py-3 pl-11 pr-4 text-slate-900 shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:text-sm"
                  >
                    <option value="STUDENT">Student</option>
                    <option value="ACADEMIC">Academic Staff</option>
                    <option value="NON_ACADEMIC">Non-Academic Staff</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700">
                  Email address
                </label>

                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Mail className="h-5 w-5 text-blue-500" />
                  </div>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    placeholder="student@university.edu"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700">
                  Password
                </label>

                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Lock className="h-5 w-5 text-blue-500" />
                  </div>

                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-full border border-blue-100 bg-white py-3 pl-11 pr-11 text-slate-900 placeholder-slate-400 shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:text-sm"
                    placeholder="Create password"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 transition hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700">
                  Confirm Password
                </label>

                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Lock className="h-5 w-5 text-blue-500" />
                  </div>

                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full rounded-full border border-blue-100 bg-white py-3 pl-11 pr-11 text-slate-900 placeholder-slate-400 shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100 sm:text-sm"
                    placeholder="Confirm password"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 transition hover:text-slate-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm font-medium text-slate-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-blue-600 transition hover:text-orange-500 hover:underline"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}