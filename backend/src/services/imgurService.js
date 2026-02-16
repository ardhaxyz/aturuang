const axios = require('axios');
const FormData = require('form-data');

/**
 * Upload image to Imgur (Anonymous)
 * Rate limit: 50 uploads/hour per IP
 * Sufficient for small applications (10-20 images)
 */
async function uploadToImgur(imageBuffer, filename) {
  try {
    const form = new FormData();
    form.append('image', imageBuffer.toString('base64'));
    form.append('type', 'base64');
    form.append('name', filename);
    
    const response = await axios.post('https://api.imgur.com/3/image', form, {
      headers: form.getHeaders(),
      timeout: 30000
    });
    
    if (response.data.success) {
      return {
        success: true,
        url: response.data.data.link,
        deleteHash: response.data.data.deletehash
      };
    } else {
      throw new Error('Imgur upload failed');
    }
  } catch (error) {
    console.error('Imgur upload error:', error.message);
    if (error.response) {
      console.error('Imgur response:', error.response.data);
    }
    throw new Error('Failed to upload image to Imgur');
  }
}

module.exports = { uploadToImgur };