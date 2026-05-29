import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { FileText, Upload, Trash2, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react';

const ResumeManager = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchResumes = async () => {
    try {
      const res = await api.get('/api/resumes');
      setResumes(res.data.data);
    } catch (err) {
      console.error('Error fetching resumes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds the 5MB limit.');
      return;
    }
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
    ];
    if (!validTypes.includes(file.type)) {
      setError('Invalid format. Please upload a PDF, DOCX, or TXT file.');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/api/resumes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('Resume uploaded and parsed successfully.');
      fetchResumes();
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.response?.data?.message || 'Failed to upload and parse resume.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;

    try {
      await api.delete(`/api/resumes/${id}`);
      setResumes(resumes.filter((r) => r._id !== id));
      setSuccess('Resume deleted.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Delete failed:', err);
      setError('Failed to delete resume.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 animate-pulse space-y-8">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/4"></div>
        <div className="h-44 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
      </div>
    );
  }
  return (
  <div className="min-h-screen bg-black text-white px-4 py-10 relative overflow-hidden">
    <div className="max-w-4xl mx-auto">
      <div className="mb-10 text-center">
        <h1 className="dancing-script text-4xl md:text-5xl font-bold">
          Resume Manager
        </h1>
      </div>
      {error && (
        <div className="mb-6 p-4 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span>{success}</span>
        </div>
      )}
      <div className="bg-[#111111] border border-gray-800 rounded-3xl p-8 text-center mb-8 shadow-xl">
        <div className="max-w-md mx-auto">
         <h3 className="text-2xl font-semibold mb-2">
            {uploading ? 'Uploading Resume...' : 'Upload Resume'}
          </h3>

          <label
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black hover:bg-white transition font-medium cursor-pointer ${
              uploading ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Select File</span>

            <input
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>
      <div className="bg-[#111111] border border-gray-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold">
            Saved Resumes
          </h3>

          <span className="text-sm text-gray-400">
            {resumes.length} Total
          </span>
        </div>

        {resumes.length === 0 ? (
          <div className="text-center py-14">
            <FileSpreadsheet className="w-14 h-14 text-gray-600 mx-auto mb-4" />

            <p className="text-gray-400">
              No resumes uploaded yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {resumes.map((resume) => (
              <motion.div
                key={resume._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black border border-gray-800 rounded-2xl p-5 flex items-center justify-between hover:border-white/60 transition-all"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold truncate">
                      {resume.fileName}
                    </p>

                    <p className="text-sm text-gray-400 mt-1">
                      Uploaded on{' '}
                      {new Date(resume.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(resume._id)}
                  className="p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);
};

export default ResumeManager;
