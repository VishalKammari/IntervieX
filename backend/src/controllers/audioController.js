// const axios = require('axios');
// const FormData = require('form-data');

// /**
//  * @desc    Proxy Text-to-Speech request to Sarvam AI
//  * @route   POST /api/audio/tts
//  * @access  Private
//  */
// const textToSpeech = async (req, res, next) => {
//   try {
//     const { text } = req.body;

//     if (!text) {
//       res.status(400);
//       throw new Error('Please provide text to convert to speech');
//     }

//     const apiKey = process.env.SARVAM_API_KEY;

//     if (!apiKey) {
//       console.warn('SARVAM_API_KEY not configured. Triggering client-side fallback.');
//       return res.json({
//         success: true,
//         fallback: true,
//         message: 'No Sarvam key configured. Using browser speech synthesis.',
//       });
//     }

//     // Call Sarvam TTS API
//     const response = await axios.post(
//       'https://api.sarvam.ai/text-to-speech',
//       {
//         text,
//         model: 'bulbul:v3',
//         target_language_code: 'en-IN',
//         speaker: 'shubh',
//       },
//       {
//         headers: {
//           'api-subscription-key': apiKey,
//           'Content-Type': 'application/json',
//         },
//       }
//     );

//     res.json({
//       success: true,
//       audio: response.data.audio, // returns the base64 audio string
//     });
//   } catch (error) {
//     console.error('Sarvam TTS API Error:', error.response?.data || error.message);
//     // Return fallback so the client can use Web Speech API
//     res.json({
//       success: true,
//       fallback: true,
//       error: error.message,
//     });
//   }
// };

// /**
//  * @desc    Proxy Speech-to-Text file upload to Sarvam AI
//  * @route   POST /api/audio/stt
//  * @access  Private
//  */
// const speechToText = async (req, res, next) => {
//   try {
//     if (!req.file) {
//       res.status(400);
//       throw new Error('Please upload an audio file');
//     }

//     const apiKey = process.env.SARVAM_API_KEY;

//     if (!apiKey) {
//       console.warn('SARVAM_API_KEY not configured. Returning mock transcription.');
//       return res.json({
//         success: true,
//         transcript: 'This is a simulated transcript of the candidate response for local debugging, since the Sarvam API key is not configured in the backend environment.',
//       });
//     }

//     // Create form data to forward the audio file
//     const form = new FormData();
//     form.append('file', req.file.buffer, {
//       filename: req.file.originalname || 'audio.wav',
//       contentType: req.file.mimetype || 'audio/wav',
//     });
//     form.append('model', 'saaras:v3');
//     form.append('language_code', 'en-IN');

//     // Call Sarvam STT API
//     const response = await axios.post('https://api.sarvam.ai/speech-to-text', form, {
//       headers: {
//         ...form.getHeaders(),
//         'api-subscription-key': apiKey,
//       },
//     });

//     res.json({
//       success: true,
//       transcript: response.data.transcript || '',
//     });
//   } catch (error) {
//     console.error('Sarvam STT API Error:', error.response?.data || error.message);
//     res.json({
//       success: true,
//       transcript: 'Fallback: Server failed to contact STT service. Proceeding with text-based response.',
//     });
//   }
// };

// module.exports = {
//   textToSpeech,
//   speechToText,
// };
const axios = require("axios");
const FormData = require("form-data");
const { SarvamAIClient } = require("sarvamai");

const client = new SarvamAIClient({
  apiSubscriptionKey: process.env.SARVAM_API_KEY,
});

/**
 * @desc    Proxy Text-to-Speech request to Sarvam AI
 * @route   POST /api/audio/tts
 * @access  Private
 */
const textToSpeech = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Please provide text to convert to speech",
      });
    }

    // Check API key
    if (!process.env.SARVAM_API_KEY) {
      console.warn("SARVAM_API_KEY not configured");

      return res.json({
        success: true,
        fallback: true,
        message: "No Sarvam key configured",
      });
    }

    // Call Sarvam TTS
    const response = await client.textToSpeech.convert({
      text,
      target_language_code: "en-IN",
      speaker: "shubh",
      pace: 1.0,
      speech_sample_rate: 22050,
      enable_preprocessing: true,
      model: "bulbul:v3",
    });

    console.log("Sarvam TTS Response:", response);

    return res.json({
      success: true,

      // IMPORTANT: use audios[0]
      audio: response.audios?.[0] || response.audio || null,
    });
  } catch (error) {
    console.error(
      "Sarvam TTS API Error:",
      error.response?.data || error.message
    );

    // frontend can fallback to browser speech
    return res.json({
      success: true,
      fallback: true,
      error: error.message,
    });
  }
};

/**
 * @desc    Proxy Speech-to-Text file upload to Sarvam AI
 * @route   POST /api/audio/stt
 * @access  Private
 */
const speechToText = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an audio file",
      });
    }

    // Check API key
    if (!process.env.SARVAM_API_KEY) {
      console.warn("SARVAM_API_KEY not configured");

      return res.json({
        success: true,
        transcript:
          "Mock transcript because SARVAM_API_KEY is missing.",
      });
    }

    // Create multipart form
    const form = new FormData();

    form.append("file", req.file.buffer, {
      filename: req.file.originalname || "audio.wav",
      contentType: req.file.mimetype || "audio/wav",
    });

    form.append("model", "saaras:v3");
    form.append("language_code", "en-IN");

    // Call Sarvam STT API
    const response = await axios.post(
      "https://api.sarvam.ai/speech-to-text",
      form,
      {
        headers: {
          ...form.getHeaders(),
          "api-subscription-key": process.env.SARVAM_API_KEY,
        },
      }
    );

    console.log("Sarvam STT Response:", response.data);

    return res.json({
      success: true,
      transcript: response.data.transcript || "",
    });
  } catch (error) {
    console.error(
      "Sarvam STT API Error:",
      error.response?.data || error.message
    );

    return res.json({
      success: true,
      transcript:
        "Fallback: Failed contacting speech-to-text service.",
    });
  }
};

module.exports = {
  textToSpeech,
  speechToText,
};