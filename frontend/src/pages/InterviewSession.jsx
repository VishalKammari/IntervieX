import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import AudioVisualizer from '../components/AudioVisualizer';
import { Mic, Square, Volume2, ArrowRight, Play, CheckCircle, RotateCcw, AlertTriangle, HelpCircle } from 'lucide-react';

const InterviewSession = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);

  // Voice/Audio States
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [stream, setStream] = useState(null);
  const [userAnswerText, setUserAnswerText] = useState('');
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes per question
  
  // Finalizing Evaluation state
  const [evaluating, setEvaluating] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const speechUtteranceRef = useRef(null);
  const audioPlayerRef = useRef(null);

  // Fetch Interview details on load
  const fetchInterview = async () => {
    try {
      const res = await api.get(`/api/interviews/${id}`);
      setInterview(res.data.data);
      
      // Find where the user left off (first question with empty answer)
      const firstUnanswered = res.data.data.questions.findIndex((q) => !q.userAnswer);
      if (firstUnanswered !== -1) {
        setCurrentIdx(firstUnanswered);
      } else {
        // If all are answered, go to the last one or report
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

  // Handle TTS and timer reset when question index changes
  useEffect(() => {
    if (!interview || !interview.questions[currentIdx]) return;
    
    setUserAnswerText(interview.questions[currentIdx].userAnswer || '');
    setTimeLeft(120);
    stopSpeaking();
    stopRecordingOnly();

    // Reset and start countdown timer
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

    // Speak the question automatically after a short delay
    const t = setTimeout(() => {
      speakQuestion(interview.questions[currentIdx].text);
    }, 800);

    return () => {
      clearTimeout(t);
      clearInterval(timerRef.current);
    };
  }, [currentIdx, interview]);

  // Web Speech API / Sarvam TTS integration
  const speakQuestion = async (text) => {
    stopSpeaking();
    setIsSpeaking(true);

    try {
      // Try backend Sarvam TTS
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
        // Fallback to browser SpeechSynthesis
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

  // Recording integration
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
      
      // Save current answer to backend
      const res = await api.put(`/api/interviews/${id}/answer`, {
        questionId,
        userAnswer: userAnswerText,
      });

      // Update local state
      const updatedInterview = res.data.data;
      setInterview(updatedInterview);

      // Advance to next question or complete
      if (currentIdx < updatedInterview.questions.length - 1) {
        setCurrentIdx(currentIdx + 1);
      } else {
        // Trigger report evaluation
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
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
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

  // Format time display
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 relative">
      {/* Background blur */}
      <div className="absolute top-[-10%] right-[-10%] w-[35%] h-[35%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none"></div>

      {/* Progress Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            {interview.jobTitle}
          </span>
          <h2 className="text-2xl font-bold font-display mt-0.5">Live Mock Interview</h2>
        </div>

        {/* Counter progress */}
        <div className="flex items-center space-x-3 shrink-0">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Question {currentIdx + 1} of {interview.questions.length}
          </span>
          <div className="w-24 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / interview.questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Active Question Box */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-100 dark:bg-darkCard dark:border-gray-800/60 shadow-sm mb-6">
        <div className="flex justify-between items-start gap-4">
          <div className="inline-flex px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 text-xs font-bold shrink-0">
            {activeQuestion.type} Question
          </div>

          {/* Question countdown */}
          <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold ${timeLeft <= 20 ? 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 animate-pulse' : 'bg-gray-50 text-gray-500 dark:bg-gray-900 dark:text-gray-400'}`}>
            <span>Time Remaining:</span>
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Question text */}
        <div className="mt-6 flex gap-4 items-start">
          <div className="w-10 h-10 rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold leading-normal text-gray-800 dark:text-gray-100">
            {activeQuestion.text}
          </h3>
        </div>

        {/* Audio controls */}
        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800/60 flex items-center gap-3">
          <button
            onClick={() => speakQuestion(activeQuestion.text)}
            disabled={isSpeaking || isRecording}
            className="flex items-center space-x-1 px-4 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-xs rounded-xl transition-colors disabled:opacity-50"
          >
            <Volume2 className="w-4 h-4" />
            <span>Speak Question</span>
          </button>
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="text-xs text-red-600 hover:underline dark:text-red-400"
            >
              Stop Audio
            </button>
          )}
        </div>
      </div>

      {/* Voice & Transcript section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Audio Voice Input Panel */}
        <div className="p-6 rounded-2xl bg-white border border-gray-100 dark:bg-darkCard dark:border-gray-800/60 shadow-sm flex flex-col items-center justify-center min-h-[220px]">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">Voice Control</h4>
          
          {/* Waveform Visualizer */}
          <div className="w-full mb-6">
            <AudioVisualizer isRecording={isRecording} isSpeaking={isSpeaking} stream={stream} />
          </div>

          {/* Action button */}
          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={isTranscribing}
              className="w-16 h-16 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 transition-transform active:scale-95 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:opacity-50"
              title="Start Recording"
            >
              <Mic className="w-6 h-6" />
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-500/20 transition-transform active:scale-95 animate-pulse focus:outline-none"
              title="Stop Recording"
            >
              <Square className="w-6 h-6" />
            </button>
          )}
          
          <p className="text-xs text-gray-400 mt-4 text-center">
            {isRecording ? 'Recording microphone...' : isTranscribing ? 'Transcribing text...' : 'Click mic to reply via speech'}
          </p>
        </div>

        {/* Written response box */}
        <div className="md:col-span-2 p-6 rounded-2xl bg-white border border-gray-100 dark:bg-darkCard dark:border-gray-800/60 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Your Transcript Answer</h4>
            {userAnswerText && (
              <button
                onClick={() => setUserAnswerText('')}
                className="text-[10px] text-gray-400 hover:text-red-500 flex items-center space-x-0.5"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          <textarea
            value={userAnswerText}
            onChange={(e) => setUserAnswerText(e.target.value)}
            placeholder="Your spoken transcript will stream here, or you can manually type/edit your response..."
            className="w-full flex-1 min-h-[140px] px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-darkBg transition-all text-sm border-gray-200 dark:border-gray-800 leading-relaxed resize-none"
            disabled={isTranscribing}
          />
          
          {isTranscribing && (
            <div className="flex items-center space-x-2 text-xs text-gray-500 mt-2">
              <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Processing microphone upload...</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePreviousQuestion}
          disabled={currentIdx === 0}
          className="px-5 py-3 rounded-xl border border-gray-200 bg-white/50 text-gray-700 dark:border-gray-800 dark:bg-darkCard/50 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:pointer-events-none"
        >
          Previous Question
        </button>

        <button
          onClick={handleSaveAnswer}
          className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-500/10 hover:shadow-lg transition-colors flex items-center space-x-1.5"
        >
          <span>{isLastQuestion ? 'Finish & Review' : 'Next Question'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default InterviewSession;
