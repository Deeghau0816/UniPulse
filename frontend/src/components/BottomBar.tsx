import React from 'react';
import { Building2 } from 'lucide-react';

const BottomBar = () => {
  return (
    <footer className="bg-white py-20 text-slate-600 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 overflow-hidden">
                <img
                  src="/logo.png"
                  alt="UniPulse Logo"
                  className="w-full h-full object-cover hidden"
                  onError={e => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black text-slate-900 tracking-tight">UniPulse</span>
            </div>
            <p className="text-slate-500 mb-8 max-w-sm leading-relaxed text-lg">
              Empowering universities with intelligent facility management and streamlined operations.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-sm">Product</h4>
            <ul className="space-y-4">
              {['Features', 'Pricing', 'Integrations', 'Changelog'].map(item => (
                <li key={item}>
                  <a href="#" className="hover:text-blue-600 transition-colors font-medium">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-sm">Support</h4>
            <ul className="space-y-4">
              {['Documentation', 'Help Center', 'Contact Us', 'Status'].map(item => (
                <li key={item}>
                  <a href="#" className="hover:text-blue-600 transition-colors font-medium">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm font-medium text-slate-500">
          <p>© 2026 UniPulse Campus Solutions. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-slate-900 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-slate-900 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default BottomBar;
