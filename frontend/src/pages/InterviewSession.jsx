import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Mic, Square, Volume2, ArrowRight, Play, CheckCircle, RotateCcw, AlertTriangle, HelpCircle } from 'lucide-react';

const InterviewSession = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [stream, setStream] = useState(null);
  const [userAnswerText, setUserAnswerText] = useState('');
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes per question
  const [evaluating, setEvaluating] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const speechUtteranceRef = useRef(null);
  const audioPlayerRef = useRef(null);

 
  const fetchInterview = async () => {
    try {
      const res = await api.get(`/api/interviews/${id}`);
      setInterview(res.data.data);
      
      const firstUnanswered = res.data.data.questions.findIndex((q) => !q.userAnswer);
      if (firstUnanswered !== -1) {
        setCurrentIdx(firstUnanswered);
      } else {
        if (res.data.data.status === 'completed') {
          navigate(`/report/${id}`);
        } else {
          setCurrentIdx(res.data.data.questions.length - 1);
        }
      }
    } catch (err) {
      console.error('Failed to load session:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterview();

    return () => {
      stopSpeaking();
      stopRecordingOnly();
      clearInterval(timerRef.current);
    };
  }, [id]);

  useEffect(() => {
    if (!interview || !interview.questions[currentIdx]) return;
    
    setUserAnswerText(interview.questions[currentIdx].userAnswer || '');
    setTimeLeft(120);
    stopSpeaking();
    stopRecordingOnly();

    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const t = setTimeout(() => {
      speakQuestion(interview.questions[currentIdx].text);
    }, 800);

    return () => {
      clearTimeout(t);
      clearInterval(timerRef.current);
    };
  }, [currentIdx, interview]);

  const speakQuestion = async (text) => {
    stopSpeaking();
    setIsSpeaking(true);

    try {
  
      const res = await api.post('/api/audio/tts', { text });
      
      if (res.data.success && res.data.audio) {
        const audioSrc = `data:audio/wav;base64,${res.data.audio}`;
        audioPlayerRef.current = new Audio(audioSrc);
        audioPlayerRef.current.onended = () => {
          setIsSpeaking(false);
        };
        audioPlayerRef.current.onerror = () => {
          fallbackSpeechSynthesis(text);
        };
        await audioPlayerRef.current.play();
      } else {
        fallbackSpeechSynthesis(text);
      }
    } catch (err) {
      console.error('TTS call failed, using browser synthesis fallback', err);
      fallbackSpeechSynthesis(text);
    }
  };

  const fallbackSpeechSynthesis = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
      };
      speechUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } else {
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if (audioPlayerRef.current) {
      try {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      } catch (e) {}
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const startRecording = async () => {
    stopSpeaking();
    audioChunksRef.current = [];
    
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(audioStream);
      setIsRecording(true);

      const recorder = new MediaRecorder(audioStream, {
        mimeType: 'audio/webm',
      });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleAudioUpload(audioBlob);
      };

      recorder.start(250); // Slice size
    } catch (err) {
      console.error('Failed to access microphone:', err);
      alert('Microphone access is required to record speech responses. Please allow permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all mic tracks
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    }
  };

  const stopRecordingOnly = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
      setIsRecording(false);
    }
    if (stream) {
      try {
        stream.getTracks().forEach((track) => track.stop());
      } catch (e) {}
      setStream(null);
    }
  };

  const handleAudioUpload = async (blob) => {
    setIsTranscribing(true);
    const formData = new FormData();
    formData.append('file', blob, 'answer.webm');

    try {
      const res = await api.post('/api/audio/stt', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success && res.data.transcript) {
        setUserAnswerText((prev) => {
          const separator = prev ? ' ' : '';
          return prev + separator + res.data.transcript;
        });
      }
    } catch (error) {
      console.error('STT Transcription failed:', error);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSaveAnswer = async () => {
    if (!userAnswerText.trim()) {
      if (!window.confirm('You are submitting an empty answer. Proceed?')) return;
    }

    try {
      const questionId = interview.questions[currentIdx]._id;
      
      const res = await api.put(`/api/interviews/${id}/answer`, {
        questionId,
        userAnswer: userAnswerText,
      });

      const updatedInterview = res.data.data;
      setInterview(updatedInterview);

      if (currentIdx < updatedInterview.questions.length - 1) {
        setCurrentIdx(currentIdx + 1);
      } else {
        handleFinishInterview();
      }
    } catch (err) {
      console.error('Failed to save answer:', err);
    }
  };

  const handleFinishInterview = async () => {
    setEvaluating(true);
    stopSpeaking();
    stopRecordingOnly();
    clearInterval(timerRef.current);

    try {
      await api.post(`/api/interviews/${id}/evaluate`);
      navigate(`/report/${id}`);
    } catch (error) {
      console.error('Evaluation failed:', error);
      alert('Error saving evaluation report. You can review and compile it again from the dashboard.');
      navigate('/dashboard');
    } finally {
      setEvaluating(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 dark:bg-darkBg">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Entering mock session room...</p>
        </div>
      </div>
    );
  }

  if (evaluating) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-gray-50 dark:bg-darkBg">
        <div className="text-center max-w-sm space-y-6">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 dark:border-emerald-500/10 animate-ping"></div>
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
            <CheckCircle className="w-8 h-8 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold font-display">AI Evaluator Working</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-light">
              Analyzing technical depth, response structure, communication confidence, and formulating model improvements. This may take a moment...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const activeQuestion = interview.questions[currentIdx];
  const isLastQuestion = currentIdx === interview.questions.length - 1;

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8 relative overflow-hidden">
    <div className="max-w-4xl mx-auto relative z-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
            {interview.jobTitle}
          </span>

          <h2 className="text-3xl font-bold mt-1">
            Live Mock Interview
          </h2>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <span className="text-xs text-zinc-400">
            Question {currentIdx + 1} of{' '}
            {interview.questions.length}
          </span>

          <div className="w-24 h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-300"
              style={{
                width: `${
                  ((currentIdx + 1) /
                    interview.questions.length) *
                  100
                }%`,
              }}
            ></div>
          </div>
        </div>
      </div>
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0a0a0a] border border-zinc-800 mb-6">
        <div className="flex justify-between items-start gap-4">
          <div className="inline-flex px-3 py-1 rounded-lg bg-zinc-900 text-zinc-300 text-xs font-semibold shrink-0">
            {activeQuestion.type} Question
          </div>
          <div
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold ${
              timeLeft <= 20
                ? 'bg-red-950/30 text-red-400 animate-pulse'
                : 'bg-zinc-900 text-zinc-400'
            }`}
          >
            <span>Time:</span>
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>
        <div className="mt-6 flex gap-4 items-start">
          <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-white shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>

          <h3 className="text-xl font-semibold leading-relaxed text-white">
            {activeQuestion.text}
          </h3>
        </div>

        {/* Audio Controls */}
        <div className="mt-6 pt-6 border-t border-zinc-800 flex items-center gap-3">
          <button
            onClick={() =>
              speakQuestion(activeQuestion.text)
            }
            disabled={isSpeaking || isRecording}
            className="flex items-center space-x-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-sm rounded-xl transition disabled:opacity-50"
          >
            <Volume2 className="w-4 h-4" />
            <span>Speak Question</span>
          </button>

          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="text-sm text-red-400 hover:underline"
            >
              Stop Audio
            </button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 rounded-3xl bg-[#0a0a0a] border border-zinc-800 flex flex-col items-center justify-center min-h-[220px]">
          <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-6">
            Voice Control
          </h4>

          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={isTranscribing}
              className="w-16 h-16 rounded-full bg-white hover:bg-zinc-200 text-black flex items-center justify-center transition active:scale-95 disabled:opacity-50"
            >
              <Mic className="w-6 h-6" />
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition active:scale-95 animate-pulse"
            >
              <Square className="w-6 h-6" />
            </button>
          )}

          <p className="text-xs text-zinc-500 mt-4 text-center">
            {isRecording
              ? 'Recording microphone...'
              : isTranscribing
              ? 'Transcribing speech...'
              : 'Click mic to answer'}
          </p>
        </div>
        <div className="md:col-span-2 p-6 rounded-3xl bg-[#0a0a0a] border border-zinc-800 flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
              Your Answer
            </h4>

            {userAnswerText && (
              <button
                onClick={() => setUserAnswerText('')}
                className="text-xs text-zinc-500 hover:text-red-400 flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          <textarea
            value={userAnswerText}
            onChange={(e) =>
              setUserAnswerText(e.target.value)
            }
            placeholder="Your answer will appear here..."
            className="w-full flex-1 min-h-[140px] px-4 py-3 rounded-xl border border-zinc-800 bg-black text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white-500 transition-all text-sm leading-relaxed resize-none"
            disabled={isTranscribing}
          />

          {isTranscribing && (
            <div className="flex items-center space-x-2 text-xs text-zinc-400 mt-3">
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>

              <span>Processing speech...</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-between items-center">
        <button
          onClick={handlePreviousQuestion}
          disabled={currentIdx === 0}
          className="px-5 py-3 rounded-xl border border-zinc-800 bg-[#0a0a0a] text-white font-medium hover:bg-zinc-900 transition disabled:opacity-30 disabled:pointer-events-none"
        >
          Previous Question
        </button>

        <button
          onClick={handleSaveAnswer}
          className="px-6 py-3 rounded-xl bg-white text-black hover:bg-zinc-200 font-semibold transition flex items-center space-x-2"
        >
          <span>
            {isLastQuestion
              ? 'Finish & Review'
              : 'Next Question'}
          </span>

          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
  );
};

export default InterviewSession;
