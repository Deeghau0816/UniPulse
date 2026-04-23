import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Wrench,
  Bell,
  CheckCircle2,
  Users,
  Shield,
  ArrowRight,
  Clock,
  MapPin,
  Search,
  Zap,
  ChevronRight,
  Star,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import BottomBar from '../components/BottomBar';

import sliitCampus from '../assets/home/sliit_campus.jpg';
import lectureHall from '../assets/home/lecture_hall.png';
import library from '../assets/home/library.png';
import meetingRoom from '../assets/home/meeting_room.png';
import computerRoom from '../assets/home/computer_room.png';
import targetGraphic from '../assets/home/target_graphic.png';
import heroBgVideo from '../assets/home/hero-bg.mp4';

const sliderImages = [
  { id: 1, src: sliitCampus, title: 'SLIIT Campus', desc: 'Experience world-class facilities and environment.' },
  { id: 2, src: lectureHall, title: 'Lecture Halls', desc: 'State-of-the-art smart lecture booking.' },
  { id: 3, src: library, title: 'Library Spaces', desc: 'Quiet, focused spaces for research and study.' },
  { id: 4, src: meetingRoom, title: 'Meeting Rooms', desc: 'Collaborate in professional, tech-enabled rooms.' },
  { id: 5, src: computerRoom, title: 'Computer Labs', desc: 'High-tech labs equipped for heavy computation.' }
];

