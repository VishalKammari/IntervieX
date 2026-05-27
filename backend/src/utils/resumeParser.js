const pdf = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Parses file buffer and extracts text content based on mime type
 * @param {Buffer} buffer - File buffer
 * @param {string} mimeType - Mimetype of the file
 * @returns {Promise<string>} Extracted text
 */
const parseResume = async (buffer, mimeType) => {
  try {
    if (mimeType === 'application/pdf') {
      const data = await pdf(buffer);
      return data.text;
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword'
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } else if (mimeType.startsWith('text/')) {
      return buffer.toString('utf8');
    } else {
      throw new Error('Unsupported file format. Please upload PDF, DOCX, or TXT.');
    }
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw new Error(`Failed to parse resume: ${error.message}`);
  }
};

module.exports = { parseResume };
