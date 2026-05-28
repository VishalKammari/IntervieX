import React from "react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="min-h-screen w-full bg-black text-white flex items-center justify-center px-6 md:px-16">
      <div className="max-w-4xl text-center">
        <h2 className="text-4xl md:text-6xl font-bold leading-tight dancing-script">
          Ace Interviews with AI
        </h2>

        <p className="mt-6 text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">
          IntervieX helps students and developers prepare for real job
          interviews through AI-powered mock interviews, instant
          feedback, and practice sessions designed to improve confidence
          and communication skills.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <Link
            to="/dashboard"
            className="bg-white text-black px-6 py-3 rounded-xl font-semibold hover:scale-105 transition"
          >
            Start Practicing
          </Link>

          <Link
            to="/"
            className="border border-gray-700 px-6 py-3 rounded-xl hover:bg-gray-900 transition"
          >
            Back Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;