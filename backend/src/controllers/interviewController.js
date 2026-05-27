const Interview = require('../models/Interview');
const Resume = require('../models/Resume');
const { generateQuestions, evaluateInterview } = require('../utils/geminiHelper');

/**
 * @desc    Create interview & generate questions
 * @route   POST /api/interviews
 * @access  Private
 */
const createInterview = async (req, res, next) => {
  try {
    const {
      jobTitle,
      jobDescription,
      yearsOfExperience,
      skillsRequired,
      difficultyLevel,
      interviewType,
      resumeId,
    } = req.body;

    if (!jobTitle || !yearsOfExperience) {
      res.status(400);
      throw new Error('Please include job title and years of experience');
    }

    let resumeText = '';
    let selectedResumeId = null;

    if (resumeId) {
      const resume = await Resume.findById(resumeId);
      if (resume && resume.user.toString() === req.user._id.toString()) {
        resumeText = resume.extractedText;
        selectedResumeId = resume._id;
      }
    }

    // Call Gemini API to generate questions
    const generated = await generateQuestions(
      jobTitle,
      jobDescription,
      yearsOfExperience,
      skillsRequired,
      resumeText
    );

    // Format the generated questions list into schema structure
    const questions = generated.map((q) => ({
      text: q.text,
      type: q.type || 'Mixed',
      sampleAnswer: q.sampleAnswer || 'No sample answer provided.',
      userAnswer: '',
      score: 0,
      feedback: '',
    }));

    // Save Interview session to database
    const interview = await Interview.create({
      user: req.user._id,
      resume: selectedResumeId,
      jobTitle,
      jobDescription,
      yearsOfExperience,
      skillsRequired: skillsRequired || [],
      difficultyLevel: difficultyLevel || 'Mid',
      interviewType: interviewType || 'Mixed',
      status: 'pending',
      questions,
    });

    res.status(201).json({
      success: true,
      data: interview,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user interviews
 * @route   GET /api/interviews
 * @access  Private
 */
const getInterviews = async (req, res, next) => {
  try {
    const interviews = await Interview.find({ user: req.user._id })
      .populate('resume', 'fileName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: interviews.length,
      data: interviews,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single interview details
 * @route   GET /api/interviews/:id
 * @access  Private
 */
const getInterviewById = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.id).populate('resume', 'fileName');

    if (!interview) {
      res.status(404);
      throw new Error('Interview not found');
    }

    if (interview.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to access this interview');
    }

    res.json({
      success: true,
      data: interview,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Save response text for a specific question
 * @route   PUT /api/interviews/:id/answer
 * @access  Private
 */
const saveAnswer = async (req, res, next) => {
  try {
    const { questionId, userAnswer } = req.body;

    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      res.status(404);
      throw new Error('Interview not found');
    }

    if (interview.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized');
    }

    if (interview.status === 'completed') {
      res.status(400);
      throw new Error('Interview has already been completed and evaluated');
    }

    // Find the question and update the answer
    const question = interview.questions.id(questionId);
    if (!question) {
      res.status(404);
      throw new Error('Question not found');
    }

    question.userAnswer = userAnswer;
    interview.status = 'ongoing';
    await interview.save();

    res.json({
      success: true,
      data: interview,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Finalize interview & request AI evaluation
 * @route   POST /api/interviews/:id/evaluate
 * @access  Private
 */
const submitEvaluation = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      res.status(404);
      throw new Error('Interview not found');
    }

    if (interview.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized');
    }

    let resumeText = '';
    if (interview.resume) {
      const resume = await Resume.findById(interview.resume);
      if (resume) {
        resumeText = resume.extractedText;
      }
    }

    // Call Gemini API to evaluate interview responses
    const evalData = await evaluateInterview(
      interview.jobTitle,
      interview.jobDescription,
      interview.yearsOfExperience,
      interview.questions,
      resumeText
    );

    // Update evaluation scores and feedback details for each question
    if (evalData.questionEvaluations && Array.isArray(evalData.questionEvaluations)) {
      evalData.questionEvaluations.forEach((qEval, idx) => {
        let question = null;
        
        // Match by ID if provided
        if (qEval.questionId) {
          question = interview.questions.id(qEval.questionId);
        }
        
        // Fallback to matching by index
        if (!question && idx < interview.questions.length) {
          question = interview.questions[idx];
        }
        
        // Fallback to text matching
        if (!question) {
          question = interview.questions.find(
            (q) => q.text.toLowerCase().trim() === qEval.questionText?.toLowerCase().trim()
          );
        }

        if (question) {
          question.score = qEval.score || 0;
          question.feedback = qEval.feedback || '';
          if (qEval.betterSampleAnswer) {
            question.sampleAnswer = qEval.betterSampleAnswer;
          }
        }
      });
    }

    // Update overall evaluation schema
    interview.evaluation = {
      overallScore: evalData.overallScore || 0,
      strengths: evalData.strengths || [],
      weaknesses: evalData.weaknesses || [],
      recommendations: evalData.recommendations || [],
      hiringRecommendation: evalData.hiringRecommendation || 'Borderline',
      summary: evalData.summary || '',
    };

    interview.status = 'completed';
    interview.completedAt = new Date();
    await interview.save();

    res.json({
      success: true,
      data: interview,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInterview,
  getInterviews,
  getInterviewById,
  saveAnswer,
  submitEvaluation,
};
