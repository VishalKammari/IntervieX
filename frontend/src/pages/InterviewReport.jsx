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
        
        // Trigger celebratory confetti on strong results!
        if (res.data.data.evaluation?.overallScore >= 75) {
          // confetti({
          //   particleCount: 80,
          //   spread: 60,
          //   origin: { y: 0.6 }
          // });
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

  const handlePrint = () => {
    window.print();
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

  // Compile data for Radar Chart
  // We extract scores from different question types
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
    <div className="max-w-4xl mx-auto px-4 py-10 relative print:p-0 print:max-w-full">
      {/* Background gradients (hidden on print) */}
      <div className="absolute top-[-10%] left-[-15%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none print:hidden"></div>
      
      {/* Header controls (hidden on print) */}
      <div className="flex justify-between items-center mb-8 print:hidden">
        <Link
          to="/dashboard"
          className="flex items-center space-x-1.5 text-sm font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>

        <button
          onClick={handlePrint}
          className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Save PDF Report</span>
        </button>
      </div>

      {/* Main Score & Recommendation Card */}
      <div className="p-8 rounded-2xl bg-white border border-gray-100 dark:bg-darkCard dark:border-gray-800/60 shadow-sm mb-8 print:border-none print:shadow-none print:p-0">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Score Indicator */}
          <div className="flex flex-col items-center shrink-0">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-gray-100 dark:stroke-gray-800 fill-transparent"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-indigo-600 dark:stroke-indigo-500 fill-transparent transition-all duration-1000"
                  strokeWidth="8"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * interview.evaluation.overallScore) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <div className="text-center">
                <span className="text-4xl font-extrabold font-display">{interview.evaluation.overallScore}</span>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Overall Score</p>
              </div>
            </div>
          </div>

          {/* Core Info & Recommendation */}
          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">
                Evaluation Report
              </span>
              <h2 className="text-3xl font-bold font-display mt-0.5">{interview.jobTitle}</h2>
              <p className="text-xs text-gray-400 mt-1">
                Completed on {new Date(interview.completedAt || interview.updatedAt).toLocaleDateString()}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold border ${badge.bg}`}>
                {badge.icon}
                <span>{interview.evaluation.hiringRecommendation}</span>
              </div>
              <span className="text-xs font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
                {interview.difficultyLevel} Level
              </span>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-light">
              {interview.evaluation.summary}
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Strengths, Weaknesses, Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 print:grid-cols-1 print:gap-4">
        {/* Strengths & Weaknesses */}
        <div className="p-6 rounded-2xl bg-white border border-gray-100 dark:bg-darkCard dark:border-gray-800/60 shadow-sm space-y-6">
          {/* Strengths */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Key Strengths</span>
            </h4>
            <ul className="space-y-2.5">
              {interview.evaluation.strengths.map((str, idx) => (
                <li key={idx} className="text-xs text-gray-600 dark:text-gray-300 leading-normal flex items-start space-x-2">
                  <span className="text-emerald-500 font-bold shrink-0">•</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-purple-500" />
              <span>Gaps & Weaknesses</span>
            </h4>
            <ul className="space-y-2.5">
              {interview.evaluation.weaknesses.map((weak, idx) => (
                <li key={idx} className="text-xs text-gray-600 dark:text-gray-300 leading-normal flex items-start space-x-2">
                  <span className="text-purple-500 font-bold shrink-0">•</span>
                  <span>{weak}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Radar Chart (hidden on print for cleanliness, or embedded) */}
        <div className="p-6 rounded-2xl bg-white border border-gray-100 dark:bg-darkCard dark:border-gray-800/60 shadow-sm flex flex-col justify-center items-center print:hidden">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Competence Distribution</h4>
          <div className="w-full h-52 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" r="70%" data={chartData}>
                <PolarGrid stroke="#e2e8f0" className="dark:stroke-gray-800" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" />
                <Radar
                  name="Score"
                  dataKey="A"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.25}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Actionable recommendations */}
      <div className="p-6 rounded-2xl bg-white border border-gray-100 dark:bg-darkCard dark:border-gray-800/60 shadow-sm mb-8">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">AI Recommended Roadmap</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {interview.evaluation.recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-gray-50 bg-gray-50/50 dark:border-gray-800/30 dark:bg-gray-900/10 text-xs text-gray-600 dark:text-gray-300 leading-relaxed"
            >
              <div className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold mb-2.5">
                {idx + 1}
              </div>
              {rec}
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Q&A Analysis */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold font-display mb-4">Question-by-Question Evaluation</h3>

        {interview.questions.map((question, idx) => (
          <div
            key={question._id}
            className="rounded-2xl border border-gray-100 bg-white dark:bg-darkCard dark:border-gray-800/60 overflow-hidden shadow-sm"
          >
            {/* Header Accordion Clickable */}
            <div
              onClick={() => toggleExpand(question._id)}
              className="p-5 flex justify-between items-center gap-4 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors select-none"
            >
              <div className="flex items-start space-x-3.5 min-w-0">
                <span className="text-sm font-bold text-gray-400 shrink-0 mt-0.5">
                  Q{idx + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">
                    {question.type}
                  </p>
                  <p className="text-sm font-semibold truncate max-w-[400px] mt-0.5">
                    {question.text}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4 shrink-0">
                <span className="text-sm font-bold font-display text-indigo-600 dark:text-indigo-400">
                  {question.score}/100
                </span>
                {expandedQId === question._id ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>

            {/* Accordion Expanded Content */}
            {expandedQId === question._id && (
              <div className="px-5 pb-6 pt-2 border-t border-gray-100 dark:border-gray-800/60 space-y-5">
                {/* Question Full */}
                <div>
                  <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Question Asked</h5>
                  <p className="text-sm text-gray-800 dark:text-gray-200 leading-normal">{question.text}</p>
                </div>

                {/* Candidate Answer */}
                <div>
                  <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Your Response Transcript</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-light italic bg-gray-50/50 border border-gray-50 p-4 rounded-xl dark:bg-gray-900/10 dark:border-gray-800/40">
                    {question.userAnswer ? `"${question.userAnswer}"` : '[Question Skipped]'}
                  </p>
                </div>

                {/* Question Specific Feedback */}
                <div>
                  <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">AI Feedback</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-light">
                    {question.feedback}
                  </p>
                </div>

                {/* Ideal Answer sample */}
                <div>
                  <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Model Answer Guide</h5>
                  <p className="text-sm text-indigo-700/80 dark:text-indigo-400/80 leading-relaxed font-light bg-indigo-50/20 border border-indigo-50/10 p-4 rounded-xl dark:bg-indigo-950/10">
                    {question.sampleAnswer}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Styled css print sheet specifically formatted for browser native print PDF */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          nav {
            display: none !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:border-none {
            border: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:grid-cols-1 {
            grid-template-columns: 1fr !important;
          }
          .print\\:gap-4 {
            gap: 1rem !important;
          }
          h2, h3, h4, h5, p, span, li {
            color: black !important;
          }
          circle {
            stroke: #4f46e5 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default InterviewReport;
