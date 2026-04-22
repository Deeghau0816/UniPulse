import { Link, useLocation } from 'react-router-dom';
import { Bell, User } from 'lucide-react';
import uniPulseLogo from '../assets/home/uniPulseLogo.png';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const linkClass = (path: string) =>
    `text-sm font-semibold transition ${
      location.pathname === path
        ? 'text-blue-600'
        : 'text-slate-700 hover:text-blue-600'
    }`;

  const displayName = user?.firstName || user?.name?.split(' ')[0] || 'User';

  return (
    <header className="w-full border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex w-full items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl">
            <img
              src={uniPulseLogo}
              alt="UniPulse Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900">UniPulse</h1>
            <p className="text-[11px] text-slate-500">Smart Campus Platform</p>
          </div>
        </Link>

        <div className="flex items-center gap-8">
          <nav className="hidden items-center gap-8 md:flex">
            <Link to="/" className={linkClass('/')}>Home</Link>
            <Link to="/tickets" className={linkClass('/tickets')}>Tickets</Link>
            <Link to="/bookings" className={linkClass('/bookings')}>Bookings</Link>
          </nav>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-500 transition-colors hover:text-slate-900">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full border-2 border-white bg-red-500"></span>
            </button>

            {!user ? (
              <Link
                to="/login"
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
              >
                Login
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/account"
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm transition-colors hover:bg-slate-50"
                >
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-slate-100">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-slate-500" />
                    )}
                  </div>

                  <span className="max-w-[120px] truncate text-sm font-semibold text-slate-700">
                    {displayName}
                  </span>
                </Link>

                <button
                  onClick={logout}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
