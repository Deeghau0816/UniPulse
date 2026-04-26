import { Link, useLocation } from 'react-router-dom';
import { 
  Ticket, 
  Calendar, 
  Bell, 
  User, 
  LogOut, 
  LayoutDashboard,
  Users,
  Menu,
  X,
  Wrench
} from 'lucide-react';
import { useState } from 'react';
import { useAuth, type PortalSide } from '../contexts/AuthContext';
import uniPulseLogo from '../assets/home/uniPulseLogo.png';

interface UnifiedNavbarProps {
  portal?: PortalSide;
}

export default function UnifiedNavbar({ portal = 'user' }: UnifiedNavbarProps) {
  const location = useLocation();
  const { userPortalUser, adminPortalUser, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const user = portal === 'admin' ? adminPortalUser : userPortalUser;
  const displayName = user?.firstName || user?.name?.split(' ')[0] || 'User';

  const linkClass = (path: string) =>
    `flex items-center gap-2 text-sm font-medium transition-colors ${
      location.pathname === path || location.pathname.startsWith(path + '/')
        ? 'text-blue-600'
        : 'text-slate-600 hover:text-blue-600'
    }`;

  const userNavLinks = [
    { path: '/customer/resources', label: 'Browse Resources', icon: null },
    { path: '/dashboard/my-tickets', label: 'My Tickets', icon: Ticket },
    { path: '/reservations/user', label: 'My Reservations', icon: Calendar },
    { path: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  ];

  const adminNavLinks = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/dashboard/resources', label: 'Resources', icon: null },
    { path: '/dashboard/admin/tickets', label: 'Tickets', icon: Ticket },
    { path: '/dashboard/technician/tickets', label: 'Technician', icon: Wrench },
    { path: '/reservations/admin', label: 'Reservations', icon: Calendar },
    { path: '/admin/users', label: 'Users', icon: Users },
  ];

  const navLinks = portal === 'admin' ? adminNavLinks : userNavLinks;
  const loginPath = portal === 'admin' ? '/admin/login' : '/login';
  const accountPath = portal === 'admin' ? '/admin/account' : '/account';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src={uniPulseLogo} alt="UniPulse Logo" className="w-9 h-9" />
            <span className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              UniPulse
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={linkClass(link.path)}
              >
                {link.icon && <link.icon className="w-4 h-4" />}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            {user && (
              <Link
                to={location.pathname.startsWith('/dashboard/technician') || location.pathname.startsWith('/dashboard/my-tickets') || location.pathname.startsWith('/dashboard/tickets') ? '/dashboard/ticket-notifications' : '/dashboard/notifications'}
                className="relative p-2 text-slate-500 hover:text-blue-600 transition-colors"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full border-2 border-white bg-red-500"></span>
              </Link>
            )}

            {/* Auth Buttons */}
            {!user ? (
              <Link
                to={loginPath}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all"
              >
                Sign In
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                {/* Account Link */}
                <Link
                  to={accountPath}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-slate-700 max-w-[100px] truncate">
                    {displayName}
                  </span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={() => logout(portal)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-blue-600 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-100">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === link.path || location.pathname.startsWith(link.path + '/')
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {link.icon && <link.icon className="w-5 h-5" />}
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
