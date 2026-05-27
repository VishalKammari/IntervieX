import React, { useEffect, useRef } from 'react';

const AudioVisualizer = ({ isRecording, isSpeaking, stream }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);

  useEffect(() => {
    if (!isRecording || !stream) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      return;
    }

    try {
      // Initialize Web Audio API components
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);

      analyserRef.current.fftSize = 64; // Small size for simplified bar rendering
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      const draw = () => {
        animationRef.current = requestAnimationFrame(draw);
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);

        ctx.clearRect(0, 0, width, height);

        // Center line
        const barWidth = (width / bufferLength) * 1.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          // Normalize height
          barHeight = (dataArrayRef.current[i] / 255) * height * 0.8;
          barHeight = Math.max(barHeight, 4); // minimum height

          // Create styling gradient
          const gradient = ctx.createLinearGradient(0, height / 2 - barHeight / 2, 0, height / 2 + barHeight / 2);
          gradient.addColorStop(0, '#6366f1'); // Indigo
          gradient.addColorStop(0.5, '#a855f7'); // Purple
          gradient.addColorStop(1, '#6366f1');

          ctx.fillStyle = gradient;
          
          // Draw rounded bars centered vertically
          ctx.beginPath();
          const barY = height / 2 - barHeight / 2;
          ctx.roundRect(x, barY, barWidth - 2, barHeight, 4);
          ctx.fill();

          x += barWidth;
        }
      };

      draw();
    } catch (error) {
      console.error('Error starting audio visualizer:', error);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (sourceRef.current) {
        try {
          sourceRef.current.disconnect();
        } catch (e) {}
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [isRecording, stream]);

  if (isRecording) {
    return (
      <canvas
        ref={canvasRef}
        width={300}
        height={80}
        className="w-full max-w-[300px] h-20 bg-transparent rounded-lg"
      />
    );
  }

  if (isSpeaking) {
    return (
      <div className="flex items-center justify-center space-x-1.5 h-20">
        <div className="w-2.5 h-10 bg-indigo-500 rounded-full animate-wave-1"></div>
        <div className="w-2.5 h-14 bg-purple-500 rounded-full animate-wave-2"></div>
        <div className="w-2.5 h-16 bg-indigo-600 rounded-full animate-wave-3"></div>
        <div className="w-2.5 h-12 bg-purple-600 rounded-full animate-wave-4"></div>
        <div className="w-2.5 h-8 bg-indigo-400 rounded-full animate-wave-5"></div>
      </div>
    );
  }

  // Idle state
  return (
    <div className="flex items-center justify-center space-x-1.5 h-20 opacity-30">
      <div className="w-2.5 h-2 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
      <div className="w-2.5 h-2 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
      <div className="w-2.5 h-2 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
      <div className="w-2.5 h-2 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
      <div className="w-2.5 h-2 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
    </div>
  );
};

export default AudioVisualizer;
