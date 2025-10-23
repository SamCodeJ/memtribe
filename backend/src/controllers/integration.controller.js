import { asyncHandler } from '../middleware/errorHandler.js';
import { uploadToS3 } from '../services/s3.service.js';
import { generateAIImage } from '../services/openai.service.js';
import { sendEmailService } from '../services/email.service.js';

/**
 * Upload file to S3
 */
export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' });
  }

  // Upload to S3
  const fileUrl = await uploadToS3(req.file);

  res.json({
    file_url: fileUrl,
    filename: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size
  });
});

/**
 * Generate AI image using OpenAI DALL-E
 */
export const generateImage = asyncHandler(async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Generate image
  const imageUrl = await generateAIImage(prompt);

  res.json({
    url: imageUrl,
    prompt
  });
});

/**
 * Send email
 */
export const sendEmail = asyncHandler(async (req, res) => {
  const { to, subject, html, text } = req.body;

  if (!to || !subject) {
    return res.status(400).json({ error: 'To and subject are required' });
  }

  // Send email
  const result = await sendEmailService({ to, subject, html, text });

  res.json({
    message: 'Email sent successfully',
    id: result.id
  });
});

