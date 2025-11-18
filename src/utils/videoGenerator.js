import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

/**
 * Template style configurations for video generation
 */
const TEMPLATE_STYLES = {
  classic: {
    name: 'Classic',
    backgroundColor: '#f8fafc',
    titleColor: '#0f172a',
    captionColor: '#475569',
    accentColor: '#fbbf24',
    overlayGradient: 'rgba(0, 0, 0, 0.7)',
    textShadow: true,
  },
  modern: {
    name: 'Modern',
    backgroundColor: '#1e293b',
    titleColor: '#ffffff',
    captionColor: '#cbd5e1',
    accentColor: '#60a5fa',
    overlayGradient: 'rgba(30, 41, 59, 0.8)',
    textShadow: true,
    useGradient: true,
    gradientColors: ['#3b82f6', '#8b5cf6'],
  },
  elegant: {
    name: 'Elegant',
    backgroundColor: '#fffbeb',
    titleColor: '#78350f',
    captionColor: '#92400e',
    accentColor: '#f59e0b',
    overlayGradient: 'rgba(120, 53, 15, 0.6)',
    textShadow: false,
    decorative: true,
    borderColor: '#fcd34d',
  },
  luxury: {
    name: 'Luxury',
    backgroundColor: '#000000',
    titleColor: '#d4af37',
    captionColor: '#e5e7eb',
    accentColor: '#d4af37',
    overlayGradient: 'rgba(0, 0, 0, 0.9)',
    textShadow: true,
    premium: true,
    borderColor: '#d4af37',
  }
};

let ffmpegInstance = null;
let isFFmpegLoaded = false;

/**
 * Initialize FFmpeg instance
 */
async function loadFFmpeg(onProgress) {
  if (isFFmpegLoaded && ffmpegInstance) {
    return ffmpegInstance;
  }

  if (!ffmpegInstance) {
    ffmpegInstance = new FFmpeg();
  }
  
  ffmpegInstance.on('log', ({ message }) => {
    console.log('[FFmpeg]', message);
  });
  
  ffmpegInstance.on('progress', ({ progress }) => {
    if (onProgress && progress > 0) {
      // FFmpeg progress is 0-1, we'll use 60-90% of our total progress for encoding
      const totalProgress = 60 + (progress * 30);
      onProgress(totalProgress);
    }
  });

  // Try multiple CDN configurations
  const loadConfigs = [
    // Config 1: unpkg with core-mt (multi-threaded)
    {
      name: 'unpkg (multi-threaded)',
      baseURL: 'https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm',
      useCore: true
    },
    // Config 2: jsdelivr with core-mt
    {
      name: 'jsdelivr (multi-threaded)',
      baseURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core-mt@0.12.6/dist/esm',
      useCore: true
    },
    // Config 3: unpkg with regular core (fallback)
    {
      name: 'unpkg (single-threaded)',
      baseURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd',
      useCore: false
    },
    // Config 4: jsdelivr with regular core
    {
      name: 'jsdelivr (single-threaded)',
      baseURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd',
      useCore: false
    }
  ];

  // Try each configuration
  for (const config of loadConfigs) {
    try {
      console.log(`Attempting to load FFmpeg from: ${config.name}`);
      console.log(`URL: ${config.baseURL}`);
      
      const coreURL = await toBlobURL(`${config.baseURL}/ffmpeg-core.js`, 'text/javascript');
      const wasmURL = await toBlobURL(`${config.baseURL}/ffmpeg-core.wasm`, 'application/wasm');
      
      const loadConfig = {
        coreURL,
        wasmURL,
      };
      
      // Add worker URL if using multi-threaded version
      if (config.useCore) {
        try {
          loadConfig.workerURL = await toBlobURL(`${config.baseURL}/ffmpeg-core.worker.js`, 'text/javascript');
        } catch (e) {
          console.warn('Worker not available, falling back to single-threaded');
        }
      }
      
      await ffmpegInstance.load(loadConfig);
      isFFmpegLoaded = true;
      console.log(`✅ FFmpeg loaded successfully from: ${config.name}`);
      return ffmpegInstance;
    } catch (error) {
      console.error(`❌ Failed to load from ${config.name}:`, error);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      // Try next configuration
    }
  }
  
  // If all configurations failed
  const errorMsg = 'Failed to load video encoder. This usually means:\n' +
    '1. Your server needs CORS headers (Cross-Origin-Embedder-Policy and Cross-Origin-Opener-Policy)\n' +
    '2. Check browser console for detailed errors\n' +
    '3. Ensure you\'re using a modern browser (Chrome 91+, Firefox 89+, Safari 15+)\n\n' +
    'See SLIDESHOW_VIDEO_TROUBLESHOOTING.md for help.';
  
  console.error('❌ ALL FFmpeg loading attempts failed!');
  console.error('This is most likely due to missing CORS headers on your server.');
  console.error('Add these headers to your Nginx/Apache config:');
  console.error('  Cross-Origin-Embedder-Policy: require-corp');
  console.error('  Cross-Origin-Opener-Policy: same-origin');
  
  throw new Error(errorMsg);
}

