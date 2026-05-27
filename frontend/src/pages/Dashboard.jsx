// import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import api from '../utils/api';
// import {
//   Briefcase,
//   TrendingUp,
//   FileText,
//   Plus,
//   ArrowRight,
//   Clock,
//   CheckCircle,
//   AlertCircle,
//   FileQuestion,
// } from 'lucide-react';

// const Dashboard = () => {
//   const [interviews, setInterviews] = useState([]);
//   const [resumes, setResumes] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [stats, setStats] = useState({
//     total: 0,
//     avgScore: 0,
//     completed: 0,
//     resumesCount: 0,
//   });

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [interviewsRes, resumesRes] = await Promise.all([
//           api.get('/api/interviews'),
//           api.get('/api/resumes'),
//         ]);

//         const interviewList = interviewsRes.data.data;
//         const resumeList = resumesRes.data.data;

//         setInterviews(interviewList);
//         setResumes(resumeList);

//         // Calculate stats
//         const completed = interviewList.filter((i) => i.status === 'completed');
//         const totalCompleted = completed.length;
//         const totalScore = completed.reduce((acc, curr) => acc + (curr.evaluation?.overallScore || 0), 0);
//         const avgScore = totalCompleted ? Math.round(totalScore / totalCompleted) : 0;

//         setStats({
//           total: interviewList.length,
//           avgScore,
//           completed: totalCompleted,
//           resumesCount: resumeList.length,
//         });
//       } catch (error) {
//         console.error('Error fetching dashboard data:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   const getDifficultyColor = (diff) => {
//     switch (diff) {
//       case 'Entry':
//         return 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400';
//       case 'Mid':
//         return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400';
//       case 'Senior':
//         return 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400';
//       case 'Lead':
//         return 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400';
//       default:
//         return 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
//     }
//   };

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case 'completed':
//         return <CheckCircle className="w-4 h-4 text-emerald-500" />;
//       case 'ongoing':
//         return <Clock className="w-4 h-4 text-amber-500 animate-pulse" />;
//       default:
//         return <AlertCircle className="w-4 h-4 text-blue-500" />;
//     }
//   };

//   if (loading) {
//     return (
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
//         <div className="animate-pulse space-y-8">
//           <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/4"></div>
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//             {[...Array(4)].map((_, i) => (
//               <div key={i} className="h-28 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
//             ))}
//           </div>
//           <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
//       <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none"></div>

//       {/* Header */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
//         <div>
//           <h1 className="text-3xl font-bold font-display">Dashboard</h1>
//           <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//             Track scores, resumes, and launch mock interviews.
//           </p>
//         </div>
//         <Link
//           to="/setup"
//           className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md shadow-indigo-500/10 hover:shadow-lg transition-all duration-200 transform hover:scale-[1.01]"
//         >
//           <Plus className="w-4.5 h-4.5" />
//           <span>New Interview Session</span>
//         </Link>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
//         {/* Stat 1 */}
//         <div className="p-6 rounded-2xl bg-white border border-gray-100 dark:bg-darkCard dark:border-gray-800/60 shadow-sm">
//           <div className="flex justify-between items-start">
//             <div>
//               <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Interviews</p>
//               <h3 className="text-3xl font-extrabold mt-2 font-display">{stats.total}</h3>
//             </div>
//             <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400">
//               <Briefcase className="w-5 h-5" />
//             </div>
//           </div>
//         </div>

//         {/* Stat 2 */}
//         <div className="p-6 rounded-2xl bg-white border border-gray-100 dark:bg-darkCard dark:border-gray-800/60 shadow-sm">
//           <div className="flex justify-between items-start">
//             <div>
//               <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Average Score</p>
//               <h3 className="text-3xl font-extrabold mt-2 font-display">
//                 {stats.avgScore}
//                 <span className="text-sm text-gray-400 font-normal">/100</span>
//               </h3>
//             </div>
//             <div className="p-3 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400">
//               <TrendingUp className="w-5 h-5" />
//             </div>
//           </div>
//         </div>

//         {/* Stat 3 */}
//         <div className="p-6 rounded-2xl bg-white border border-gray-100 dark:bg-darkCard dark:border-gray-800/60 shadow-sm">
//           <div className="flex justify-between items-start">
//             <div>
//               <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sessions Completed</p>
//               <h3 className="text-3xl font-extrabold mt-2 font-display">{stats.completed}</h3>
//             </div>
//             <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
//               <CheckCircle className="w-5 h-5" />
//             </div>
//           </div>
//         </div>

//         {/* Stat 4 */}
//         <div className="p-6 rounded-2xl bg-white border border-gray-100 dark:bg-darkCard dark:border-gray-800/60 shadow-sm">
//           <div className="flex justify-between items-start">
//             <div>
//               <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Uploaded Resumes</p>
//               <h3 className="text-3xl font-extrabold mt-2 font-display">{stats.resumesCount}</h3>
//             </div>
//             <div className="p-3 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400">
//               <FileText className="w-5 h-5" />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Onboarding Call to Action */}
//       {stats.resumesCount === 0 && (
//         <div className="mb-10 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-200/40 dark:border-indigo-500/10 flex flex-col md:flex-row justify-between items-center gap-6">
//           <div className="flex items-center space-x-4">
//             <div className="p-4 rounded-full bg-white dark:bg-darkCard text-indigo-500 shadow-sm hidden sm:block">
//               <FileQuestion className="w-8 h-8" />
//             </div>
//             <div>
//               <h4 className="text-lg font-bold">Personalize your evaluations with your resume!</h4>
//               <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xl">
//                 Uploading your resume allows the AI to tailor mock interview questions specifically to your experience and skills, mimicking a real recruitment pipeline.
//               </p>
//             </div>
//           </div>
//           <div className="flex items-center space-x-3 w-full md:w-auto shrink-0 justify-center">
//             <Link
//               to="/resumes"
//               className="px-5 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-medium text-sm rounded-xl dark:bg-darkCard dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors shadow-sm"
//             >
//               Upload Resume
//             </Link>
//             <Link
//               to="/setup"
//               className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-sm transition-colors flex items-center space-x-1"
//             >
//               <span>Skip & Create Session</span>
//               <ArrowRight className="w-4 h-4" />
//             </Link>
//           </div>
//         </div>
//       )}

//       {/* Grid: Interviews & Action bar */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         {/* Interviews List (Left 2 columns) */}
//         <div className="lg:col-span-2">
//           <div className="p-6 rounded-2xl bg-white border border-gray-100 dark:bg-darkCard dark:border-gray-800/60 shadow-sm">
//             <h3 className="text-xl font-bold mb-6 font-display">Interview History</h3>

//             {interviews.length === 0 ? (
//               <div className="text-center py-12">
//                 <FileQuestion className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
//                 <p className="text-gray-500 dark:text-gray-400 text-sm font-light">No sessions recorded yet.</p>
//                 <Link
//                   to="/setup"
//                   className="inline-flex items-center space-x-1.5 text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline mt-2"
//                 >
//                   <span>Launch your first interview</span>
//                   <ArrowRight className="w-4 h-4" />
//                 </Link>
//               </div>
//             ) : (
//               <div className="overflow-x-auto">
//                 <table className="w-full text-left border-collapse">
//                   <thead>
//                     <tr className="border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wider">
//                       <th className="pb-3 font-medium">Role</th>
//                       <th className="pb-3 font-medium">Level</th>
//                       <th className="pb-3 font-medium">Status</th>
//                       <th className="pb-3 font-medium">Score</th>
//                       <th className="pb-3 font-medium text-right">Action</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50">
//                     {interviews.map((interview) => (
//                       <tr key={interview._id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-900/30">
//                         <td className="py-4 pr-3">
//                           <p className="font-semibold text-sm truncate max-w-[200px]">{interview.jobTitle}</p>
//                           <p className="text-[11px] text-gray-400 mt-0.5">
//                             {new Date(interview.createdAt).toLocaleDateString()}
//                           </p>
//                         </td>
//                         <td className="py-4">
//                           <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getDifficultyColor(interview.difficultyLevel)}`}>
//                             {interview.difficultyLevel}
//                           </span>
//                         </td>
//                         <td className="py-4">
//                           <div className="flex items-center space-x-1.5 text-xs text-gray-500 dark:text-gray-400 capitalize">
//                             {getStatusIcon(interview.status)}
//                             <span>{interview.status}</span>
//                           </div>
//                         </td>
//                         <td className="py-4 font-display font-bold text-sm">
//                           {interview.status === 'completed' ? (
//                             <span className={interview.evaluation.overallScore >= 70 ? 'text-emerald-500' : 'text-indigo-500'}>
//                               {interview.evaluation.overallScore}/100
//                             </span>
//                           ) : (
//                             <span className="text-gray-400 dark:text-gray-600">—</span>
//                           )}
//                         </td>
//                         <td className="py-4 text-right">
//                           {interview.status === 'completed' ? (
//                             <Link
//                               to={`/report/${interview._id}`}
//                               className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 hover:underline inline-flex items-center space-x-0.5"
//                             >
//                               <span>Report</span>
//                               <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
//                             </Link>
//                           ) : (
//                             <Link
//                               to={`/session/${interview._id}`}
//                               className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 hover:underline inline-flex items-center space-x-0.5"
//                             >
//                               <span>Resume</span>
//                               <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
//                             </Link>
//                           )}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Resumes sidebar (Right column) */}
//         <div>
//           <div className="p-6 rounded-2xl bg-white border border-gray-100 dark:bg-darkCard dark:border-gray-800/60 shadow-sm">
//             <div className="flex justify-between items-center mb-6">
//               <h3 className="text-lg font-bold font-display">Resumes</h3>
//               <Link
//                 to="/resumes"
//                 className="text-xs text-indigo-600 hover:underline dark:text-indigo-400"
//               >
//                 Manage
//               </Link>
//             </div>

//             {resumes.length === 0 ? (
//               <div className="text-center py-8 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
//                 <p className="text-xs text-gray-500 dark:text-gray-400">No resumes stored yet.</p>
//                 <Link
//                   to="/resumes"
//                   className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 inline-block"
//                 >
//                   Upload now
//                 </Link>
//               </div>
//             ) : (
//               <div className="space-y-3">
//                 {resumes.slice(0, 4).map((resume) => (
//                   <div
//                     key={resume._id}
//                     className="flex items-center space-x-3 p-3.5 rounded-xl border border-gray-50 bg-gray-50/50 dark:border-gray-800/40 dark:bg-gray-900/20"
//                   >
//                     <FileText className="w-5 h-5 text-indigo-500 shrink-0" />
//                     <div className="min-w-0 flex-1">
//                       <p className="text-xs font-bold truncate">{resume.fileName}</p>
//                       <p className="text-[10px] text-gray-400 mt-0.5">
//                         {new Date(resume.createdAt).toLocaleDateString()}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//                 {resumes.length > 4 && (
//                   <Link
//                     to="/resumes"
//                     className="block text-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-4 hover:underline"
//                   >
//                     View remaining {resumes.length - 4} resumes
//                   </Link>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;


import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';

import {
  Briefcase,
  TrendingUp,
  FileText,
  Plus,
  ArrowRight,
  Clock3,
  CheckCircle2,
  AlertCircle,
  FileQuestion,
} from 'lucide-react';

const Dashboard = () => {
  const [interviews, setInterviews] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    total: 0,
    avgScore: 0,
    completed: 0,
    resumesCount: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [interviewsRes, resumesRes] = await Promise.all([
          api.get('/api/interviews'),
          api.get('/api/resumes'),
        ]);

        const interviewList = interviewsRes.data.data;
        const resumeList = resumesRes.data.data;

        setInterviews(interviewList);
        setResumes(resumeList);

        const completed = interviewList.filter(
          (i) => i.status === 'completed'
        );

        const totalCompleted = completed.length;

        const totalScore = completed.reduce(
          (acc, curr) => acc + (curr.evaluation?.overallScore || 0),
          0
        );

        const avgScore = totalCompleted
          ? Math.round(totalScore / totalCompleted)
          : 0;

        setStats({
          total: interviewList.length,
          avgScore,
          completed: totalCompleted,
          resumesCount: resumeList.length,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getDifficultyStyles = (diff) => {
    switch (diff) {
      case 'Entry':
        return 'bg-zinc-800 text-zinc-300';

      case 'Mid':
        return 'bg-emerald-500/10 text-emerald-400';

      case 'Senior':
        return 'bg-amber-500/10 text-amber-400';

      case 'Lead':
        return 'bg-rose-500/10 text-rose-400';

      default:
        return 'bg-zinc-800 text-zinc-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        );

      case 'ongoing':
        return <Clock3 className="w-4 h-4 text-amber-400 shrink-0" />;

      default:
        return <AlertCircle className="w-4 h-4 text-zinc-500 shrink-0" />;
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12 bg-black ">
        <div className="space-y-6 animate-pulse">
          <div className="h-10 w-48 rounded-xl bg-black" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-2xl bg-black border border-zinc-800"
              />
            ))}
          </div>

          <div className="h-[400px] rounded-2xl bg-black border border-zinc-800" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto px-6 py-12 bg-black"
    >
      {/* HEADER */}

      <div className="flex bg-black flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
        <div>
          <p className="text-sm text-zinc-500 mb-3">
            Interview Analytics
          </p>

          <h1 className="text-4xl sm:text-5xl font-semibold tracking-[-0.04em] text-zinc-100">
            Dashboard
          </h1>

          <p className="mt-3 text-zinc-400 max-w-xl leading-relaxed">
            Track interview sessions, resume uploads, and overall
            performance from one place.
          </p>
        </div>

        <Link
          to="/setup"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-100 px-5 py-3 text-sm font-medium text-black transition-opacity hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          <span>New Session</span>
        </Link>
      </div>

      {/* STATS */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard
          title="Total Interviews"
          value={stats.total}
          icon={<Briefcase className="w-4 h-4" />}
        />

        <StatCard
          title="Average Score"
          value={`${stats.avgScore}/100`}
          icon={<TrendingUp className="w-4 h-4" />}
        />

        <StatCard
          title="Completed"
          value={stats.completed}
          icon={<CheckCircle2 className="w-4 h-4" />}
        />

        <StatCard
          title="Resumes"
          value={stats.resumesCount}
          icon={<FileText className="w-4 h-4" />}
        />
      </div>

      {/* EMPTY RESUME CTA */}

      {stats.resumesCount === 0 && (
        <div className="mb-10 rounded-2xl border border-zinc-800 bg-black p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="flex items-start gap-4">
              <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950">
                <FileQuestion className="w-5 h-5 text-zinc-400" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-zinc-100">
                  Upload your resume
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-zinc-400 max-w-2xl">
                  Resume-aware interview sessions generate more relevant
                  questions and improve evaluation quality.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/resumes"
                className="rounded-xl border border-zinc-800 px-5 py-3 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
              >
                Upload Resume
              </Link>

              <Link
                to="/setup"
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-100 px-5 py-3 text-sm font-medium text-black transition-opacity hover:opacity-90"
              >
                <span>Create Session</span>

                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* MAIN GRID */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* INTERVIEWS */}

        <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900">
          <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">
                Interview History
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Previous mock interview sessions
              </p>
            </div>
          </div>

          {interviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <FileQuestion className="w-10 h-10 text-zinc-700 mb-4" />

              <h3 className="text-zinc-200 font-medium">
                No interview sessions yet
              </h3>

              <p className="mt-2 text-sm text-zinc-500">
                Start your first mock interview session.
              </p>

              <Link
                to="/setup"
                className="mt-6 inline-flex items-center gap-2 rounded-xl border border-zinc-800 px-5 py-3 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
              >
                Start Session
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800 text-left text-xs uppercase tracking-wide text-zinc-500">
                    <th className="px-6 py-4 font-medium">Role</th>
                    <th className="px-6 py-4 font-medium">Level</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Score</th>
                    <th className="px-6 py-4 font-medium text-right">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-zinc-800">
                  {interviews.map((interview) => (
                    <tr
                      key={interview._id}
                      className="transition-colors hover:bg-zinc-800/40"
                    >
                      <td className="px-6 py-5">
                        <p className="font-medium text-zinc-100 truncate max-w-[220px]">
                          {interview.jobTitle}
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                          {new Date(
                            interview.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getDifficultyStyles(
                            interview.difficultyLevel
                          )}`}
                        >
                          {interview.difficultyLevel}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm text-zinc-400 capitalize">
                          {getStatusIcon(interview.status)}

                          <span>{interview.status}</span>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        {interview.status === 'completed' ? (
                          <span className="font-medium text-zinc-100">
                            {interview.evaluation.overallScore}/100
                          </span>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>

                      <td className="px-6 py-5 text-right">
                        <Link
                          to={
                            interview.status === 'completed'
                              ? `/report/${interview._id}`
                              : `/session/${interview._id}`
                          }
                          className="inline-flex items-center gap-1 text-sm text-zinc-300 transition-colors hover:text-white"
                        >
                          <span>
                            {interview.status === 'completed'
                              ? 'View Report'
                              : 'Resume'}
                          </span>

                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RESUME SIDEBAR */}

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">
                Resumes
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Uploaded resume files
              </p>
            </div>

            <Link
              to="/resumes"
              className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Manage
            </Link>
          </div>

          {resumes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950 px-6 py-10 text-center">
              <p className="text-sm text-zinc-500">
                No resumes uploaded yet.
              </p>

              <Link
                to="/resumes"
                className="inline-block mt-4 text-sm text-zinc-200 hover:text-white"
              >
                Upload Resume
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {resumes.slice(0, 4).map((resume) => (
                <div
                  key={resume._id}
                  className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4 transition-colors hover:bg-zinc-800/50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
                    <FileText className="w-4 h-4 text-zinc-400" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-100">
                      {resume.fileName}
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      {new Date(
                        resume.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}

              {resumes.length > 4 && (
                <Link
                  to="/resumes"
                  className="block pt-2 text-sm text-zinc-400 transition-colors hover:text-zinc-200"
                >
                  View remaining {resumes.length - 4} resumes
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const StatCard = ({ title, value, icon }) => {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            {title}
          </p>

          <h3 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-100">
            {value}
          </h3>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-400">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;