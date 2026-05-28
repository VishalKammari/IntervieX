import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, MessageSquare, Mic, FileText, CheckCircle2, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import About from './About';
const Landing = () => {
  const { user } = useAuth();
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 },
    },
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
  <div className="max-w-4xl mx-auto px-6 pt-32 pb-24">

    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      <h1 className="text-5xl sm:text-7xl font-semibold tracking-[-0.05em] leading-[0.95]">
        <div className=''></div>
        <span className='dancing-script'>Ace Your Next Interview with </span>
        <span className='instrument-serif-regular text-8xl'>IntervieX</span>
      </h1> 

      <p className="mt-8 max-w-2xl text-lg text-zinc-400 leading-relaxed">
        Practice technical and behavioral interviews with live voice conversations,
        resume-aware questions, and detailed feedback.
      </p>

      <div className="mt-10 flex gap-4">
        <Link
          to="/dashboard"
          className="rounded-lg bg-white px-6 py-3 text-black font-medium hover:opacity-90 transition"
        >
          Start Practicing
        </Link>

        <Link
          to="/about"
          className="rounded-lg border border-zinc-800 px-6 py-3 text-zinc-300 hover:bg-zinc-900 transition"
        >
          Learn More
        </Link>
      </div>

    </motion.div>
  </div>
</div>
  );
};

export default Landing;
