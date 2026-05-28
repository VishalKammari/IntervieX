const axios = require("axios");
const FormData = require("form-data");
const { SarvamAIClient } = require("sarvamai");

const client = new SarvamAIClient({
  apiSubscriptionKey: process.env.SARVAM_API_KEY,
});


const textToSpeech = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Please provide text to convert to speech",
      });
    }
    if (!process.env.SARVAM_API_KEY) {
      console.warn("SARVAM_API_KEY not configured");

      return res.json({
        success: true,
        fallback: true,
        message: "No Sarvam key configured",
      });
    }

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

      audio: response.audios?.[0] || response.audio || null,
    });
  } catch (error) {
    console.error(
      "Sarvam TTS API Error:",
      error.response?.data || error.message
    );

    return res.json({
      success: true,
      fallback: true,
      error: error.message,
    });
  }
};

const speechToText = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an audio file",
      });
    }

    if (!process.env.SARVAM_API_KEY) {
      console.warn("SARVAM_API_KEY not configured");

      return res.json({
        success: true,
        transcript:
          "Mock transcript because SARVAM_API_KEY is missing.",
      });
    }

    const form = new FormData();

    form.append("file", req.file.buffer, {
      filename: req.file.originalname || "audio.wav",
      contentType: req.file.mimetype || "audio/wav",
    });

    form.append("model", "saaras:v3");
    form.append("language_code", "en-IN");

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