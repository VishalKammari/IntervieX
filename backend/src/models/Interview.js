const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Technical', 'Behavioral', 'Scenario'],
    required: true,
  },
  sampleAnswer: {
    type: String,
    required: true,
  },
  userAnswer: {
    type: String,
    default: '',
  },
  score: {
    type: Number,
    default: 0,
  },
  feedback: {
    type: String,
    default: '',
  },
});

const evaluationSchema = new mongoose.Schema({
  overallScore: {
    type: Number,
    default: 0,
  },
  strengths: {
    type: [String],
    default: [],
  },
  weaknesses: {
    type: [String],
    default: [],
  },
  recommendations: {
    type: [String],
    default: [],
  },
  hiringRecommendation: {
    type: String,
    enum: ['Strong Hire', 'Hire', 'Borderline', 'No Hire', 'Not Evaluated'],
    default: 'Not Evaluated',
  },
  summary: {
    type: String,
    default: '',
  },
});

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      default: null,
    },
    jobTitle: {
      type: String,
      required: [true, 'Please add a job title'],
    },
    jobDescription: {
      type: String,
      default: '',
    },
    yearsOfExperience: {
      type: Number,
      required: [true, 'Please add years of experience'],
    },
    skillsRequired: {
      type: [String],
      default: [],
    },
    difficultyLevel: {
      type: String,
      enum: ['Entry', 'Mid', 'Senior', 'Lead'],
      default: 'Mid',
    },
    interviewType: {
      type: String,
      enum: ['Technical', 'Behavioral', 'Scenario', 'Mixed'],
      default: 'Mixed',
    },
    status: {
      type: String,
      enum: ['pending', 'ongoing', 'completed'],
      default: 'pending',
    },
    questions: {
      type: [questionSchema],
      default: [],
    },
    evaluation: {
      type: evaluationSchema,
      default: () => ({}),
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Interview', interviewSchema);
