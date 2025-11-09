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
  backgroundColor = '#FFFFFF',
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
  
  // Helper to convert hex color to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [255, 255, 255];
  };
  
  // Helper to determine if color is dark (for text color)
  const isColorDark = (rgb) => {
    // Using luminance formula
    const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
    return luminance < 0.5;
  };
  
  // === COVER PAGE ===
  onProgress(5);
  
  // Get template styles using the selected background color
  const bgRgb = hexToRgb(backgroundColor);
  const isDark = isColorDark(bgRgb);
  const templateStyles = {
    coverBg: bgRgb,
    titleColor: isDark ? [255, 255, 255] : [0, 0, 0],
    accentColor: [251, 191, 36] // Keep amber accent
  };
  
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
      'grid': 4,                    // Grid Layout - 2x2 grid
      'single-large': 1,            // Single Photo - one per page
      'masonry': 3,                 // Masonry - varied sizes
      'magazine-spread': 3,         // Magazine Spread - one large + 2 small
      'two-column': 2,              // Two Column - two side by side
      'polaroid-stack': 4,          // Polaroid Stack - 4 polaroids
      'collage': 4,                 // Creative Collage - overlapping
      'storyteller': 1,             // Storyteller - large photo + text
      'full-bleed': 1,              // Full Bleed - edge to edge
      'cinematic': 1,               // Cinematic - widescreen
      'editorial': 3                // Editorial - asymmetric
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
    if (template.layoutStyle === 'grid' && photosPerPage === 4) {
      // Standard 2x2 grid layout
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
    } else if (template.layoutStyle === 'single-large' && photosPerPage === 1) {
      // Single large photo per page with caption
      const photo = pagePhotos[0];
      const photoWidth = contentWidth;
      const photoHeight = 140;
      const y = margin + 20;
      
      try {
        const imageData = await loadImageAsDataUrl(photo.filtered_url || photo.file_url);
        pdf.addImage(imageData, 'JPEG', margin, y, photoWidth, photoHeight);
        
        // Caption below
        if (photo.caption) {
          pdf.setFontSize(11);
          pdf.setTextColor(80);
          setFont('helvetica', 'normal');
          const captionLines = pdf.splitTextToSize(photo.caption, photoWidth);
          pdf.text(captionLines, margin, y + photoHeight + 10);
        }
        
        // Meta info
        pdf.setFontSize(9);
        pdf.setTextColor(130);
        setFont('helvetica', 'normal');
        pdf.text(`By ${photo.uploaded_by || 'Guest'} • ${new Date(photo.created_at).toLocaleDateString()}`, 
                 margin, y + photoHeight + (photo.caption ? 20 : 10));
      } catch (error) {
        console.warn(`Failed to load photo ${photo.id}:`, error);
        pdf.setDrawColor(200);
        pdf.setFillColor(240);
        pdf.rect(margin, y, photoWidth, photoHeight, 'FD');
      }
      
      photosProcessed++;
      const progress = 10 + Math.round((photosProcessed / photos.length) * 80);
      onProgress(progress);
    } else if (template.layoutStyle === 'two-column' && photosPerPage === 2) {
      // Two photos side by side
      const photoWidth = (contentWidth - 5) / 2;
      const photoHeight = 110;
      const gap = 5;
      
      for (let j = 0; j < pagePhotos.length; j++) {
        const photo = pagePhotos[j];
        const x = margin + (j * (photoWidth + gap));
        const y = margin + 20;
        
        try {
          const imageData = await loadImageAsDataUrl(photo.filtered_url || photo.file_url);
          pdf.addImage(imageData, 'JPEG', x, y, photoWidth, photoHeight);
          
          if (photo.caption) {
            pdf.setFontSize(8);
            pdf.setTextColor(100);
            setFont('helvetica', 'italic');
            const captionLines = pdf.splitTextToSize(photo.caption, photoWidth - 4);
            pdf.text(captionLines, x + 2, y + photoHeight + 5);
          }
        } catch (error) {
          console.warn(`Failed to load photo ${photo.id}:`, error);
          pdf.setDrawColor(200);
          pdf.setFillColor(240);
          pdf.rect(x, y, photoWidth, photoHeight, 'FD');
        }
        
        photosProcessed++;
        const progress = 10 + Math.round((photosProcessed / photos.length) * 80);
        onProgress(progress);
      }
    } else if (template.layoutStyle === 'magazine-spread' && photosPerPage === 3) {
      // One large photo on left, two stacked on right
      const layouts = [
        { x: margin, y: margin + 10, w: contentWidth * 0.58, h: 120 },
        { x: margin + contentWidth * 0.62, y: margin + 10, w: contentWidth * 0.38, h: 57 },
        { x: margin + contentWidth * 0.62, y: margin + 73, w: contentWidth * 0.38, h: 57 }
      ];
      
      for (let j = 0; j < pagePhotos.length; j++) {
        const photo = pagePhotos[j];
        const layout = layouts[j] || layouts[0];
        
        try {
          const imageData = await loadImageAsDataUrl(photo.filtered_url || photo.file_url);
          pdf.addImage(imageData, 'JPEG', layout.x, layout.y, layout.w, layout.h);
          
          if (photo.caption) {
            pdf.setFontSize(7);
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
    } else if (template.layoutStyle === 'polaroid-stack' && photosPerPage === 4) {
      // 2x2 grid of polaroid-style photos
      const photoWidth = (contentWidth - 15) / 2;
      const photoHeight = 65;
      const gap = 15;
      
      for (let j = 0; j < pagePhotos.length; j++) {
        const photo = pagePhotos[j];
        const col = j % 2;
        const row = Math.floor(j / 2);
        const x = margin + (col * (photoWidth + gap));
        const y = margin + 15 + (row * (photoHeight + 30));
        
        try {
          const imageData = await loadImageAsDataUrl(photo.filtered_url || photo.file_url);
          
          // Draw polaroid frame
          pdf.setFillColor(255, 255, 255);
          pdf.setDrawColor(180, 180, 180);
          pdf.setLineWidth(0.5);
          pdf.rect(x - 3, y - 3, photoWidth + 6, photoHeight + 16, 'FD');
          
          // Add shadow effect
          pdf.setFillColor(220, 220, 220);
          pdf.rect(x + photoWidth + 4, y - 2, 2, photoHeight + 15, 'F');
          pdf.rect(x - 2, y + photoHeight + 14, photoWidth + 6, 2, 'F');
          
          // Draw photo
          pdf.addImage(imageData, 'JPEG', x, y, photoWidth, photoHeight);
          
          // Handwritten style caption at bottom
          if (photo.caption || photo.uploaded_by) {
            pdf.setFontSize(8);
            pdf.setTextColor(60);
            setFont('helvetica', 'italic');
            const text = photo.caption || `By ${photo.uploaded_by || 'Guest'}`;
            const textLines = pdf.splitTextToSize(text, photoWidth - 4);
            pdf.text(textLines, x + photoWidth/2, y + photoHeight + 7, { align: 'center' });
          }
        } catch (error) {
          console.warn(`Failed to load photo ${photo.id}:`, error);
        }
        
        photosProcessed++;
        const progress = 10 + Math.round((photosProcessed / photos.length) * 80);
        onProgress(progress);
      }
    } else if (template.layoutStyle === 'collage' && photosPerPage === 4) {
      // Overlapping, slightly rotated photos for artistic effect
      const baseWidth = contentWidth / 2.3;
      const baseHeight = 70;
      const positions = [
        { x: margin + 10, y: margin + 15, w: baseWidth, h: baseHeight, rotation: -2 },
        { x: margin + baseWidth - 5, y: margin + 10, w: baseWidth, h: baseHeight, rotation: 3 },
        { x: margin + 15, y: margin + baseHeight + 15, w: baseWidth, h: baseHeight, rotation: 1 },
        { x: margin + baseWidth, y: margin + baseHeight + 10, w: baseWidth, h: baseHeight, rotation: -3 }
      ];
      
      for (let j = 0; j < pagePhotos.length; j++) {
        const photo = pagePhotos[j];
        const pos = positions[j] || positions[0];
        
        try {
          const imageData = await loadImageAsDataUrl(photo.filtered_url || photo.file_url);
          
          // Add shadow
          pdf.setFillColor(0, 0, 0, 0.1);
          pdf.rect(pos.x + 1, pos.y + 1, pos.w, pos.h, 'F');
          
          // Add image (rotation would require more complex PDF manipulation)
          pdf.addImage(imageData, 'JPEG', pos.x, pos.y, pos.w, pos.h);
          
          // Add border
          pdf.setDrawColor(240, 240, 240);
          pdf.setLineWidth(2);
          pdf.rect(pos.x, pos.y, pos.w, pos.h);
        } catch (error) {
          console.warn(`Failed to load photo ${photo.id}:`, error);
        }
        
        photosProcessed++;
        const progress = 10 + Math.round((photosProcessed / photos.length) * 80);
        onProgress(progress);
      }
    } else if (template.layoutStyle === 'full-bleed' && photosPerPage === 1) {
      // Edge-to-edge photo covering entire page
      const photo = pagePhotos[0];
      
      try {
        const imageData = await loadImageAsDataUrl(photo.filtered_url || photo.file_url);
        pdf.addImage(imageData, 'JPEG', 0, 0, pageWidth, pageHeight);
        
        // Add caption overlay at bottom if exists
        if (photo.caption) {
          pdf.setFillColor(0, 0, 0, 0.6);
          pdf.rect(0, pageHeight - 20, pageWidth, 20, 'F');
          pdf.setFontSize(10);
          pdf.setTextColor(255, 255, 255);
          setFont('helvetica', 'bold');
          pdf.text(photo.caption, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }
      } catch (error) {
        console.warn(`Failed to load photo ${photo.id}:`, error);
        pdf.setDrawColor(200);
        pdf.setFillColor(240);
        pdf.rect(0, 0, pageWidth, pageHeight, 'FD');
      }
      
      photosProcessed++;
      const progress = 10 + Math.round((photosProcessed / photos.length) * 80);
      onProgress(progress);
    } else if (template.layoutStyle === 'cinematic' && photosPerPage === 1) {
      // Widescreen with letterbox bars
      const photo = pagePhotos[0];
      const photoWidth = contentWidth;
      const photoHeight = 90;
      const y = (pageHeight - photoHeight) / 2;
      
      // Add letterbox bars
      pdf.setFillColor(0, 0, 0);
      pdf.rect(0, 0, pageWidth, y - 5, 'F');
      pdf.rect(0, y + photoHeight + 5, pageWidth, pageHeight - (y + photoHeight + 5), 'F');
      
      try {
        const imageData = await loadImageAsDataUrl(photo.filtered_url || photo.file_url);
        pdf.addImage(imageData, 'JPEG', margin, y, photoWidth, photoHeight);
      } catch (error) {
        console.warn(`Failed to load photo ${photo.id}:`, error);
        pdf.setDrawColor(200);
        pdf.setFillColor(240);
        pdf.rect(margin, y, photoWidth, photoHeight, 'FD');
      }
      
      photosProcessed++;
      const progress = 10 + Math.round((photosProcessed / photos.length) * 80);
      onProgress(progress);
    } else if (template.layoutStyle === 'editorial' && photosPerPage === 3) {
      // Asymmetric high-fashion layout
      const layouts = [
        { x: margin, y: margin + 10, w: contentWidth, h: 90 },
        { x: margin, y: margin + 105, w: contentWidth * 0.48, h: 45 },
        { x: margin + contentWidth * 0.52, y: margin + 105, w: contentWidth * 0.48, h: 45 }
      ];
      
      for (let j = 0; j < pagePhotos.length; j++) {
        const photo = pagePhotos[j];
        const layout = layouts[j] || layouts[0];
        
        try {
          const imageData = await loadImageAsDataUrl(photo.filtered_url || photo.file_url);
          pdf.addImage(imageData, 'JPEG', layout.x, layout.y, layout.w, layout.h);
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

