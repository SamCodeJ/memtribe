import { jsPDF } from 'jspdf';

/**
 * Load an image as a data URL
 */
const loadImageAsDataUrl = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(dataUrl);
      } catch (error) {
        console.error('Error converting image to data URL:', error);
        reject(error);
      }
    };
    
    img.onerror = (error) => {
      console.error('Error loading image:', url, error);
      reject(error);
    };
    
    // Add cache buster for external images
    img.src = url.includes('?') ? url : `${url}?t=${Date.now()}`;
  });
};

/**
 * Template style configurations
 */
const TEMPLATE_STYLES = {
  classic: {
    name: 'Classic',
    background: [248, 250, 252], // slate-50
    titleColor: [15, 23, 42], // slate-900
    captionColor: [71, 85, 105], // slate-600
    accentColor: [251, 191, 36], // amber-400
    overlayOpacity: 0.7,
    useBorder: true,
    borderColor: [226, 232, 240], // slate-200
  },
  modern: {
    name: 'Modern',
    background: [30, 41, 59], // slate-800
    titleColor: [255, 255, 255],
    captionColor: [203, 213, 225], // slate-300
    accentColor: [96, 165, 250], // blue-400
    overlayOpacity: 0.8,
    useBorder: false,
    useGradient: true,
  },
  elegant: {
    name: 'Elegant',
    background: [255, 251, 235], // amber-50
    titleColor: [120, 53, 15], // amber-900
    captionColor: [146, 64, 14], // amber-800
    accentColor: [245, 158, 11], // amber-500
    overlayOpacity: 0.6,
    useBorder: true,
    borderColor: [252, 211, 77], // amber-300
    decorative: true,
  },
  luxury: {
    name: 'Luxury',
    background: [0, 0, 0],
    titleColor: [212, 175, 55], // gold
    captionColor: [229, 231, 235], // gray-200
    accentColor: [212, 175, 55], // gold
    overlayOpacity: 0.9,
    useBorder: true,
    borderColor: [212, 175, 55], // gold
    premium: true,
  }
};

/**
 * Generate a slideshow PDF
 * @param {Object} options - Slideshow generation options
 */
