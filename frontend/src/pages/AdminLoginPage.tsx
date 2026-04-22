import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ShieldAlert, ArrowRight, Server } from 'lucide-react';

export default function AdminLoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: replace with real admin login call
      console.log({ adminEmail: email, password });

      setTimeout(() => {
        setLoading(false);
        navigate('/dashboard/admin/tickets');
      }, 900);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-900 font-sans text-slate-100">
      {/* Left Column - Strict Branding (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-slate-800 border border-slate-700 flex items-center justify-center">
            <Server size={24} className="text-slate-300" />
          </div>
          <span className="text-xl font-bold tracking-widest uppercase text-slate-300">UniPulse Admin</span>
        </div>

        <div className="relative z-10">
          <ShieldAlert size={48} className="text-red-500 mb-6" />
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Restricted Access Zone
          </h1>
          <p className="text-slate-400 text-lg max-w-md">
            This system is for authorized administrative personnel only. All activities are logged and monitored.
          </p>
        </div>

        <div className="relative z-10 text-xs text-slate-500 uppercase tracking-wider font-semibold">
          System Core v2.4.1 • Secure Connection Established
        </div>
      </div>

      {/* Right Column - Secure Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-slate-900 relative">
        <div className="w-full max-w-md relative z-10">
          
          <div className="lg:hidden flex items-center gap-3 mb-10 border-b border-slate-800 pb-6">
            <Server size={28} className="text-slate-300" />
            <span className="text-xl font-bold tracking-widest uppercase text-slate-300">UniPulse Admin</span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">Administrator Login</h2>
            <p className="text-slate-400">Authenticate to access system controls.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-300">Admin Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-slate-300 transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded text-slate-100 placeholder-slate-600 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all sm:text-sm"
                  placeholder="admin@university.edu"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-300">Security Credential</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-slate-300 transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-11 py-3 bg-slate-950 border border-slate-800 rounded text-slate-100 placeholder-slate-600 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-all sm:text-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-white text-slate-900 font-bold py-3.5 px-4 rounded transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-6"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
              ) : (
                <>
                  Verify Credentials
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Back to User Login Link */}
          <div className="mt-12 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              Return to User Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
