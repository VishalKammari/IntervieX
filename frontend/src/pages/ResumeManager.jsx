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

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds the 5MB limit.');
      return;
    }

    // Validate type
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
    <div className="max-w-4xl mx-auto px-4 py-10 relative">
      <div className="absolute top-[-10%] right-[-10%] w-[35%] h-[35%] rounded-full bg-purple-500/5 blur-[100px] pointer-events-none"></div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display">Manage Resumes</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Upload and store multiple resumes to customize your interview preparation.
        </p>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Upload Drag Box */}
      <div className="p-8 rounded-2xl bg-white border border-gray-100 dark:bg-darkCard dark:border-gray-800/60 shadow-sm text-center mb-8">
        <div className="max-w-md mx-auto">
          <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto mb-4">
            {uploading ? (
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Upload className="w-6 h-6" />
            )}
          </div>
          <h4 className="text-lg font-semibold mb-1">
            {uploading ? 'Parsing Resume text...' : 'Upload your resume'}
          </h4>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">
            Supports PDF, DOCX, or TXT formats (Max size: 5MB)
          </p>

          <label className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-sm transition-all duration-200 cursor-pointer ${uploading ? 'opacity-55 pointer-events-none' : ''}`}>
            <Upload className="w-4 h-4" />
            <span>Choose File</span>
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

      {/* Resume Grid */}
      <div className="p-6 rounded-2xl bg-white border border-gray-100 dark:bg-darkCard dark:border-gray-800/60 shadow-sm">
        <h3 className="text-lg font-bold mb-6 font-display">Stored Resumes ({resumes.length})</h3>

        {resumes.length === 0 ? (
          <div className="text-center py-12">
            <FileSpreadsheet className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-sm text-gray-400">No resumes found. Please upload one above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {resumes.map((resume) => (
              <div
                key={resume._id}
                className="flex justify-between items-center p-4 rounded-xl border border-gray-50 bg-gray-50/50 dark:border-gray-800/40 dark:bg-gray-900/10 hover:border-gray-200 dark:hover:border-gray-700 transition-all group"
              >
                <div className="flex items-center space-x-4 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{resume.fileName}</p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Uploaded on {new Date(resume.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleDelete(resume._id)}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/25 rounded-lg transition-colors focus:outline-none"
                    title="Delete Resume"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeManager;
