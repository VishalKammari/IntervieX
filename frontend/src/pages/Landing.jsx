import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, MessageSquare, Mic, FileText, CheckCircle2, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
    // <div className="relative min-h-[calc(screen-16)] overflow-hidden">
    //   {/* Background Gradients */}
    //   <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none dark:bg-indigo-500/5"></div>
    //   <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none dark:bg-purple-500/5"></div>

    //   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">

         
    //       <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full border border-indigo-200 bg-indigo-50/50 text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-950/20 dark:text-indigo-400 text-xs font-semibold mb-6">
    //         <Sparkles className="w-3.5 h-3.5 animate-pulse" />
    //         <span>AI-Powered Real-time Interview Prep</span>
    //       </div>

    //       <h1 className="text-4xl sm:text-6xl font-extrabold font-display tracking-tight leading-tight">
    //         Master Your Next Interview with{' '}
    //         <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-pulse-slow">
    //           Sarkari AI Speaking Voice
    //         </span>
    //       </h1>

    //       <p className="mt-6 text-lg sm:text-xl text-gray-500 dark:text-gray-400 font-light leading-relaxed">
    //         Upload your resume, customize your target job description, and practice with real-time audio voice dialogue. Get precise, personalized feedback on accuracy, style, and presentation.
    //       </p>

    //       <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
    //         <Link
    //           to={user ? '/dashboard' : '/register'}
    //           className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-lg shadow-indigo-500/20 transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center space-x-2"
    //         >
    //           <span>{user ? 'Go to Dashboard' : 'Get Started for Free'}</span>
    //         </Link>
    //         <Link
    //           to="/login"
    //           className="w-full sm:w-auto px-8 py-4 rounded-xl border border-gray-200 bg-white/50 dark:border-gray-800 dark:bg-darkCard/50 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-all duration-200 flex items-center justify-center"
    //         >
    //           Learn More
    //         </Link>
    //       </div>


    //   </div>
    // </div>
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
  <div className="max-w-4xl mx-auto px-6 pt-32 pb-24">

    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >

      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-800 px-3 py-1 text-sm text-zinc-400">
        <div className="h-2 w-2 rounded-full bg-emerald-400" />
        Real-time interview practice
      </div>

      <h1 className="text-5xl sm:text-7xl font-semibold tracking-[-0.05em] leading-[0.95]">
        <span className='instrument-serif-regular-italic'>Ace Your Next Interview with </span>
        <br />
        <span className='instrument'>IntervieX</span>
      </h1> 

      <p className="mt-8 max-w-2xl text-lg text-zinc-400 leading-relaxed">
        Practice technical and behavioral interviews with live voice conversations,
        resume-aware questions, and detailed feedback.
      </p>

      <div className="mt-10 flex gap-4">
        <Link
          to="/register"
          className="rounded-lg bg-white px-6 py-3 text-black font-medium hover:opacity-90 transition"
        >
          Start Practicing
        </Link>

        <Link
          to="/login"
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