const TargetGame = () => {
  const [score, setScore] = useState(0);
  const [targets, setTargets] = useState<
    { id: number; x: number; y: number; delay: number; duration: number }[]
  >([]);

  useEffect(() => {
    const generateTargets = () => {
      const newTargets = Array.from({ length: 5 }).map((_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 80 + 10,
        y: Math.random() * 60 + 20,
        delay: Math.random() * 2,
        duration: Math.random() * 8 + 6,
      }));
      setTargets(newTargets);
    };

    generateTargets();

    const interval = setInterval(() => {
      setTargets((prev) =>
        prev.length < 5
          ? [
              ...prev,
              {
                id: Date.now(),
                x: Math.random() * 80 + 10,
                y: Math.random() * 60 + 20,
                delay: 0,
                duration: Math.random() * 8 + 6,
              },
            ]
          : prev
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleHit = (id: number) => {
    setScore((s) => s + 1);
    setTargets((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div
      className="relative w-full h-[600px] bg-slate-50 border-t border-b border-slate-200 overflow-hidden flex flex-col items-center justify-center"
      style={{
        cursor:
          "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"40\" height=\"40\" viewBox=\"0 0 40 40\"><circle cx=\"20\" cy=\"20\" r=\"18\" fill=\"none\" stroke=\"%23ff0000\" stroke-width=\"1.5\"/><line x1=\"20\" y1=\"0\" x2=\"20\" y2=\"40\" stroke=\"%23ff0000\" stroke-width=\"1.5\"/><line x1=\"0\" y1=\"20\" x2=\"40\" y2=\"20\" stroke=\"%23ff0000\" stroke-width=\"1.5\"/><circle cx=\"20\" cy=\"20\" r=\"3\" fill=\"%23ff0000\"/></svg>') 20 20, crosshair",
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>

      <div className="z-10 text-center pointer-events-none mb-8">
        <h3 className="text-sm font-bold tracking-[0.2em] text-slate-500 uppercase mb-4">Ambitious Projects</h3>
        <h2 className="text-5xl md:text-7xl font-black text-red-500 uppercase leading-none tracking-tighter">
          We Aim Wide
          <br />
          We Deliver Right
        </h2>
        <h3 className="text-sm font-bold tracking-[0.2em] text-slate-500 uppercase mt-6">A Precise Execution</h3>
      </div>

      <div className="z-10 bg-slate-900 text-white font-bold px-8 py-3 rounded-full shadow-xl tracking-widest uppercase text-sm border border-slate-700">
        Score : {score}
      </div>

      <AnimatePresence>
        {targets.map((target) => (
          <motion.div
            key={target.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: [0, -30, 0, 30, 0],
              x: [0, 20, 0, -20, 0],
            }}
            exit={{ opacity: 0, scale: 2, filter: 'blur(5px)' }}
            transition={{
              duration: target.duration,
              delay: target.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
            onMouseDown={() => handleHit(target.id)}
            className="absolute transition-transform hover:scale-110"
            style={{
              left: `${target.x}%`,
              top: `${target.y}%`,
              cursor:
                "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"40\" height=\"40\" viewBox=\"0 0 40 40\"><circle cx=\"20\" cy=\"20\" r=\"18\" fill=\"none\" stroke=\"%23ff0000\" stroke-width=\"1.5\"/><line x1=\"20\" y1=\"0\" x2=\"20\" y2=\"40\" stroke=\"%23ff0000\" stroke-width=\"1.5\"/><line x1=\"0\" y1=\"20\" x2=\"40\" y2=\"20\" stroke=\"%23ff0000\" stroke-width=\"1.5\"/><circle cx=\"20\" cy=\"20\" r=\"3\" fill=\"%23ff0000\"/></svg>') 20 20, crosshair",
            }}
          >
            <div className="relative pointer-events-auto flex items-center justify-center w-24 h-24 rounded-full overflow-hidden mix-blend-multiply">
              <img src={targetGraphic} alt="Target" className="w-full h-full object-cover scale-110" draggable="false" />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const HomePage = () => {
  const navigate = useNavigate();

  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sliderElement = sliderRef.current;

    const handleWheel = (e: WheelEvent) => {
      if (sliderElement && sliderElement.contains(e.target as Node)) {
        if (e.deltaY > 0) {
          if (currentSlide === sliderImages.length - 1) {
            return;
          } else {
            e.preventDefault();
            setCurrentSlide(currentSlide + 1);
          }
        } else {
          e.preventDefault();
          setCurrentSlide((currentSlide - 1 + sliderImages.length) % sliderImages.length);
        }
      }
    };

    if (sliderElement) {
      sliderElement.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (sliderElement) {
        sliderElement.removeEventListener('wheel', handleWheel);
      }
    };
  }, [currentSlide]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Building2 className="w-6 h-6" />,
      title: 'Smart Facility Booking',
      description:
        'Reserve lecture halls, labs, meeting rooms, and equipment with real-time availability checking and instant confirmation.',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Real-time Approval Workflow',
      description:
        'Streamlined request-to-approval process with automated notifications and status tracking for all bookings.',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      icon: <Wrench className="w-6 h-6" />,
      title: 'Incident & Maintenance Tracking',
      description:
        'Report issues, assign technicians, track resolution progress, and maintain facility quality standards.',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: 'Smart Notifications',
      description:
        'Stay informed with instant alerts for booking confirmations, status updates, and maintenance alerts.',
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
      description:
        'Browse and book facilities, track your reservations, report maintenance issues, and receive real-time updates on your requests.',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      features: ['Browse available facilities', 'Book resources instantly', 'Track booking status', 'Report issues'],
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Administrators',
      description:
        'Manage all facility bookings, approve or reject requests, oversee maintenance operations, and generate comprehensive reports.',
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
      features: ['Approve bookings', 'Manage resources', 'View analytics', 'Handle escalations'],
    },
    {
      icon: <Wrench className="w-8 h-8" />,
      title: 'Technicians',
      description:
        'Receive assigned maintenance tasks, update job status, communicate with requesters, and ensure facilities remain operational.',
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
      features: ['View assigned tickets', 'Update job status', 'Communicate updates', 'Resolve issues'],
    },
  ];

  return (
    <div
      className="min-h-screen bg-slate-50 selection:bg-blue-500/30 text-slate-900"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
        `}
      </style>

      <Navbar />

      {/* Hero Section with Video Background */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            poster={sliitCampus}
          >
            <source src={heroBgVideo} type="video/mp4" />
          </video>

          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md text-white border border-white/20 text-sm font-semibold rounded-full mb-8 shadow-2xl"
          >
            <Zap className="w-4 h-4 text-yellow-400" />
            The Future of Campus Management
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tight leading-tight"
          >
            Welcome to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 drop-shadow-sm">
              UniPulse
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-slate-200 font-medium max-w-3xl mx-auto mb-10 text-shadow-sm"
          >
            Streamline facility management, booking workflows, and maintenance operations with our smart campus solution.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <button
              onClick={() => navigate('/customer/resources')}
              className="px-8 py-4 bg-white text-slate-900 text-lg font-bold rounded-2xl hover:bg-slate-100 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 flex items-center gap-3 mx-auto"
            >
              Explore Facilities <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Interactive Image Slider */}
      <section
        ref={sliderRef}
        className="relative h-screen min-h-[600px] bg-slate-900 overflow-hidden flex items-center justify-center cursor-ns-resize"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <img
              src={sliderImages[currentSlide].src}
              alt={sliderImages[currentSlide].title}
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-10 text-center max-w-4xl px-4">
          <motion.div
            key={`text-${currentSlide}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tight drop-shadow-2xl">
              {sliderImages[currentSlide].title}
            </h2>
            <p className="text-xl md:text-2xl text-slate-300 font-medium drop-shadow-md">
              {sliderImages[currentSlide].desc}
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-3 z-20">
          {sliderImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-500 ${
                idx === currentSlide
                  ? 'w-12 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                  : 'w-2 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-widest rounded-full mb-4 ring-1 ring-blue-500/20">
              Core Features
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
              Powerful Tools for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Your Campus</span>
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
              Everything you need to streamline facility management and operations in one elegant platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-3xl p-6 border border-slate-100 hover:border-transparent shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white to-slate-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div className="relative z-10 flex flex-col h-full">
                  <div className="mb-6 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white shadow-md shadow-current/20 group-hover:scale-110 transition-transform duration-300`}>
                      {React.cloneElement(feature.icon as React.ReactElement<{ className?: string }>, { className: 'w-5 h-5' })}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow">{feature.description}</p>

                  <a href="#" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors mt-auto">
                    Learn more <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-32 bg-blue-50/50 text-slate-900 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-300/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-300/30 rounded-full blur-[100px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 text-sm font-bold uppercase tracking-widest rounded-full mb-6">
              How It Works
            </span>
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-slate-900">
              Simple, Streamlined Workflow
            </h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
              From request to resolution, experience a frictionless process designed for efficiency.
            </p>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-blue-300/0 via-blue-300 to-blue-300/0 -translate-y-1/2" />

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {workflowSteps.map((step, index) => (
                <div key={index} className="relative group">
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300 relative z-10 flex flex-col items-center text-center h-full">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl mb-6 shadow-xl shadow-blue-500/20 group-hover:scale-110 transition-transform">
                      {step.step}
                    </div>
                    <div className="mb-4 text-blue-600">{step.icon}</div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <TargetGame />

      {/* Role-Based Access Section */}
      <section id="roles" className="py-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 text-sm font-bold uppercase tracking-widest rounded-full mb-6">
              Access Control
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
              Built for Every Campus Role
            </h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
              Tailored experiences for students, staff, administrators, and technicians.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {roles.map((role, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-[2rem] p-10 border border-slate-100 hover:border-transparent hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${role.color.replace('bg-', 'from-').replace('500', '500/5')} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className={`w-16 h-16 ${role.color} rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                    {role.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">{role.title}</h3>
                  <p className="text-slate-600 mb-8 leading-relaxed">{role.description}</p>
                  <ul className="space-y-4">
                    {role.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full ${role.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <CheckCircle2 className={`w-4 h-4 ${role.color.replace('bg-', 'text-')}`} />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section id="dashboard" className="py-32 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
              Powerful Dashboard at Your Fingertips
            </h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
              Get a complete overview of your campus operations with our intuitive dashboard interface.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-200 overflow-hidden ring-1 ring-slate-900/5">
            <div className="bg-slate-100 px-6 py-4 flex items-center justify-between border-b border-slate-200">
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-red-400 border border-red-500/20" />
                  <div className="w-3.5 h-3.5 rounded-full bg-amber-400 border border-amber-500/20" />
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 border border-emerald-500/20" />
                </div>
                <div className="bg-white px-4 py-1.5 rounded-md text-xs font-semibold text-slate-500 shadow-sm">
                  unipulse.campus.edu/dashboard
                </div>
              </div>
            </div>

            <div className="p-10 bg-slate-50">
              <div className="grid grid-cols-4 gap-6 mb-8">
                {[
                  { label: 'Active Bookings', value: '156', trend: '+12%', color: 'blue' },
                  { label: 'Pending Approvals', value: '23', trend: '-5%', color: 'amber' },
                  { label: 'Open Tickets', value: '48', trend: '+2', color: 'rose' },
                  { label: 'System Health', value: '99.9%', trend: 'Optimum', color: 'emerald' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <div className="text-slate-500 font-medium mb-4">{stat.label}</div>
                    <div className="flex items-end justify-between">
                      <div className="text-3xl font-black text-slate-900">{stat.value}</div>
                      <div className={`text-sm font-bold text-${stat.color}-600`}>{stat.trend}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="h-64 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center">
                <div className="flex items-end gap-4 h-32 w-full max-w-2xl px-8">
                  {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-blue-100 to-blue-500 rounded-t-md" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <BottomBar />
    </div>
  );
};

export default HomePage;