const { generateContent, extractTextFromResponse } = require('../utils/ai');
require('dotenv').config();

/**
 * @desc    Get AI response for a prompt
 * @route   POST /api/ai/generate
 * @access  Private
 */
exports.generateAIResponse = async (req, res) => {
  try {
    const { prompt } = req.body;
    
    // Validate input
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid prompt string'
      });
    }

    // Get API key from environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'Server configuration error: API key not found'
      });
    }

    // Call Gemini API
    const response = await generateContent(apiKey, prompt);
    const textOutput = extractTextFromResponse(response);

    // Return the response
    return res.status(200).json({
      success: true,
      data: {
        text: textOutput,
        rawResponse: response // Optional, include to expose the full response
      }
    });
  } catch (error) {
    console.error('AI generation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error generating AI response',
      message: error.message
    });
  }
};