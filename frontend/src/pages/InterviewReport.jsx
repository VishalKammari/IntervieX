import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { CheckCircle2, AlertTriangle, ArrowLeft, Download, Award, ShieldAlert, Star, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import confetti from 'canvas-confetti';

const InterviewReport = () => {
  const { id } = useParams();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedQId, setExpandedQId] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await api.get(`/api/interviews/${id}`);
        setInterview(res.data.data);
        if (res.data.data.evaluation?.overallScore >= 75) {
        }
      } catch (err) {
        console.error('Failed to load evaluation:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  const getHiringBadge = (recommendation) => {
    switch (recommendation) {
      case 'Strong Hire':
        return {
          bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30',
          icon: <Award className="w-4 h-4 text-emerald-500" />,
        };
      case 'Hire':
        return {
          bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border-blue-200 dark:border-blue-900/30',
          icon: <CheckCircle2 className="w-4 h-4 text-blue-500" />,
        };
      case 'Borderline':
        return {
          bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-200 dark:border-amber-900/30',
          icon: <Star className="w-4 h-4 text-amber-500" />,
        };
      default:
        return {
          bg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border-rose-200 dark:border-rose-900/30',
          icon: <ShieldAlert className="w-4 h-4 text-rose-500" />,
        };
    }
  };

  const toggleExpand = (qId) => {
    setExpandedQId(expandedQId === qId ? null : qId);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 animate-pulse space-y-8">
        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/4"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
        <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
      </div>
    );
  }

  if (!interview || interview.status !== 'completed') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold">Report Incomplete</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
          This session hasn't been completed and evaluated yet.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  const badge = getHiringBadge(interview.evaluation.hiringRecommendation);
  const technicalQuestions = interview.questions.filter((q) => q.type === 'Technical');
  const behavioralQuestions = interview.questions.filter((q) => q.type === 'Behavioral');
  const scenarioQuestions = interview.questions.filter((q) => q.type === 'Scenario');

  const getAvg = (list) =>
    list.length ? Math.round(list.reduce((sum, item) => sum + item.score, 0) / list.length) : 0;

  const chartData = [
    { subject: 'Technical', A: getAvg(technicalQuestions), fullMark: 100 },
    { subject: 'Behavioral', A: getAvg(behavioralQuestions), fullMark: 100 },
    { subject: 'Scenario', A: getAvg(scenarioQuestions), fullMark: 100 },
    { subject: 'Overall', A: interview.evaluation.overallScore, fullMark: 100 },
  ];

  return (
    <div className="min-h-screen bg-black text-white px-4 py-10 relative overflow-hidden">

  <div className="max-w-4xl mx-auto relative z-10 print:p-0 print:max-w-full">
    <div className="p-8 rounded-3xl bg-[#0a0a0a] border border-zinc-800 mb-8 print:border-none print:shadow-none print:p-0">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">

        <div className="flex flex-col items-center shrink-0">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg
              className="absolute w-full h-full transform -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="42"
                className="stroke-zinc-800 fill-transparent"
                strokeWidth="8"
              />

              <circle
                cx="50"
                cy="50"
                r="42"
                className="stroke-white fill-transparent transition-all duration-1000"
                strokeWidth="8"
                strokeDasharray="264"
                strokeDashoffset={
                  264 -
                  (264 *
                    interview.evaluation.overallScore) /
                    100
                }
                strokeLinecap="round"
              />
            </svg>

            <div className="text-center">
              <span className="text-4xl font-extrabold">
                {interview.evaluation.overallScore}
              </span>

              <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
                Overall Score
              </p>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 text-center md:text-left space-y-4">
          <div>
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
              Evaluation Report
            </span>

            <h2 className="text-3xl font-bold mt-1">
              {interview.jobTitle}
            </h2>

            <p className="text-xs text-zinc-500 mt-1">
              Completed on{' '}
              {new Date(
                interview.completedAt ||
                  interview.updatedAt
              ).toLocaleDateString()}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <div
              className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold border ${badge.bg}`}
            >
              {badge.icon}
              <span>
                {
                  interview.evaluation
                    .hiringRecommendation
                }
              </span>
            </div>

            <span className="text-xs font-medium text-zinc-400 bg-zinc-900 px-3 py-1 rounded-full">
              {interview.difficultyLevel} Level
            </span>
          </div>

          <p className="text-sm text-zinc-400 leading-relaxed">
            {interview.evaluation.summary}
          </p>
        </div>
      </div>
    </div>
    <div className="p-6 rounded-3xl bg-[#0a0a0a] border border-zinc-800 mb-8">
      <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">
        Improvement Plan
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {interview.evaluation.recommendations.map(
          (rec, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-300 leading-relaxed"
            >
              <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center font-bold mb-3">
                {idx + 1}
              </div>

              {rec}
            </div>
          )
        )}
      </div>
    </div>

    <div className="space-y-4">
      <h3 className="text-2xl font-bold mb-4">
        Question Analysis
      </h3>

      {interview.questions.map((question, idx) => (
        <div
          key={question._id}
          className="rounded-3xl border border-zinc-800 bg-[#0a0a0a] overflow-hidden"
        >
        
          <div
            onClick={() =>
              toggleExpand(question._id)
            }
            className="p-5 flex justify-between items-center gap-4 cursor-pointer hover:bg-zinc-900 transition"
          >
            <div className="flex items-start space-x-4 min-w-0">
              <span className="text-sm font-bold text-zinc-500 shrink-0">
                Q{idx + 1}
              </span>

              <div className="min-w-0">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  {question.type}
                </p>

                <p className="text-sm font-semibold truncate max-w-[400px] mt-1">
                  {question.text}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 shrink-0">
              <span className="text-sm font-bold text-white">
                {question.score}/100
              </span>

              {expandedQId === question._id ? (
                <ChevronUp className="w-4 h-4 text-zinc-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-zinc-500" />
              )}
            </div>
          </div>
          {expandedQId === question._id && (
            <div className="px-5 pb-6 pt-2 border-t border-zinc-800 space-y-5">

              {/* Question */}
              <div>
                <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                  Question
                </h5>

                <p className="text-sm text-zinc-200 leading-relaxed">
                  {question.text}
                </p>
              </div>

              <div>
                <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                  Your Answer
                </h5>

                <p className="text-sm text-zinc-300 leading-relaxed italic bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
                  {question.userAnswer
                    ? `"${question.userAnswer}"`
                    : '[Question Skipped]'}
                </p>
              </div>

              <div>
                <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                  AI Feedback
                </h5>

                <p className="text-sm text-zinc-300 leading-relaxed">
                  {question.feedback}
                </p>
              </div>

              <div>
                <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                  Sample Answer
                </h5>

                <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
                  {question.sampleAnswer}
                </p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
</div>
  );
};

export default InterviewReport;