/**
 * Load image from URL as Image object
 */
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url.includes('?') ? url : `${url}?t=${Date.now()}`;
  });
}

/**
 * Draw a single frame with image and overlays
 */
function drawFrame(canvas, ctx, img, mediaItem, template, event, frameIndex, totalFrames) {
  const width = canvas.width;
  const height = canvas.height;
  const style = TEMPLATE_STYLES[template] || TEMPLATE_STYLES.classic;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Draw background
  if (style.useGradient && style.gradientColors) {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, style.gradientColors[0]);
    gradient.addColorStop(1, style.gradientColors[1]);
    ctx.fillStyle = gradient;
  } else {
    ctx.fillStyle = style.backgroundColor;
  }
  ctx.fillRect(0, 0, width, height);

  // Draw decorative elements for elegant/luxury templates
  if (style.decorative || style.premium) {
    ctx.strokeStyle = style.borderColor || style.accentColor;
    ctx.lineWidth = 3;
    const margin = 40;
    const cornerSize = 60;
    
    // Draw corner decorations
    // Top-left
    ctx.beginPath();
    ctx.moveTo(margin, margin + cornerSize);
    ctx.lineTo(margin, margin);
    ctx.lineTo(margin + cornerSize, margin);
    ctx.stroke();
    
    // Top-right
    ctx.beginPath();
    ctx.moveTo(width - margin - cornerSize, margin);
    ctx.lineTo(width - margin, margin);
    ctx.lineTo(width - margin, margin + cornerSize);
    ctx.stroke();
    
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(margin, height - margin - cornerSize);
    ctx.lineTo(margin, height - margin);
    ctx.lineTo(margin + cornerSize, height - margin);
    ctx.stroke();
    
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(width - margin - cornerSize, height - margin);
    ctx.lineTo(width - margin, height - margin);
    ctx.lineTo(width - margin, height - margin - cornerSize);
    ctx.stroke();
  }

  // Calculate image dimensions to fit
  const padding = 80;
  const overlayHeight = 180;
  const availableWidth = width - (padding * 2);
  const availableHeight = height - (padding * 2) - overlayHeight;

  const imgRatio = img.width / img.height;
  let drawWidth, drawHeight;

  if (imgRatio > (availableWidth / availableHeight)) {
    drawWidth = availableWidth;
    drawHeight = availableWidth / imgRatio;
  } else {
    drawHeight = availableHeight;
    drawWidth = availableHeight * imgRatio;
  }

  const imgX = (width - drawWidth) / 2;
  const imgY = padding + (availableHeight - drawHeight) / 2;

  // Draw image border if template uses it
  if (style.borderColor) {
    ctx.strokeStyle = style.borderColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(imgX - 4, imgY - 4, drawWidth + 8, drawHeight + 8);
  }

  // Draw the image
  ctx.drawImage(img, imgX, imgY, drawWidth, drawHeight);

  // Draw overlay at bottom
  const overlayY = height - overlayHeight - 40;
  
  // Gradient overlay
  const gradient = ctx.createLinearGradient(0, overlayY, 0, overlayY + overlayHeight);
  gradient.addColorStop(0, 'transparent');
  gradient.addColorStop(0.3, style.overlayGradient);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, overlayY, width, overlayHeight);

  // Text shadow setup
  if (style.textShadow) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
  }

  // Draw caption if available
  if (mediaItem.caption) {
    ctx.font = 'bold 36px Arial, sans-serif';
    ctx.fillStyle = style.titleColor === '#ffffff' || style.titleColor === '#0f172a' 
      ? '#ffffff' 
      : style.titleColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    // Word wrap caption
    const words = mediaItem.caption.split(' ');
    let line = '';
    let lineY = overlayY + 30;
    const maxWidth = width - 160;
    const lineHeight = 44;
    let lineCount = 0;
    const maxLines = 2;

    for (let i = 0; i < words.length && lineCount < maxLines; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line, width / 2, lineY);
        line = words[i] + ' ';
        lineY += lineHeight;
        lineCount++;
      } else {
        line = testLine;
      }
    }
    
    if (lineCount < maxLines) {
      ctx.fillText(line, width / 2, lineY);
      lineY += lineHeight;
    }
  }

  // Draw metadata
  ctx.font = '24px Arial, sans-serif';
  ctx.fillStyle = style.captionColor === '#475569' || style.captionColor === '#92400e'
    ? '#cbd5e1'
    : style.captionColor;
  
  const metadata = `${mediaItem.uploaded_by || 'Guest'} • ${new Date(mediaItem.created_at).toLocaleDateString()}`;
  ctx.fillText(metadata, width / 2, height - 100);

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Draw progress indicator
  const dotCount = Math.min(totalFrames, 20);
  const dotRadius = 6;
  const dotSpacing = 20;
  const dotsWidth = (dotCount - 1) * dotSpacing;
  let dotX = (width - dotsWidth) / 2;
  const dotY = height - 40;

  for (let i = 0; i < dotCount; i++) {
    ctx.beginPath();
    ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
    ctx.fillStyle = i === (frameIndex % dotCount) ? style.accentColor : style.captionColor + '40';
    ctx.fill();
    dotX += dotSpacing;
  }

  // Draw page counter
  ctx.font = '20px Arial, sans-serif';
  ctx.fillStyle = style.captionColor;
  ctx.textAlign = 'right';
  ctx.fillText(`${frameIndex + 1} / ${totalFrames}`, width - 60, height - 60);

  // Draw event title in top corner
  ctx.textAlign = 'left';
  ctx.font = 'bold 28px Arial, sans-serif';
  ctx.fillStyle = style.accentColor;
  ctx.fillText(event.title || 'Event Slideshow', 60, 60);
}

