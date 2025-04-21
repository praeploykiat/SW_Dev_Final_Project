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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'Server configuration error: API key not found'
      });
    }

    const response = await generateContent(apiKey, prompt);
    let textOutput = extractTextFromResponse(response);
    
    //format text 
    textOutput = formatTextResponse(textOutput);

    return res.status(200).send(textOutput);
  } catch (error) {
    console.error('AI generation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Error generating AI response',
      message: error.message
    });
  }
};

/**
 * Format AI response text
 * @param {string} text - Raw text from AI response
 * @returns {string} - Formatted text
 */
function formatTextResponse(text) {
  if (!text) return "No response generated.";
  
  // Replace multiple newlines with just two
  text = text.replace(/\n{3,}/g, '\n\n');
  
  // Add proper spacing after punctuation if missing
  text = text.replace(/([.!?])\s*([A-Z])/g, '$1 $2');
  
  // Add horizontal line for separation
  const separator = '\n' + '-'.repeat(60) + '\n';
  
  return separator + text + separator;
}