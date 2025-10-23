import { apiClient } from './client.js';

/**
 * Upload file to server (S3)
 */
export const UploadFile = async ({ file }) => {
  const result = await apiClient.uploadFile('/integrations/upload-file', file);
  return result;
};

/**
 * Generate AI image using OpenAI
 */
export const GenerateImage = async ({ prompt }) => {
  const result = await apiClient.post('/integrations/generate-image', { prompt });
  return result;
};

/**
 * Send email
 */
export const SendEmail = async ({ to, subject, html, text }) => {
  const result = await apiClient.post('/integrations/send-email', {
    to,
    subject,
    html,
    text
  });
  return result;
};

/**
 * Other integration exports for compatibility
 */
export const Core = {
  UploadFile,
  GenerateImage,
  SendEmail
};

export const InvokeLLM = async ({ prompt }) => {
  // Can be implemented later if needed
  console.warn('InvokeLLM not yet implemented');
  return null;
};

export const ExtractDataFromUploadedFile = async ({ fileUrl }) => {
  // Can be implemented later if needed
  console.warn('ExtractDataFromUploadedFile not yet implemented');
  return null;
};

export const CreateFileSignedUrl = async ({ key, expiresIn }) => {
  // Can be implemented later if needed
  console.warn('CreateFileSignedUrl not yet implemented');
  return null;
};

export const UploadPrivateFile = async ({ file }) => {
  // Similar to UploadFile but for private files
  return UploadFile({ file });
};