/**
 * Draw title frame
 */
function drawTitleFrame(canvas, ctx, event, template) {
  const width = canvas.width;
  const height = canvas.height;
  const style = TEMPLATE_STYLES[template] || TEMPLATE_STYLES.classic;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Draw background
  if (style.useGradient && style.gradientColors) {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, style.gradientColors[0]);
    gradient.addColorStop(1, style.gradientColors[1]);
    ctx.fillStyle = gradient;
  } else {
    ctx.fillStyle = style.backgroundColor;
  }
  ctx.fillRect(0, 0, width, height);

  // Draw decorations
  if (style.decorative || style.premium) {
    ctx.strokeStyle = style.borderColor || style.accentColor;
    ctx.lineWidth = 4;
    const margin = 40;
    const cornerSize = 80;
    
    // Draw decorative corners (same as in drawFrame)
    ctx.beginPath();
    ctx.moveTo(margin, margin + cornerSize);
    ctx.lineTo(margin, margin);
    ctx.lineTo(margin + cornerSize, margin);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(width - margin - cornerSize, margin);
    ctx.lineTo(width - margin, margin);
    ctx.lineTo(width - margin, margin + cornerSize);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(margin, height - margin - cornerSize);
    ctx.lineTo(margin, height - margin);
    ctx.lineTo(margin + cornerSize, height - margin);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(width - margin - cornerSize, height - margin);
    ctx.lineTo(width - margin, height - margin);
    ctx.lineTo(width - margin, height - margin - cornerSize);
    ctx.stroke();
  }

  // Draw title
  ctx.font = 'bold 72px Arial, sans-serif';
  ctx.fillStyle = style.titleColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  if (style.textShadow) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
  }
  
  const title = event.title || 'Event Slideshow';
  ctx.fillText(title, width / 2, height / 2 - 40);

  // Draw subtitle
  ctx.font = '36px Arial, sans-serif';
  ctx.fillStyle = style.captionColor;
  ctx.fillText('Memory Slideshow', width / 2, height / 2 + 40);

  // Draw date
  ctx.font = '28px Arial, sans-serif';
  const dateText = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  ctx.fillText(dateText, width / 2, height / 2 + 100);

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Draw accent line
  ctx.strokeStyle = style.accentColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 200, height / 2 + 140);
  ctx.lineTo(width / 2 + 200, height / 2 + 140);
  ctx.stroke();
}

