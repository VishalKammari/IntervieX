import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../utils/api';
import {
  Sparkles,
  FileText,
  ArrowRight,
  Loader2,
  Info,
} from 'lucide-react';
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
      const skillsRequired = data.skills
        ? data.skills
            .split(',')
            .map((s) => s.trim())
            .filter((s) => s)
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
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-white animate-spin" />
          <p className="text-zinc-400 text-sm font-medium tracking-wide">
          Creating your interview...
          </p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-10 relative overflow-hidden">
      <div className="max-w-3xl mx-auto relative z-10">
        <div className="mb-10">
          <h1 className="text-4xl font-bold dancing-script">
            Configure Mock Interview
          </h1>

          <p className="text-sm text-zinc-400 mt-2">
            Enter job details to generate personalized mock interview
            questions.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-8"
        >
          <div className="p-6 rounded-3xl bg-[#0a0a0a] border border-zinc-800 space-y-5">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
              Job Information
            </h3>
            <div>
              <label className="block text-sm text-zinc-400 mb-2">
                Job Title *
              </label>

              <input
                type="text"
                placeholder="e.g. Frontend Developer"
                {...register('jobTitle', {
                  required: 'Job Title is required',
                })}
                className={`w-full px-4 py-3 rounded-xl border bg-black text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white-500 transition-all text-sm ${
                  errors.jobTitle
                    ? 'border-red-800'
                    : 'border-zinc-800'
                }`}
              />

              {errors.jobTitle && (
                <span className="text-red-400 text-xs mt-1 block">
                  {errors.jobTitle.message}
                </span>
              )}
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-2">
                Job Description
              </label>

              <textarea
                rows={4}
                placeholder="Paste the job description here..."
                {...register('jobDescription')}
                className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-black text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white-500 transition-all text-sm"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  Years of Experience
                </label>

                <input
                  type="number"
                  min="0"
                  max="30"
                  {...register('yearsOfExperience', {
                    required: 'Experience is required',
                    valueAsNumber: true,
                  })}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-black text-white focus:outline-none focus:ring-2 focus:ring-white-500 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  Skills
                </label>

                <input
                  type="text"
                  placeholder="React, Node.js, MongoDB"
                  {...register('skills')}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-black text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white-500 transition-all text-sm"
                />
              </div>
            </div>
          </div>
          <div className="p-6 rounded-3xl bg-[#0a0a0a] border border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">
                Difficulty Level
              </label>

              <select
                {...register('difficultyLevel')}
                className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-black text-white focus:outline-none focus:ring-2 focus:ring-white-500 transition-all text-sm"
              >
                <option value="Entry">Entry Level</option>
                <option value="Mid">Mid Level</option>
                <option value="Senior">Senior Level</option>
                <option value="Lead">Lead / Architect</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">
                Interview Type
              </label>

              <select
                {...register('interviewType')}
                className="w-full px-4 py-3 rounded-xl border border-zinc-800 bg-black text-white focus:outline-none focus:ring-2 focus:ring-white-500 transition-all text-sm"
              >
                <option value="Mixed">Mixed</option>
                <option value="Technical">Technical</option>
                <option value="Behavioral">Behavioral</option>
                <option value="Scenario">Scenario</option>
              </select>
            </div>
          </div>
          <div className="p-6 rounded-3xl bg-[#0a0a0a] border border-zinc-800 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
              Resume
            </h3>

            <p className="text-sm text-zinc-400">
              Select a resume to personalize your mock interview.
            </p>

            {loadingResumes ? (
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading resumes...</span>
              </div>
            ) : resumes.length === 0 ? (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <Info className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />

                <div className="text-sm text-zinc-400">
                  No resumes found. You can upload one from the
                  resumes page.
                </div>
              </div>
            ) : (
              <div className="relative">
                <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />

                <select
                  {...register('resumeId')}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-800 bg-black text-white focus:outline-none focus:ring-2 focus:ring-white-500 transition-all text-sm"
                >
                  <option value="">
                    -- Skip Resume & Continue --
                  </option>

                  {resumes.map((resume) => (
                    <option
                      key={resume._id}
                      value={resume._id}
                    >
                      {resume.fileName} (
                      {new Date(
                        resume.createdAt
                      ).toLocaleDateString()}
                      )
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <button
            type="submit"
            className="w-full py-4 rounded-xl bg-white text-black hover:bg-zinc-200 font-semibold transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span>Start Mock Interview</span>

            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetupInterview;
