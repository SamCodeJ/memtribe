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
  
  // Get template styles
  const getTemplateStyles = (templateId) => {
    const styles = {
      'minimal': { coverBg: [255, 255, 255], titleColor: [0, 0, 0], accentColor: [251, 191, 36] },
      'classic': { coverBg: [255, 251, 235], titleColor: [120, 53, 15], accentColor: [217, 119, 6] },
      'magazine': { coverBg: [248, 250, 252], titleColor: [15, 23, 42], accentColor: [100, 116, 139] },
      'modern': { coverBg: [240, 249, 255], titleColor: [8, 47, 73], accentColor: [6, 182, 212] },
      'elegant': { coverBg: [250, 245, 255], titleColor: [88, 28, 135], accentColor: [168, 85, 247] },
      'scrapbook': { coverBg: [255, 251, 235], titleColor: [180, 83, 9], accentColor: [251, 191, 36] },
      'vintage': { coverBg: [254, 243, 199], titleColor: [120, 53, 15], accentColor: [180, 83, 9] },
      'storyteller': { coverBg: [236, 253, 245], titleColor: [6, 78, 59], accentColor: [16, 185, 129] },
      'professional': { coverBg: [31, 41, 55], titleColor: [255, 255, 255], accentColor: [251, 191, 36] },
      'luxury': { coverBg: [254, 243, 199], titleColor: [120, 53, 15], accentColor: [217, 119, 6] },
      'polaroid': { coverBg: [241, 245, 249], titleColor: [30, 41, 59], accentColor: [100, 116, 139] },
      'collage': { coverBg: [255, 247, 237], titleColor: [154, 52, 18], accentColor: [249, 115, 22] }
    };
    return styles[templateId] || styles['minimal'];
  };
  
  const templateStyles = getTemplateStyles(template.id);
  
  // Background for cover
  pdf.setFillColor(...templateStyles.coverBg);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');
  
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
  pdf.setTextColor(...templateStyles.titleColor);
  const titleY = 30 + coverImageHeight + 20;
  const titleLines = pdf.splitTextToSize(title, contentWidth);
  pdf.text(titleLines, pageWidth / 2, titleY, { align: 'center' });
  
  // Description
  setFont('helvetica', 'normal');
  pdf.setFontSize(14);
  const descColor = templateStyles.titleColor.map(c => Math.min(255, c + 80));
  pdf.setTextColor(...descColor);
  const descY = titleY + (titleLines.length * 12) + 10;
  const descLines = pdf.splitTextToSize(description, contentWidth - 20);
  pdf.text(descLines, pageWidth / 2, descY, { align: 'center' });
  
  // Footer
  pdf.setFontSize(10);
  const footerY = pageHeight - 30;
  pdf.text(`Created with MemTribe • ${new Date().toLocaleDateString()}`, pageWidth / 2, footerY, { align: 'center' });
  
  onProgress(10);
  
  // === PHOTO PAGES ===
  // Determine photos per page based on layout style
  const getPhotosPerPage = (layoutStyle) => {
    const layouts = {
      'grid': 4,
      'album': 2,
      'masonry': 3,
      'modern-grid': 4,
      'elegant': 2,
      'creative': 3,
      'vintage': 2,
      'story': 1,
      'formal': 2,
      'luxury': 2,
      'polaroid': 6,
      'collage': 4
    };
    return layouts[layoutStyle] || 4;
  };
  
  const photosPerPage = getPhotosPerPage(template.layoutStyle);
  let photosProcessed = 0;
  
  for (let i = 0; i < photos.length; i += photosPerPage) {
    // Add new page for photos
    pdf.addPage();
    currentPage++;
    
    const pagePhotos = photos.slice(i, i + photosPerPage);
    
    // Add decorative background for some templates
    if (['vintage', 'luxury', 'scrapbook'].includes(template.id)) {
      pdf.setFillColor(...templateStyles.coverBg);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');
    }
    
    // Calculate layout based on template
    if (['grid', 'modern-grid', 'collage'].includes(template.layoutStyle) && photosPerPage === 4) {
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
    } else if (template.layoutStyle === 'polaroid' && photosPerPage === 6) {
      // 3x2 Polaroid grid layout
      const photoWidth = (contentWidth - 20) / 3;
      const photoHeight = 50;
      const gapX = 10;
      const gapY = 15;
      
      for (let j = 0; j < pagePhotos.length; j++) {
        const photo = pagePhotos[j];
        const col = j % 3;
        const row = Math.floor(j / 3);
        const x = margin + (col * (photoWidth + gapX));
        const y = margin + (row * (photoHeight + 35));
        
        try {
          const imageData = await loadImageAsDataUrl(photo.filtered_url || photo.file_url);
          
          // Draw polaroid frame (white border with shadow)
          pdf.setFillColor(255, 255, 255);
          pdf.setDrawColor(200, 200, 200);
          pdf.rect(x - 2, y - 2, photoWidth + 4, photoHeight + 20, 'FD');
          
          // Draw photo
          pdf.addImage(imageData, 'JPEG', x, y, photoWidth, photoHeight);
          
          // Caption below (polaroid style)
          if (photo.caption || photo.uploaded_by) {
            pdf.setFontSize(7);
            pdf.setTextColor(80);
            setFont('helvetica', 'italic');
            const text = photo.caption || `By ${photo.uploaded_by || 'Guest'}`;
            const textLines = pdf.splitTextToSize(text, photoWidth - 4);
            pdf.text(textLines, x + photoWidth/2, y + photoHeight + 6, { align: 'center' });
          }
        } catch (error) {
          console.warn(`Failed to load photo ${photo.id}:`, error);
          pdf.setDrawColor(200);
          pdf.setFillColor(240);
          pdf.rect(x, y, photoWidth, photoHeight, 'FD');
          pdf.setTextColor(150);
          pdf.setFontSize(7);
          pdf.text('Image not available', x + photoWidth/2, y + photoHeight/2, { align: 'center' });
        }
        
        photosProcessed++;
        const progress = 10 + Math.round((photosProcessed / photos.length) * 80);
        onProgress(progress);
      }
    } else if (template.layoutStyle === 'masonry' && photosPerPage === 3) {
      // Magazine-style varied layout (3 photos)
      const layouts = [
        { x: margin, y: margin, w: contentWidth * 0.55, h: 80 },
        { x: margin + contentWidth * 0.6, y: margin, w: contentWidth * 0.4, h: 50 },
        { x: margin + contentWidth * 0.6, y: margin + 55, w: contentWidth * 0.4, h: 50 }
      ];
      
      for (let j = 0; j < pagePhotos.length; j++) {
        const photo = pagePhotos[j];
        const layout = layouts[j] || layouts[0];
        
        try {
          const imageData = await loadImageAsDataUrl(photo.filtered_url || photo.file_url);
          pdf.addImage(imageData, 'JPEG', layout.x, layout.y, layout.w, layout.h);
          
          if (photo.caption) {
            pdf.setFontSize(8);
            pdf.setTextColor(100);
            setFont('helvetica', 'italic');
            const captionLines = pdf.splitTextToSize(photo.caption, layout.w);
            pdf.text(captionLines, layout.x, layout.y + layout.h + 4);
          }
        } catch (error) {
          console.warn(`Failed to load photo ${photo.id}:`, error);
          pdf.setDrawColor(200);
          pdf.setFillColor(240);
          pdf.rect(layout.x, layout.y, layout.w, layout.h, 'FD');
        }
        
        photosProcessed++;
        const progress = 10 + Math.round((photosProcessed / photos.length) * 80);
        onProgress(progress);
      }
    } else if (template.layoutStyle === 'story' && photosPerPage === 1) {
      // Storyteller layout - one large photo with lots of caption space
      const photo = pagePhotos[0];
      const photoWidth = contentWidth;
      const photoHeight = 120;
      const y = margin + 10;
      
      try {
        const imageData = await loadImageAsDataUrl(photo.filtered_url || photo.file_url);
        pdf.addImage(imageData, 'JPEG', margin, y, photoWidth, photoHeight);
        
        // Large caption area
        if (photo.caption) {
          pdf.setFontSize(12);
          pdf.setTextColor(60);
          setFont('helvetica', 'normal');
          const captionLines = pdf.splitTextToSize(photo.caption, photoWidth);
          pdf.text(captionLines, margin, y + photoHeight + 10);
        }
        
        // Meta info
        pdf.setFontSize(9);
        pdf.setTextColor(130);
        setFont('helvetica', 'italic');
        pdf.text(`Shared by ${photo.uploaded_by || 'Guest'} on ${new Date(photo.created_at).toLocaleDateString()}`, 
                 margin, y + photoHeight + (photo.caption ? 25 : 10));
      } catch (error) {
        console.warn(`Failed to load photo ${photo.id}:`, error);
        pdf.setDrawColor(200);
        pdf.setFillColor(240);
        pdf.rect(margin, y, photoWidth, photoHeight, 'FD');
      }
      
      photosProcessed++;
      const progress = 10 + Math.round((photosProcessed / photos.length) * 80);
      onProgress(progress);
    } else {
      // Standard vertical layout (for album, elegant, vintage, luxury, formal - 2 photos)
      const photoWidth = contentWidth;
      const photoHeight = 100;
      
      for (let j = 0; j < pagePhotos.length; j++) {
        const photo = pagePhotos[j];
        const y = margin + (j * (photoHeight + 35));
        
        try {
          const imageData = await loadImageAsDataUrl(photo.filtered_url || photo.file_url);
          
          // Add template-specific decorations
          if (template.id === 'classic' || template.id === 'album') {
            // Classic photo border
            pdf.setDrawColor(...templateStyles.accentColor);
            pdf.setLineWidth(0.5);
            pdf.rect(margin - 2, y - 2, photoWidth + 4, photoHeight + 4);
          } else if (template.id === 'luxury') {
            // Gold accent border
            pdf.setDrawColor(217, 119, 6);
            pdf.setLineWidth(1);
            pdf.rect(margin - 3, y - 3, photoWidth + 6, photoHeight + 6);
          } else if (template.id === 'vintage') {
            // Vintage rounded corners effect (simulated with lines)
            pdf.setDrawColor(180, 83, 9);
            pdf.setLineWidth(0.3);
            pdf.rect(margin, y, photoWidth, photoHeight);
          }
          
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