/**
 * Check browser compatibility
 */
function checkBrowserCompatibility() {
  // Check for WebAssembly support
  if (typeof WebAssembly === 'undefined') {
    throw new Error('Your browser does not support WebAssembly. Please use a modern browser (Chrome 91+, Firefox 89+, Safari 15+).');
  }

  // Check for SharedArrayBuffer (required for FFmpeg.wasm multi-threading)
  if (typeof SharedArrayBuffer === 'undefined') {
    console.warn('SharedArrayBuffer not available. Video generation may be slower.');
    // Don't throw error, it can still work without it
  }

  return true;
}

/**
 * Generate slideshow video
 */
export async function generateSlideshowVideo({
  event,
  media,
  template = 'classic',
  slideDuration = 5, // seconds per slide
  onProgress = () => {}
}) {
  if (!media || media.length === 0) {
    throw new Error('No media available to create slideshow');
  }

  // Check browser compatibility first
  try {
    checkBrowserCompatibility();
  } catch (error) {
    throw error;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1920; // Full HD
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');

  const fps = 30;
  const framesPerSlide = slideDuration * fps;
  const totalSlides = media.length;

  try {
    onProgress(5);
    
    // Load FFmpeg
    const ffmpeg = await loadFFmpeg(onProgress);
    
    onProgress(10);

    // Filter out videos, only process images
    const imageMedia = media.filter(m => m.file_type === 'image');
    
    if (imageMedia.length === 0) {
      throw new Error('No images available. Slideshow videos can only be created from images.');
    }

    const framesToGenerate = [];
    
    // Generate title frame
    onProgress(15);
    drawTitleFrame(canvas, ctx, event, template);
    const titleBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
    framesToGenerate.push({ blob: titleBlob, count: fps * 3 }); // 3 seconds for title

    // Load all images
    onProgress(20);
    const loadedImages = [];
    for (let i = 0; i < imageMedia.length; i++) {
      const progress = 20 + ((i / imageMedia.length) * 20);
      onProgress(progress);
      
      try {
        const img = await loadImage(imageMedia[i].filtered_url || imageMedia[i].file_url);
        loadedImages.push({ img, mediaItem: imageMedia[i] });
      } catch (error) {
        console.error('Error loading image:', error);
        // Skip failed images
      }
    }

    if (loadedImages.length === 0) {
      throw new Error('Failed to load any images');
    }

    // Generate frames for each image
    onProgress(40);
    for (let i = 0; i < loadedImages.length; i++) {
      const progress = 40 + ((i / loadedImages.length) * 20);
      onProgress(progress);
      
      const { img, mediaItem } = loadedImages[i];
      drawFrame(canvas, ctx, img, mediaItem, template, event, i, loadedImages.length);
      
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
      framesToGenerate.push({ blob, count: framesPerSlide });
    }

    // Write frames to FFmpeg
    onProgress(60);
    let frameIndex = 0;
    for (const frameData of framesToGenerate) {
      const imageData = new Uint8Array(await frameData.blob.arrayBuffer());
      
      // Write each frame multiple times for duration
      for (let i = 0; i < frameData.count; i++) {
        const paddedIndex = String(frameIndex).padStart(6, '0');
        await ffmpeg.writeFile(`frame${paddedIndex}.jpg`, imageData);
        frameIndex++;
      }
    }

    // Generate video using FFmpeg
    onProgress(65);
    await ffmpeg.exec([
      '-framerate', String(fps),
      '-i', 'frame%06d.jpg',
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-crf', '23',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      'output.mp4'
    ]);

    onProgress(95);

    // Read the output video
    const data = await ffmpeg.readFile('output.mp4');
    const videoBlob = new Blob([data.buffer], { type: 'video/mp4' });

    // Clean up FFmpeg file system
    const files = await ffmpeg.listDir('/');
    for (const file of files) {
      if (file.name.startsWith('frame') || file.name === 'output.mp4') {
        try {
          await ffmpeg.deleteFile(file.name);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    }

    onProgress(100);

    return videoBlob;
  } catch (error) {
    console.error('Error generating video:', error);
    throw error;
  }
}

/**
 * Download video blob
 */
export function downloadVideo(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

