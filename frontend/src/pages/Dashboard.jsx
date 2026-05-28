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
      <div className="max-w-6xl mx-auto px-6 py-12 bg-black/10 ">
        <div className="space-y-6 animate-pulse">
          <div className="h-10 w-48 rounded-xl bg-black" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-32  bg-black border border-zinc-800"
              />
            ))}
          </div>

          <div className="h-[400px]  bg-black border border-zinc-800" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto px-8 md:px-[300px] py-12 bg-slate-grey"
    >

      <div className="flex w-full bg-black flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12">
        <div>
          <h1 className="dancing-script text-4xl sm:text-5xl font-semibold tracking-[-0.04em] text-zinc-100">
            Dashboard
          </h1>

          <p className="mt-3 text-zinc-400 max-w-xl leading-relaxed">
            Track interview sessions, resume uploads, and overall
            performance from one place.
          </p>
        </div>

        <Link
          to="/setup"
          className="inline-flex items-center justify-center gap-2  border border-zinc-800 bg-zinc-100 px-5 py-3 text-sm font-medium text-black transition-opacity hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          <span>New Session</span>
        </Link>
      </div>


      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-10">
        <StatCard
          title="Total Interviews"
          value={stats.total}
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


      {stats.resumesCount === 0 && (
        <div className="mb-10  border border-zinc-800 bg-black p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="flex items-start gap-4">
              <div className="hidden sm:flex h-12 w-12 items-center justify-center  border border-zinc-800 bg-zinc-950">
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


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        

        <div className="lg:col-span-2  border border-zinc-800 bg-zinc-900">
          <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">
                Interview History
              </h2>
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


        <div className=" border border-zinc-800 bg-zinc-900 p-6">
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
    <div className=" border border-zinc-800 bg-black/30 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            {title}
          </p>

          <h3 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-100">
            {value}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;