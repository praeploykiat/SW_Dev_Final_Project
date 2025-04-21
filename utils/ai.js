const axios = require('axios'); //need to npm install axios

/**
 * @param {string} apiKey - Gemini API key
 * @param {string} prompt - The text prompt to send to the model
 * @param {string} model - The model to use (default: 'gemini-2.0-flash')
 * @returns {Promise<object>} - The API response
 */
async function generateContent(apiKey, prompt, model = 'gemini-2.0-flash') {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        contents: [{
          parts: [{ text: prompt }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    throw new Error(`Request failed: ${error.message}`);
  }
}

/**
 * Extract text content from Gemini API response
 * @param {object} response - The API response
 * @returns {string} - The extracted text
 */
function extractTextFromResponse(response) {
  try {
    return response.candidates[0].content.parts[0].text;
  } catch (error) {
    throw new Error(`Failed to extract text from response: ${error.message}`);
  }
}

module.exports = {
  generateContent,
  extractTextFromResponse
};