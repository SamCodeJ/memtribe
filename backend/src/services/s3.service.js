import AWS from 'aws-sdk';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if AWS is configured (all credentials must be present and not just "your-aws...")
const isAwsConfigured = process.env.AWS_ACCESS_KEY_ID && 
                        process.env.AWS_SECRET_ACCESS_KEY && 
                        process.env.AWS_S3_BUCKET &&
                        !process.env.AWS_ACCESS_KEY_ID.includes('your-') &&
                        !process.env.AWS_SECRET_ACCESS_KEY.includes('your-');

// Configure AWS if credentials exist
let s3;
if (isAwsConfigured) {
  try {
    s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1'
    });
    console.log('✅ AWS S3 configured');
  } catch (error) {
    console.error('❌ AWS S3 configuration error:', error.message);
  }
} else {
  console.log('ℹ️  AWS S3 not configured, will use local storage');
}

/**
 * Upload file to S3 or local storage (fallback)
 */
export const uploadToS3 = async (file) => {
  try {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${randomUUID()}.${fileExtension}`;
    
    // If AWS is not configured, save locally
    if (!isAwsConfigured) {
      console.log('📁 Saving file locally:', fileName);
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log('✅ Created uploads directory:', uploadsDir);
      }
      
      const filePath = path.join(uploadsDir, fileName);
      fs.writeFileSync(filePath, file.buffer);
      console.log('✅ File saved to:', filePath);
      
      // Return local URL
      const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
      const fileUrl = `${baseUrl}/uploads/${fileName}`;
      console.log('🔗 File URL:', fileUrl);
      return fileUrl;
    }

    // Use S3 if configured
    console.log('☁️  Uploading to S3:', fileName);
    const key = `uploads/${fileName}`;
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    };

    const result = await s3.upload(params).promise();
    console.log('✅ Uploaded to S3:', result.Location);
    return result.Location;
  } catch (error) {
    console.error('❌ Upload error:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
};

/**
 * Delete file from S3
 */
export const deleteFromS3 = async (fileUrl) => {
  try {
    // Extract key from URL
    const url = new URL(fileUrl);
    const key = url.pathname.substring(1); // Remove leading slash

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key
    };

    await s3.deleteObject(params).promise();
    return true;
  } catch (error) {
    console.error('S3 delete error:', error);
    throw new Error('Failed to delete file from S3');
  }
};

/**
 * Generate a signed URL for temporary access to private files
 */
export const generateSignedUrl = async (key, expiresIn = 3600) => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Expires: expiresIn
    };

    const url = await s3.getSignedUrlPromise('getObject', params);
    return url;
  } catch (error) {
    console.error('S3 signed URL error:', error);
    throw new Error('Failed to generate signed URL');
  }
};

