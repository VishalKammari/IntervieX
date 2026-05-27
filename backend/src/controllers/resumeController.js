const Resume = require('../models/Resume');
const { parseResume } = require('../utils/resumeParser');

/**
 * @desc    Upload & parse a resume
 * @route   POST /api/resumes/upload
 * @access  Private
 */
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload a file');
    }

    const { originalname, mimetype, buffer, size } = req.file;

    // Parse the file buffer to get extracted text
    const extractedText = await parseResume(buffer, mimetype);

    // Save to database
    const resume = await Resume.create({
      user: req.user._id,
      fileName: originalname,
      extractedText,
    });

    res.status(201).json({
      success: true,
      data: resume,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all resumes of logged-in user
 * @route   GET /api/resumes
 * @access  Private
 */
const getResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: resumes.length,
      data: resumes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a resume
 * @route   DELETE /api/resumes/:id
 * @access  Private
 */
const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      res.status(404);
      throw new Error('Resume not found');
    }

    // Check user ownership
    if (resume.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to delete this resume');
    }

    await resume.deleteOne();

    res.json({
      success: true,
      message: 'Resume deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadResume,
  getResumes,
  deleteResume,
};
