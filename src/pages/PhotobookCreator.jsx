
import React, { useState, useEffect } from "react";
import { Event, Media, User } from "@/api/index";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { getPlanDetails } from "@/components/utils/plans";
import PhotobookTemplates, { PHOTOBOOK_TEMPLATES } from "@/components/templates/PhotobookTemplates";
import { createPageUrl } from "@/utils";
import {
  BookOpen,
  Download,
  Eye,
  ArrowLeft,
  Image as ImageIcon,
  Palette,
  FileText
} from "lucide-react";

export default function PhotobookCreator() {
  const [event, setEvent] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [approvedMedia, setApprovedMedia] = useState([]); // This will now hold only images
  const [totalApprovedMediaCount, setTotalApprovedMediaCount] = useState(0); // New state for all media types
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("minimal");
  const [photobookTitle, setPhotobookTitle] = useState("");
  const [photobookDescription, setPhotobookDescription] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const currentTemplate = PHOTOBOOK_TEMPLATES.find(t => t.id === selectedTemplate) || PHOTOBOOK_TEMPLATES[0];

  useEffect(() => {
    const loadData = async (id) => {
      try {
        const foundEvent = await Event.get(id);
        setEvent(foundEvent);
        setPhotobookTitle(`${foundEvent.title} - Memory Book`);
        setPhotobookDescription(`A beautiful collection of memories from ${foundEvent.title}`);

        const [organizer, allMedia] = await Promise.all([
          User.get(foundEvent.organizer_id),
          Media.filter({ event_id: id, status: "approved" }, "-created_at")
        ]);
        
        const plan = await getPlanDetails(organizer);
        setCurrentPlan(plan);

        // Store count of all approved media (photos and videos)
        setTotalApprovedMediaCount(allMedia.length);

        // Filter only images for photobook
        const imageMedia = allMedia.filter(media => media.media_type === 'image');
        setApprovedMedia(imageMedia);
        setSelectedMedia(imageMedia.map(media => media.id)); // Select all by default
      } catch (error) {
        console.error("Error loading photobook data:", error);
      }
      setIsLoading(false);
    };

    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('event');

    if (eventId) {
      loadData(eventId);
    } else {
      setIsLoading(false);
    }
  }, []);

  const toggleMediaSelection = (mediaId) => {
    setSelectedMedia(prev =>
      prev.includes(mediaId)
        ? prev.filter(id => id !== mediaId)
        : [...prev, mediaId]
    );
  };

  const selectAllMedia = () => {
    setSelectedMedia(approvedMedia.map(media => media.id));
  };

  const deselectAllMedia = () => {
    setSelectedMedia([]);
  };

  const generatePhotobook = async () => {
    if (selectedMedia.length === 0) {
      alert("Please select at least one photo for your photobook.");
      return;
    }

    setIsGenerating(true);
    try {
      const selectedPhotos = approvedMedia.filter(media => selectedMedia.includes(media.id));
      
      // Create HTML photobook
      const photobookHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${photobookTitle}</title>
          <style>
            body { 
              font-family: 'Georgia', serif; 
              margin: 0; 
              padding: 20px; 
              background: ${currentTemplate.preview.includes('white') ? 'white' : '#f8f9fa'}; 
              line-height: 1.6;
            }
            .photobook { max-width: 800px; margin: 0 auto; }
            .cover { 
              text-align: center; 
              padding: 60px 40px; 
              margin-bottom: 40px; 
              border-bottom: 3px solid #ddd;
              ${currentTemplate.id === 'professional' ? 'background: linear-gradient(135deg, #1f2937, #374151); color: white;' : ''}
            }
            .cover img {
              width: 100%;
              height: auto;
              max-height: 300px;
              object-fit: cover;
              border-radius: 8px;
              margin-bottom: 30px;
              box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            }
            .cover h1 { font-size: 2.5em; margin-bottom: 20px; color: ${currentTemplate.id === 'professional' ? 'white' : '#333'}; }
            .cover p { font-size: 1.2em; color: ${currentTemplate.id === 'professional' ? '#d1d5db' : '#666'}; }
            .page { margin-bottom: 40px; page-break-inside: avoid; }
            .photo-grid { 
              display: ${currentTemplate.layoutStyle === 'grid' ? 'grid' : 'flex'}; 
              ${currentTemplate.layoutStyle === 'grid' ? 'grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));' : 'flex-wrap: wrap;'}
              gap: 20px; 
              margin-bottom: 40px; 
            }
            .photo-item { 
              ${currentTemplate.layoutStyle === 'creative' ? 'transform: rotate(' + (Math.random() * 4 - 2) + 'deg);' : ''}
              background: white; 
              padding: 15px; 
              border-radius: ${currentTemplate.id === 'scrapbook' ? '15px' : '8px'};
              box-shadow: 0 4px 8px rgba(0,0,0,0.1);
              ${currentTemplate.id === 'scrapbook' ? 'border: 3px solid #fbbf24;' : ''}
            }
            .photo-item img { width: 100%; height: 250px; object-fit: cover; border-radius: 4px; }
            .photo-caption { margin-top: 10px; font-style: italic; color: #666; }
            .photo-meta { font-size: 0.9em; color: #999; margin-top: 5px; }
            @media print { 
              body { background: white; } 
              .page { page-break-after: always; }
            }
          </style>
        </head>
        <body>
          <div class="photobook">
            <div class="cover">
              ${event.event_image ? `<img src="${event.event_image}" alt="Event Banner" />` : ''}
              <h1>${photobookTitle}</h1>
              <p>${photobookDescription}</p>
              <p><small>Created with MemTribe • ${new Date().toLocaleDateString()}</small></p>
            </div>
            
            <div class="photo-grid">
              ${selectedPhotos.map(photo => `
                <div class="photo-item">
                  <img src="${photo.filtered_url || photo.media_url}" alt="Event memory" />
                  ${photo.caption ? `<div class="photo-caption">${photo.caption}</div>` : ''}
                  <div class="photo-meta">By ${photo.uploader_name} • ${new Date(photo.created_at).toLocaleDateString()}</div>
                </div>
              `).join('')}
            </div>
            
            <div class="page" style="text-align: center; margin-top: 60px;">
              <h2>Thank You</h2>
              <p>Thank You to everyone who shared their memories from this special event.</p>
              <p><em>Created with love using MemTribe</em></p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Download the HTML file
      const blob = new Blob([photobookHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${photobookTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_photobook.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('Photobook downloaded! Open the HTML file in your browser and use Print to save as PDF.');
    } catch (error) {
      console.error('Error generating photobook:', error);
      alert('Failed to generate photobook. Please try again.');
    }
    setIsGenerating(false);
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Event Not Found</h2>
        <p className="text-slate-600">Please ensure you have a valid event ID.</p>
      </div>
    );
  }

  if (approvedMedia.length === 0) {
    return (
      <div className="p-8 text-center max-w-2xl mx-auto">
        <ImageIcon className="w-20 h-20 mx-auto text-slate-300 mb-6" />
        <h2 className="text-2xl font-bold text-slate-900 mb-4">No Photos Available for Photobook</h2>
        {totalApprovedMediaCount > 0 ? (
           <p className="text-slate-600 mb-6">
            There are approved media items for this event, but no photos. Photobooks can only be created from images. Please ensure photos are uploaded and approved.
          </p>
        ) : (
          <p className="text-slate-600 mb-6">
            There are no approved photos for this event yet. Photos need to be uploaded and approved by a moderator before they can be added to a photobook.
          </p>
        )}
        <Button onClick={() => window.history.back()} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const selectedPhotos = approvedMedia.filter(media => selectedMedia.includes(media.id));

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Photobook</h1>
            <p className="text-slate-600">Design a beautiful memory book for "{event.title}"</p>
          </div>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Photobook Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-600" />
                  Photobook Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={photobookTitle}
                    onChange={(e) => setPhotobookTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={photobookDescription}
                    onChange={(e) => setPhotobookDescription(e.target.value)}
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Template Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-amber-600" />
                  Choose Template
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PhotobookTemplates
                  selectedTemplate={selectedTemplate}
                  onTemplateSelect={setSelectedTemplate}
                  currentPlan={currentPlan}
                />
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="text-sm text-slate-600 mb-4">
                  {selectedMedia.length} of {approvedMedia.length} photos selected
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={selectAllMedia} variant="outline" size="sm" className="flex-1">
                    Select All
                  </Button>
                  <Button onClick={deselectAllMedia} variant="outline" size="sm" className="flex-1">
                    Clear All
                  </Button>
                </div>
                
                <Button
                  onClick={generatePhotobook}
                  disabled={isGenerating || selectedMedia.length === 0}
                  className="w-full bg-amber-600 hover:bg-amber-700"
                >
                  {isGenerating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Generate Photobook
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Photo Selection */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-amber-600" />
                  Select Photos ({approvedMedia.length} available)
                </CardTitle>
                <p className="text-sm text-slate-500 pt-1">Only images can be included in a photobook. Videos will not be shown here.</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {approvedMedia.map((media) => {
                    const isSelected = selectedMedia.includes(media.id);
                    
                    return (
                      <div
                        key={media.id}
                        className={`relative group cursor-pointer border-2 rounded-lg overflow-hidden transition-all duration-200 ${
                          isSelected ? 'border-amber-500 shadow-lg' : 'border-slate-200 hover:border-slate-300'
                        }`}
                        onClick={() => toggleMediaSelection(media.id)}
                      >
                        <img
                          src={media.filtered_url || media.media_url}
                          alt="Event memory"
                          className="w-full h-32 object-cover"
                        />
                        
                        {/* Selection overlay */}
                        <div className={`absolute inset-0 bg-black/20 flex items-center justify-center ${
                          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}>
                          <div className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center ${
                            isSelected ? 'bg-amber-500' : 'bg-transparent'
                          }`}>
                            {isSelected && <div className="w-4 h-4 bg-white rounded-full"></div>}
                          </div>
                        </div>
                        
                        {/* Photo info */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                          <p className="text-white text-xs font-medium truncate">{media.uploader_name}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
