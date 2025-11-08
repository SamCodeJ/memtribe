import jsPDF from 'jspdf';

/**
 * Load image as base64 data URL with CORS handling
 */
const loadImageAsDataUrl = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Handle CORS
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      try {
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
    
    // Add timestamp to bypass cache if needed
    img.src = url.includes('?') ? url : `${url}?t=${Date.now()}`;
  });
};

/**
 * Generate a photobook PDF
 * @param {Object} options - Photobook generation options
 * @param {string} options.title - Photobook title
 * @param {string} options.description - Photobook description
 * @param {Array} options.photos - Array of photo objects
 * @param {Object} options.event - Event object
 * @param {Object} options.template - Template configuration
 * @param {Function} options.onProgress - Progress callback (receives percentage 0-100)
 */
export const generatePhotobookPDF = async ({
  title,
  description,
  photos,
  event,
  template,
  onProgress = () => {}
}) => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (2 * margin);
  
  let currentPage = 1;
  
  // Helper to set font with fallback
  const setFont = (font, style) => {
    try {
      pdf.setFont(font, style);
    } catch (e) {
      pdf.setFont('helvetica', style);
    }
  };
  
  // === COVER PAGE ===
  onProgress(5);
  
  // Background for cover
  if (template.id === 'professional') {
    pdf.setFillColor(31, 41, 55); // Dark gray
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');
  }
  
  // Event banner image (if available)
  let coverImageHeight = 0;
  if (event.event_image) {
    try {
      const eventImageData = await loadImageAsDataUrl(event.event_image);
      const imgHeight = 80;
      const imgY = 30;
      pdf.addImage(eventImageData, 'JPEG', margin, imgY, contentWidth, imgHeight);
      coverImageHeight = imgHeight + 10;
    } catch (error) {
      console.warn('Failed to load event banner image:', error);
    }
  }
  
  // Title
  setFont('helvetica', 'bold');
  pdf.setFontSize(32);
  pdf.setTextColor(template.id === 'professional' ? 255 : 0);
  const titleY = 30 + coverImageHeight + 20;
  const titleLines = pdf.splitTextToSize(title, contentWidth);
  pdf.text(titleLines, pageWidth / 2, titleY, { align: 'center' });
  
  // Description
  setFont('helvetica', 'normal');
  pdf.setFontSize(14);
  pdf.setTextColor(template.id === 'professional' ? 200 : 80);
  const descY = titleY + (titleLines.length * 12) + 10;
  const descLines = pdf.splitTextToSize(description, contentWidth - 20);
  pdf.text(descLines, pageWidth / 2, descY, { align: 'center' });
  
  // Footer
  pdf.setFontSize(10);
  const footerY = pageHeight - 30;
  pdf.text(`Created with MemTribe • ${new Date().toLocaleDateString()}`, pageWidth / 2, footerY, { align: 'center' });
  
  onProgress(10);
  
  // === PHOTO PAGES ===
  const photosPerPage = template.layoutStyle === 'grid' ? 4 : 2;
  let photosProcessed = 0;
  
  for (let i = 0; i < photos.length; i += photosPerPage) {
    // Add new page for photos
    pdf.addPage();
    currentPage++;
    
    const pagePhotos = photos.slice(i, i + photosPerPage);
    
    // Calculate layout based on template
    if (template.layoutStyle === 'grid' && photosPerPage === 4) {
      // 2x2 grid layout
      const photoWidth = (contentWidth - 10) / 2;
      const photoHeight = 70;
      const gap = 10;
      
      for (let j = 0; j < pagePhotos.length; j++) {
        const photo = pagePhotos[j];
        const col = j % 2;
        const row = Math.floor(j / 2);
        const x = margin + (col * (photoWidth + gap));
        const y = margin + (row * (photoHeight + 30));
        
        try {
          const imageData = await loadImageAsDataUrl(photo.filtered_url || photo.file_url);
          pdf.addImage(imageData, 'JPEG', x, y, photoWidth, photoHeight);
          
          // Caption
          if (photo.caption) {
            pdf.setFontSize(9);
            pdf.setTextColor(100);
            setFont('helvetica', 'italic');
            const captionLines = pdf.splitTextToSize(photo.caption, photoWidth);
            pdf.text(captionLines, x, y + photoHeight + 5);
          }
          
          // Meta info
          pdf.setFontSize(7);
          pdf.setTextColor(150);
          setFont('helvetica', 'normal');
          const metaY = y + photoHeight + (photo.caption ? 12 : 5);
          pdf.text(`By ${photo.uploaded_by || 'Guest'} • ${new Date(photo.created_at).toLocaleDateString()}`, x, metaY);
          
        } catch (error) {
          console.warn(`Failed to load photo ${photo.id}:`, error);
          // Draw placeholder rectangle
          pdf.setDrawColor(200);
          pdf.setFillColor(240);
          pdf.rect(x, y, photoWidth, photoHeight, 'FD');
          pdf.setTextColor(150);
          pdf.text('Image not available', x + photoWidth/2, y + photoHeight/2, { align: 'center' });
        }
        
        photosProcessed++;
        const progress = 10 + Math.round((photosProcessed / photos.length) * 80);
        onProgress(progress);
      }
    } else {
      // Single or double column layout (vertical)
      const photoWidth = contentWidth;
      const photoHeight = 100;
      
      for (let j = 0; j < pagePhotos.length; j++) {
        const photo = pagePhotos[j];
        const y = margin + (j * (photoHeight + 35));
        
        try {
          const imageData = await loadImageAsDataUrl(photo.filtered_url || photo.file_url);
          pdf.addImage(imageData, 'JPEG', margin, y, photoWidth, photoHeight);
          
          // Caption
          if (photo.caption) {
            pdf.setFontSize(10);
            pdf.setTextColor(80);
            setFont('helvetica', 'italic');
            const captionLines = pdf.splitTextToSize(photo.caption, photoWidth);
            pdf.text(captionLines, margin, y + photoHeight + 6);
          }
          
          // Meta info
          pdf.setFontSize(8);
          pdf.setTextColor(130);
          setFont('helvetica', 'normal');
          const metaY = y + photoHeight + (photo.caption ? 13 : 6);
          pdf.text(`By ${photo.uploaded_by || 'Guest'} • ${new Date(photo.created_at).toLocaleDateString()}`, margin, metaY);
          
        } catch (error) {
          console.warn(`Failed to load photo ${photo.id}:`, error);
          // Draw placeholder rectangle
          pdf.setDrawColor(200);
          pdf.setFillColor(240);
          pdf.rect(margin, y, photoWidth, photoHeight, 'FD');
          pdf.setTextColor(150);
          pdf.text('Image not available', pageWidth / 2, y + photoHeight/2, { align: 'center' });
        }
        
        photosProcessed++;
        const progress = 10 + Math.round((photosProcessed / photos.length) * 80);
        onProgress(progress);
      }
    }
  }
  
  onProgress(90);
  
  // === THANK YOU PAGE ===
  pdf.addPage();
  currentPage++;
  
  pdf.setFontSize(28);
  pdf.setTextColor(0);
  setFont('helvetica', 'bold');
  pdf.text('Thank You', pageWidth / 2, pageHeight / 2 - 20, { align: 'center' });
  
  pdf.setFontSize(12);
  setFont('helvetica', 'normal');
  pdf.text('Thank you to everyone who shared their memories', pageWidth / 2, pageHeight / 2, { align: 'center' });
  pdf.text('from this special event.', pageWidth / 2, pageHeight / 2 + 7, { align: 'center' });
  
  pdf.setFontSize(10);
  setFont('helvetica', 'italic');
  pdf.setTextColor(100);
  pdf.text('Created with love using MemTribe', pageWidth / 2, pageHeight / 2 + 25, { align: 'center' });
  
  onProgress(95);
  
  // Add page numbers to all pages except cover
  pdf.setFontSize(8);
  pdf.setTextColor(150);
  for (let i = 2; i <= currentPage; i++) {
    pdf.setPage(i);
    pdf.text(`${i - 1}`, pageWidth - margin - 5, pageHeight - 10);
  }
  
  onProgress(100);
  
  return pdf;
};

/**
 * Download the PDF
 */
export const downloadPDF = (pdf, filename) => {
  pdf.save(filename);
};