export const generateSlideshowPDF = async ({
  event,
  media,
  template = 'classic',
  onProgress = () => {}
}) => {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });
  
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (2 * margin);
  const contentHeight = pageHeight - (2 * margin);
  
  const style = TEMPLATE_STYLES[template] || TEMPLATE_STYLES.classic;
  
  // Helper to set font with fallback
  const setFont = (font, fontStyle) => {
    try {
      pdf.setFont(font, fontStyle);
    } catch (e) {
      pdf.setFont('helvetica', fontStyle);
    }
  };
  
  // Helper to draw background
  const drawBackground = () => {
    pdf.setFillColor(...style.background);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
  };
  
  // Helper to draw decorative elements
  const drawDecorations = () => {
    if (style.decorative) {
      // Corner decorations for elegant template
      pdf.setDrawColor(...style.accentColor);
      pdf.setLineWidth(0.5);
      // Top left corner
      pdf.line(margin, margin, margin + 10, margin);
      pdf.line(margin, margin, margin, margin + 10);
      // Top right corner
      pdf.line(pageWidth - margin - 10, margin, pageWidth - margin, margin);
      pdf.line(pageWidth - margin, margin, pageWidth - margin, margin + 10);
      // Bottom left corner
      pdf.line(margin, pageHeight - margin, margin + 10, pageHeight - margin);
      pdf.line(margin, pageHeight - margin - 10, margin, pageHeight - margin);
      // Bottom right corner
      pdf.line(pageWidth - margin - 10, pageHeight - margin, pageWidth - margin, pageHeight - margin);
      pdf.line(pageWidth - margin, pageHeight - margin - 10, pageWidth - margin, pageHeight - margin);
    }
    
    if (style.premium) {
      // Gold line separator for luxury template
      pdf.setDrawColor(...style.accentColor);
      pdf.setLineWidth(0.3);
      pdf.line(margin, margin + 5, pageWidth - margin, margin + 5);
    }
  };
  
  // === COVER PAGE ===
  onProgress(5);
  drawBackground();
  
  // Event title
  setFont('helvetica', 'bold');
  pdf.setFontSize(32);
  pdf.setTextColor(...style.titleColor);
  
  const titleLines = pdf.splitTextToSize(event.title || 'Event Slideshow', contentWidth - 40);
  let yPosition = pageHeight / 2 - 20;
  titleLines.forEach(line => {
    const textWidth = pdf.getTextWidth(line);
    pdf.text(line, (pageWidth - textWidth) / 2, yPosition);
    yPosition += 12;
  });
  
  // Subtitle
  setFont('helvetica', 'normal');
  pdf.setFontSize(14);
  pdf.setTextColor(...style.captionColor);
  const subtitle = 'Memory Slideshow';
  const subtitleWidth = pdf.getTextWidth(subtitle);
  pdf.text(subtitle, (pageWidth - subtitleWidth) / 2, yPosition + 5);
  
  // Date
  pdf.setFontSize(12);
  const dateText = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const dateWidth = pdf.getTextWidth(dateText);
  pdf.text(dateText, (pageWidth - dateWidth) / 2, yPosition + 15);
  
  // Decorations
  drawDecorations();
  
  // Accent line
  pdf.setDrawColor(...style.accentColor);
  pdf.setLineWidth(1);
  pdf.line(pageWidth / 2 - 30, yPosition + 25, pageWidth / 2 + 30, yPosition + 25);
  
  // === MEDIA PAGES ===
  const totalMedia = media.length;
  
  for (let i = 0; i < totalMedia; i++) {
    const mediaItem = media[i];
    const progress = 5 + ((i + 1) / totalMedia) * 85;
    onProgress(progress);
    
    // Add new page for each media item
    pdf.addPage();
    drawBackground();
    drawDecorations();
    
    // Try to load and add the image
    try {
      let imageUrl = mediaItem.filtered_url || mediaItem.file_url;
      
      // Only process images (skip videos for PDF)
      if (mediaItem.file_type === 'image' && imageUrl) {
        const imageData = await loadImageAsDataUrl(imageUrl);
        
        // Calculate image dimensions to fit within content area
        const imgProps = pdf.getImageProperties(imageData);
        const imgRatio = imgProps.width / imgProps.height;
        
        // Reserve space for caption at bottom
        const captionSpace = 25;
        const availableHeight = contentHeight - captionSpace;
        const availableWidth = contentWidth;
        
        let imgWidth, imgHeight;
        
        if (imgRatio > (availableWidth / availableHeight)) {
          // Image is wider
          imgWidth = availableWidth;
          imgHeight = availableWidth / imgRatio;
        } else {
          // Image is taller
          imgHeight = availableHeight;
          imgWidth = availableHeight * imgRatio;
        }
        
        // Center the image
        const imgX = (pageWidth - imgWidth) / 2;
        const imgY = margin + (availableHeight - imgHeight) / 2;
        
        // Add border if template uses it
        if (style.useBorder) {
          pdf.setDrawColor(...style.borderColor);
          pdf.setLineWidth(0.5);
          pdf.rect(imgX - 1, imgY - 1, imgWidth + 2, imgHeight + 2, 'S');
        }
        
        // Add the image
        pdf.addImage(imageData, 'JPEG', imgX, imgY, imgWidth, imgHeight);
      } else if (mediaItem.file_type === 'video') {
        // For videos, show a placeholder
        const videoBoxHeight = contentHeight - 30;
        const videoBoxY = margin + 5;
        
        pdf.setFillColor(100, 100, 100);
        pdf.rect(margin + 10, videoBoxY, contentWidth - 20, videoBoxHeight, 'F');
        
        // Video icon placeholder
        setFont('helvetica', 'bold');
        pdf.setFontSize(20);
        pdf.setTextColor(255, 255, 255);
        const videoText = '▶ Video';
        const videoTextWidth = pdf.getTextWidth(videoText);
        pdf.text(videoText, (pageWidth - videoTextWidth) / 2, pageHeight / 2);
        
        setFont('helvetica', 'normal');
        pdf.setFontSize(12);
        const noteText = 'Video content available in online version';
        const noteTextWidth = pdf.getTextWidth(noteText);
        pdf.text(noteText, (pageWidth - noteTextWidth) / 2, pageHeight / 2 + 10);
      }
    } catch (error) {
      console.error('Error adding media to PDF:', error);
      
      // Show error placeholder
      pdf.setFillColor(220, 220, 220);
      pdf.rect(margin + 10, margin + 10, contentWidth - 20, contentHeight - 40, 'F');
      
      setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      const errorText = 'Image could not be loaded';
      const errorTextWidth = pdf.getTextWidth(errorText);
      pdf.text(errorText, (pageWidth - errorTextWidth) / 2, pageHeight / 2);
    }
    
    // Caption area at bottom
    const captionY = pageHeight - margin - 15;
    
    // Caption text
    if (mediaItem.caption) {
      setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      pdf.setTextColor(...style.titleColor);
      const captionLines = pdf.splitTextToSize(mediaItem.caption, contentWidth - 20);
      let captionLineY = captionY;
      captionLines.slice(0, 2).forEach(line => { // Max 2 lines
        const lineWidth = pdf.getTextWidth(line);
        pdf.text(line, (pageWidth - lineWidth) / 2, captionLineY);
        captionLineY += 5;
      });
    }
    
    // Metadata
    setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(...style.captionColor);
    const metadata = `${mediaItem.uploaded_by || 'Guest'} • ${new Date(mediaItem.created_at).toLocaleDateString()}`;
    const metadataWidth = pdf.getTextWidth(metadata);
    pdf.text(metadata, (pageWidth - metadataWidth) / 2, pageHeight - margin - 5);
    
    // Page number
    pdf.setFontSize(8);
    const pageNum = `${i + 1} / ${totalMedia}`;
    const pageNumWidth = pdf.getTextWidth(pageNum);
    pdf.text(pageNum, pageWidth - margin - pageNumWidth, pageHeight - margin - 5);
    
    // Progress indicator dots
    const dotSpacing = 3;
    const totalDots = Math.min(totalMedia, 20); // Max 20 dots to avoid overflow
    const dotsWidth = totalDots * dotSpacing;
    let dotX = (pageWidth - dotsWidth) / 2;
    const dotY = pageHeight - margin - 2;
    
    for (let d = 0; d < totalDots; d++) {
      if (d === i % totalDots) {
        pdf.setFillColor(...style.accentColor);
      } else {
        pdf.setFillColor(...style.captionColor);
      }
      pdf.circle(dotX, dotY, 0.5, 'F');
      dotX += dotSpacing;
    }
  }
  
  // === END PAGE ===
  pdf.addPage();
  drawBackground();
  drawDecorations();
  
  onProgress(95);
  
  setFont('helvetica', 'bold');
  pdf.setFontSize(24);
  pdf.setTextColor(...style.titleColor);
  const thanksText = 'Thank You';
  const thanksWidth = pdf.getTextWidth(thanksText);
  pdf.text(thanksText, (pageWidth - thanksWidth) / 2, pageHeight / 2 - 10);
  
  setFont('helvetica', 'normal');
  pdf.setFontSize(12);
  pdf.setTextColor(...style.captionColor);
  const memoryText = `${totalMedia} precious ${totalMedia === 1 ? 'memory' : 'memories'} captured`;
  const memoryWidth = pdf.getTextWidth(memoryText);
  pdf.text(memoryText, (pageWidth - memoryWidth) / 2, pageHeight / 2 + 5);
  
  // Accent line
  pdf.setDrawColor(...style.accentColor);
  pdf.setLineWidth(1);
  pdf.line(pageWidth / 2 - 30, pageHeight / 2 + 15, pageWidth / 2 + 30, pageHeight / 2 + 15);
  
  onProgress(100);
  
  return pdf;
};

/**
 * Download a PDF with a given filename
 */
export const downloadPDF = (pdf, filename) => {
  pdf.save(filename);
};

