import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Calendar,
  Wrench,
  Bell,
  CheckCircle2,
  Users,
  Shield,
  ArrowRight,
  Play,
  Clock,
  MapPin,
  Search,
  Zap,
  LayoutDashboard,
  Ticket,
  BookOpen,
  ChevronRight,
  Star,
} from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Building2 className="w-6 h-6" />,
      title: 'Smart Facility Booking',
      description: 'Reserve lecture halls, labs, meeting rooms, and equipment with real-time availability checking and instant confirmation.',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Real-time Approval Workflow',
      description: 'Streamlined request-to-approval process with automated notifications and status tracking for all bookings.',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      icon: <Wrench className="w-6 h-6" />,
      title: 'Incident & Maintenance Tracking',
      description: 'Report issues, assign technicians, track resolution progress, and maintain facility quality standards.',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: 'Smart Notifications',
      description: 'Stay informed with instant alerts for booking confirmations, status updates, and maintenance alerts.',
      color: 'from-purple-500 to-violet-600',
    },
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Submit Request',
      description: 'Book a facility or report an issue through our intuitive interface',
      icon: <Search className="w-5 h-5" />,
    },
    {
      step: '02',
      title: 'Review & Approve',
      description: 'Administrators review and approve requests based on availability',
      icon: <CheckCircle2 className="w-5 h-5" />,
    },
    {
      step: '03',
      title: 'Access & Use',
      description: 'Receive confirmation and access your booked facility seamlessly',
      icon: <MapPin className="w-5 h-5" />,
    },
    {
      step: '04',
      title: 'Feedback & Resolve',
      description: 'Provide feedback or mark issues as resolved for continuous improvement',
      icon: <Star className="w-5 h-5" />,
    },
  ];

  const roles = [
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Students & Staff',
      description: 'Browse and book facilities, track your reservations, report maintenance issues, and receive real-time updates on your requests.',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      features: ['Browse available facilities', 'Book resources instantly', 'Track booking status', 'Report issues'],
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Administrators',
      description: 'Manage all facility bookings, approve or reject requests, oversee maintenance operations, and generate comprehensive reports.',
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
      features: ['Approve bookings', 'Manage resources', 'View analytics', 'Handle escalations'],
    },
    {
      icon: <Wrench className="w-8 h-8" />,
      title: 'Technicians',
      description: 'Receive assigned maintenance tasks, update job status, communicate with requesters, and ensure facilities remain operational.',
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
      features: ['View assigned tickets', 'Update job status', 'Communicate updates', 'Resolve issues'],
    },
  ];

  const stats = [
    { value: '50+', label: 'Facilities Managed' },
    { value: '10K+', label: 'Monthly Bookings' },
    { value: '95%', label: 'Resolution Rate' },
    { value: '<2hr', label: 'Avg. Response Time' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Smart Campus
              </span>
            </div>
            
            <div className="hidden xl:flex items-center gap-6">
              <button
                onClick={() => navigate('/customer/resources')}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
              >
                <Building2 className="w-4 h-4" />
                Browse Resources
              </button>
              <button
                onClick={() => navigate('/dashboard/my-tickets')}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
              >
                <Ticket className="w-4 h-4" />
                My Tickets
              </button>
              <button
                onClick={() => navigate('/dashboard/technician/tickets')}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
              >
                <Wrench className="w-4 h-4" />
                Technician
              </button>
              <button
                onClick={() => navigate('/dashboard/notifications')}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
              >
                <Bell className="w-4 h-4" />
                Notifications
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/login')}
                className="hidden sm:block text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-blue-100/40 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-indigo-100/40 to-transparent blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full mb-6">
                <Zap className="w-3 h-3" />
                Now Available for Universities
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                Simplify Campus Operations in{' '}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  One Platform
                </span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Streamline facility bookings, maintenance requests, and campus operations with our intelligent management system designed for modern universities.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 font-semibold rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all">
                  <Play className="w-5 h-5" />
                  Watch Demo
                </button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-12 pt-8 border-t border-slate-200">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center lg:text-left">
                    <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                    <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Hero Illustration */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-3xl blur-2xl" />
              <div className="relative bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border border-slate-200/60 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-xs text-slate-400 ml-2">Smart Campus Dashboard</span>
                </div>
                <div className="p-6 space-y-4">
                  {/* Mock Dashboard Preview */}
                  <div className="flex gap-4">
                    <div className="flex-1 bg-blue-50 rounded-xl p-4 border border-blue-100">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-slate-700">Active Bookings</span>
                      </div>
                      <div className="text-2xl font-bold text-slate-900">24</div>
                      <div className="text-xs text-emerald-600 mt-1">+12% this week</div>
                    </div>
                    <div className="flex-1 bg-orange-50 rounded-xl p-4 border border-orange-100">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                          <Ticket className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-slate-700">Open Tickets</span>
                      </div>
                      <div className="text-2xl font-bold text-slate-900">8</div>
                      <div className="text-xs text-orange-600 mt-1">3 high priority</div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-slate-700">Recent Activity</span>
                      <span className="text-xs text-slate-500">Today</span>
                    </div>
                    <div className="space-y-2">
                      {[
                        { text: 'Lecture Hall A101 booked', time: '2 min ago', color: 'bg-blue-500' },
                        { text: 'Maintenance request resolved', time: '15 min ago', color: 'bg-emerald-500' },
                        { text: 'Lab equipment reserved', time: '1 hour ago', color: 'bg-purple-500' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm">
                          <div className={`w-2 h-2 rounded-full ${item.color}`} />
                          <span className="text-slate-700 flex-1">{item.text}</span>
                          <span className="text-slate-400 text-xs">{item.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Cards */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-xl shadow-slate-900/10 p-3 border border-slate-100 animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900">Approved!</div>
                    <div className="text-[10px] text-slate-500">Room 302</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-xl shadow-slate-900/10 p-3 border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Bell className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900">New Request</div>
                    <div className="text-[10px] text-slate-500">Equipment booking</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full mb-4">
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need to Manage Campus Resources
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              A comprehensive suite of tools designed to streamline facility management, booking workflows, and maintenance operations.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-8 border border-slate-200 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-900/5 transition-all duration-300"
              >
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color} rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-6 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                <div className="mt-6 flex items-center gap-2 text-sm font-medium text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full mb-4">
              How It Works
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Simple, Streamlined Workflow
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From request to resolution, experience a frictionless process designed for efficiency.
            </p>
          </div>
          
          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-indigo-200 to-emerald-200 -translate-y-1/2" />
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {workflowSteps.map((step, index) => (
                <div key={index} className="relative">
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center text-sm font-bold">
                        {step.step}
                      </div>
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                        {step.icon}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-slate-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Role-Based Access Section */}
      <section id="roles" className="py-20 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-white/10 text-white text-xs font-semibold rounded-full mb-4">
              Role-Based Access
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Built for Every Campus Role
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Tailored experiences for students, staff, administrators, and technicians.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {roles.map((role, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className={`w-14 h-14 ${role.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg`}>
                  {role.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{role.title}</h3>
                <p className="text-slate-400 mb-6 leading-relaxed">{role.description}</p>
                <ul className="space-y-3">
                  {role.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle2 className={`w-4 h-4 ${role.color.replace('bg-', 'text-').replace('500', '400')}`} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section id="dashboard" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full mb-4">
              Dashboard Preview
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Powerful Dashboard at Your Fingertips
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Get a complete overview of your campus operations with our intuitive dashboard interface.
            </p>
          </div>
          
          <div className="bg-white rounded-3xl shadow-2xl shadow-slate-900/10 border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-slate-400 text-sm">Smart Campus Dashboard</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center">
                  <Bell className="w-4 h-4 text-slate-400" />
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full" />
              </div>
            </div>
            
            <div className="p-8">
              {/* Stats Row */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Total Bookings', value: '156', change: '+12%', color: 'blue' },
                  { label: 'Active Tickets', value: '23', change: '-5%', color: 'orange' },
                  { label: 'Facilities', value: '48', change: '+2', color: 'purple' },
                  { label: 'Utilization', value: '87%', change: '+4%', color: 'emerald' },
                ].map((stat, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="text-sm text-slate-500 mb-1">{stat.label}</div>
                    <div className="flex items-end justify-between">
                      <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                      <div className={`text-xs font-medium text-${stat.color}-600 bg-${stat.color}-100 px-2 py-0.5 rounded-full`}>
                        {stat.change}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Content Grid */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Bookings Table */}
                <div className="lg:col-span-2 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-slate-500" />
                      <span className="font-semibold text-slate-700 text-sm">Recent Bookings</span>
                    </div>
                    <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">View All</button>
                  </div>
                  <div className="divide-y divide-slate-200">
                    {[
                      { facility: 'Lecture Hall A101', user: 'Dr. Smith', date: 'Today, 2:00 PM', status: 'Confirmed', statusColor: 'emerald' },
                      { facility: 'Computer Lab B2', user: 'Prof. Johnson', date: 'Today, 3:30 PM', status: 'Pending', statusColor: 'yellow' },
                      { facility: 'Meeting Room 302', user: 'Student Council', date: 'Tomorrow, 10:00 AM', status: 'Confirmed', statusColor: 'emerald' },
                      { facility: 'Projector Kit #5', user: 'Engineering Dept', date: 'Tomorrow, 1:00 PM', status: 'Approved', statusColor: 'blue' },
                    ].map((booking, i) => (
                      <div key={i} className="px-4 py-3 flex items-center justify-between hover:bg-white transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-slate-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900">{booking.facility}</div>
                            <div className="text-xs text-slate-500">{booking.user} • {booking.date}</div>
                          </div>
                        </div>
                        <span className={`px-2 py-1 bg-${booking.statusColor}-100 text-${booking.statusColor}-700 text-xs font-medium rounded-full`}>
                          {booking.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Side Panel */}
                <div className="space-y-6">
                  {/* Tickets */}
                  <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Ticket className="w-4 h-4 text-slate-500" />
                        <span className="font-semibold text-slate-700 text-sm">Active Tickets</span>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      {[
                        { issue: 'AC not working in Room 205', priority: 'High', color: 'red' },
                        { issue: 'Projector bulb replacement', priority: 'Medium', color: 'yellow' },
                        { issue: 'Broken chair in Lab A', priority: 'Low', color: 'slate' },
                      ].map((ticket, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="text-sm text-slate-700 truncate flex-1 mr-2">{ticket.issue}</div>
                          <span className={`px-2 py-0.5 bg-${ticket.color}-100 text-${ticket.color}-700 text-[10px] font-medium rounded`}>
                            {ticket.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Notifications */}
                  <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-slate-500" />
                        <span className="font-semibold text-slate-700 text-sm">Notifications</span>
                      </div>
                      <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">3</span>
                    </div>
                    <div className="p-4 space-y-3">
                      {[
                        { text: 'Your booking is confirmed', time: '2 min ago', icon: CheckCircle2, color: 'emerald' },
                        { text: 'New maintenance request', time: '1 hour ago', icon: Wrench, color: 'orange' },
                        { text: 'System update scheduled', time: '3 hours ago', icon: Zap, color: 'blue' },
                      ].map((notif, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className={`w-8 h-8 bg-${notif.color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <notif.icon className={`w-4 h-4 text-${notif.color}-600`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-slate-700">{notif.text}</div>
                            <div className="text-xs text-slate-500">{notif.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-12 shadow-2xl shadow-blue-500/20">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Start Managing Your Campus Efficiently Today
            </h2>
            <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto">
              Join hundreds of universities already using Smart Campus to streamline their operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/login')}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-lg"
              >
                <LayoutDashboard className="w-5 h-5" />
                Sign in with Google
              </button>
              <button
                onClick={() => navigate('/customer/resources')}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-500/30 text-white font-bold rounded-xl hover:bg-blue-500/40 transition-all border border-white/20"
              >
                <Building2 className="w-5 h-5" />
                Browse Facilities
              </button>
            </div>
            <p className="text-sm text-blue-200 mt-6">
              No credit card required • Free for universities • Setup in minutes
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Smart Campus</span>
              </div>
              <p className="text-slate-400 mb-6 max-w-sm">
                Empowering universities with intelligent facility management, streamlined booking workflows, and efficient maintenance tracking.
              </p>
              <div className="flex gap-4">
                {['Twitter', 'LinkedIn', 'GitHub', 'YouTube'].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-white transition-all"
                  >
                    <span className="text-xs font-medium">{social[0]}</span>
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-3">
                {['Features', 'Pricing', 'Integrations', 'Changelog', 'Roadmap'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-3">
                {['Documentation', 'Help Center', 'Contact Us', 'Status', 'Feedback'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              © 2025 Smart Campus Operations Hub. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-slate-500">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Settings</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
