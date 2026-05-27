import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../utils/api';
import { Sparkles, FileText, ArrowRight, Loader2, Plus, Info } from 'lucide-react';

const SetupInterview = () => {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [generating, setGenerating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      difficultyLevel: 'Mid',
      interviewType: 'Mixed',
      yearsOfExperience: 3,
      resumeId: '',
    },
  });

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const res = await api.get('/api/resumes');
        setResumes(res.data.data);
      } catch (err) {
        console.error('Failed to load resumes:', err);
      } finally {
        setLoadingResumes(false);
      }
    };
    fetchResumes();
  }, []);

  const onSubmit = async (data) => {
    setGenerating(true);
    try {
      // Split skills by comma and trim whitespace
      const skillsRequired = data.skills
        ? data.skills.split(',').map((s) => s.trim()).filter((s) => s)
        : [];

      const payload = {
        jobTitle: data.jobTitle,
        jobDescription: data.jobDescription,
        yearsOfExperience: Number(data.yearsOfExperience),
        skillsRequired,
        difficultyLevel: data.difficultyLevel,
        interviewType: data.interviewType,
        resumeId: data.resumeId || null,
      };

      const res = await api.post('/api/interviews', payload);
      const newInterviewId = res.data.data._id;
      navigate(`/session/${newInterviewId}`);
    } catch (error) {
      console.error('Failed to generate interview:', error);
      alert('Error generating interview. Please try again.');
      setGenerating(false);
    }
  };

  if (generating) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-gray-50 dark:bg-darkBg">
        <div className="text-center max-w-sm space-y-6">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 dark:border-indigo-500/10"></div>
            <Loader2 className="w-20 h-20 text-indigo-600 dark:text-indigo-400 animate-spin absolute inset-0" />
            <Sparkles className="w-8 h-8 text-purple-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold font-display">Crafting Interview</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-light">
              Gemini AI is analyzing your job requirements and resume profile to build 5-6 specialized behavioral, technical, and scenario questions...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 relative">
      <div className="absolute top-[-10%] left-[-15%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none"></div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display">Configure Mock Interview</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Provide target position details to generate tailored questions.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Role Info Card */}
        <div className="p-6 rounded-2xl bg-white border border-gray-100 dark:bg-darkCard dark:border-gray-800/60 shadow-sm space-y-5">
          <h3 className="text-base font-bold uppercase tracking-wider text-gray-400 mb-2">Job Information</h3>

          {/* Job Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
              Job Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Senior Frontend Developer"
              {...register('jobTitle', { required: 'Job Title is required' })}
              className={`w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-darkBg transition-all text-sm ${
                errors.jobTitle ? 'border-red-300 dark:border-red-900/50' : 'border-gray-200 dark:border-gray-800'
              }`}
            />
            {errors.jobTitle && (
              <span className="text-red-500 text-xs mt-1 block">{errors.jobTitle.message}</span>
            )}
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
              Job Description (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Paste the target job description or core duties here to help the AI narrow questions..."
              {...register('jobDescription')}
              className="w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-darkBg transition-all text-sm border-gray-200 dark:border-gray-800"
            />
          </div>

          {/* Experience & Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                Years of Experience Required *
              </label>
              <input
                type="number"
                min="0"
                max="30"
                {...register('yearsOfExperience', {
                  required: 'Experience is required',
                  valueAsNumber: true,
                })}
                className="w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-darkBg transition-all text-sm border-gray-200 dark:border-gray-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                Key Skills (Comma Separated)
              </label>
              <input
                type="text"
                placeholder="e.g. React, Node.js, System Design"
                {...register('skills')}
                className="w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-darkBg transition-all text-sm border-gray-200 dark:border-gray-800"
              />
            </div>
          </div>
        </div>

        {/* Level and Type configuration Card */}
        <div className="p-6 rounded-2xl bg-white border border-gray-100 dark:bg-darkCard dark:border-gray-800/60 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Difficulty Level */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
              Difficulty Level
            </label>
            <select
              {...register('difficultyLevel')}
              className="w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-darkBg transition-all text-sm border-gray-200 dark:border-gray-800"
            >
              <option value="Entry">Entry Level</option>
              <option value="Mid">Mid Level</option>
              <option value="Senior">Senior Level</option>
              <option value="Lead">Lead / Architect</option>
            </select>
          </div>

          {/* Interview Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
              Interview Focus Type
            </label>
            <select
              {...register('interviewType')}
              className="w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-darkBg transition-all text-sm border-gray-200 dark:border-gray-800"
            >
              <option value="Mixed">Mixed (All topics)</option>
              <option value="Technical">Technical & Coding Only</option>
              <option value="Behavioral">Behavioral (Culture Fit)</option>
              <option value="Scenario">Scenario & System Design</option>
            </select>
          </div>
        </div>

        {/* Resume Selection Card */}
        <div className="p-6 rounded-2xl bg-white border border-gray-100 dark:bg-darkCard dark:border-gray-800/60 shadow-sm space-y-4">
          <h3 className="text-base font-bold uppercase tracking-wider text-gray-400">Resume Link</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 leading-normal">
            Select an uploaded resume to incorporate your experiences, or continue without one.
          </p>

          {loadingResumes ? (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Querying resumes...</span>
            </div>
          ) : resumes.length === 0 ? (
            <div className="flex items-start space-x-3 p-4 bg-amber-50/50 border border-amber-200/50 rounded-xl dark:bg-amber-950/10 dark:border-amber-900/30">
              <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-semibold text-amber-800 dark:text-amber-400">No resumes found.</span>{' '}
                <span className="text-gray-500 dark:text-gray-400">
                  Questions will be generated using only job attributes. You can optionally{' '}
                  <span
                    onClick={() => navigate('/resumes')}
                    className="text-indigo-600 hover:underline cursor-pointer font-medium dark:text-indigo-400"
                  >
                    upload a resume here
                  </span>{' '}
                  first.
                </span>
              </div>
            </div>
          ) : (
            <div className="relative">
              <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
              <select
                {...register('resumeId')}
                className="w-full pl-10 pr-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-darkBg transition-all text-sm border-gray-200 dark:border-gray-800"
              >
                <option value="">-- Skip Resume & Continue --</option>
                {resumes.map((resume) => (
                  <option key={resume._id} value={resume._id}>
                    {resume.fileName} ({new Date(resume.createdAt).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Form Action */}
        <button
          type="submit"
          className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-500/10 hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <span>Launch AI Interview</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default SetupInterview;
