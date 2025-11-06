
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Event, Media, User } from "@/api/index";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPlanDetails } from "@/components/utils/plans"; // Updated import
import SlideshowTemplates, { SLIDESHOW_TEMPLATES } from "@/components/templates/SlideshowTemplates";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Maximize,
  User as UserIcon,
  Heart,
  Download,
  Palette
} from "lucide-react";

export default function EventSlideshow() {
  const [event, setEvent] = useState(null);
  const [eventPlan, setEventPlan] = useState(null); // Initialized to null
  const [approvedMedia, setApprovedMedia] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("classic");
  const [isDownloading, setIsDownloading] = useState(false);

  const { slideDuration, refreshInterval } = useMemo(() => {
    // Provide default values if eventPlan is not yet loaded
    if (!eventPlan) {
      return { slideDuration: 5000, refreshInterval: 30000 };
    }
    // Use dynamic values from eventPlan, with fallbacks
    return {
      slideDuration: eventPlan.slideshow_speed || 5000,
      refreshInterval: eventPlan.slideshow_refresh || 30000
    };
  }, [eventPlan]);

  const currentTemplate = SLIDESHOW_TEMPLATES.find(t => t.id === selectedTemplate) || SLIDESHOW_TEMPLATES[0];

  // Helper function to fetch approved media and update state
  const fetchApprovedMedia = useCallback(async (eventId) => {
    try {
      const media = await Media.filter({
        event_id: eventId,
        status: "approved"
      }, "-created_at");
      setApprovedMedia(media);

      if (media.length > 0) {
        // Ensure current index is within bounds of new media array
        setCurrentIndex(prev => prev >= media.length ? 0 : prev);
      } else {
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error("Error fetching approved media:", error);
      setApprovedMedia([]); // Clear media on error
      setCurrentIndex(0);
    }
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const eventId = urlParams.get('event');

        if (!eventId) {
          setIsLoading(false);
          return;
        }

        const foundEvent = await Event.get(eventId); // Using .get for single entity
        if (!foundEvent) {
          console.error("Event not found for ID:", eventId);
          setIsLoading(false);
          return;
        }

        setEvent(foundEvent);

        const organizer = await User.get(foundEvent.organizer_id); // Using .get for single entity
        if (organizer) {
          const plan = await getPlanDetails(organizer); // Fetch dynamic plan details
          setEventPlan(plan);
        } else {
          console.warn("Organizer not found for event:", foundEvent.id);
          // Set a default plan if organizer isn't found
          setEventPlan(await getPlanDetails({})); // Pass an empty object to get default plan
        }

        await fetchApprovedMedia(eventId); // Fetch initial media
      } catch (error) {
        console.error("Error loading slideshow data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [fetchApprovedMedia]); // Dependency on fetchApprovedMedia

  useEffect(() => {
    let interval;
    if (isPlaying && approvedMedia.length > 0) {
      interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % approvedMedia.length);
      }, slideDuration);
    }
    return () => clearInterval(interval);
  }, [isPlaying, approvedMedia.length, slideDuration]);

  useEffect(() => {
    // This effect handles refreshing media. It now uses the common fetchApprovedMedia.
    if (!event?.id) return; // Only refresh if event is loaded

    const intervalId = setInterval(() => fetchApprovedMedia(event.id), refreshInterval);
    return () => clearInterval(intervalId);
  }, [event?.id, refreshInterval, fetchApprovedMedia]); // Dependencies updated

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const nextSlide = () => {
    if (approvedMedia.length === 0) return;
    setCurrentIndex(prev => (prev + 1) % approvedMedia.length);
  };

  const prevSlide = () => {
    if (approvedMedia.length === 0) return;
    setCurrentIndex(prev =>
      prev === 0 ? approvedMedia.length - 1 : prev - 1
    );
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const downloadSlideshow = async () => {
    setIsDownloading(true);
    try {
      // Create a simple HTML slideshow that can be saved
      const slideshowHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${event.title} - Slideshow</title>
          <style>
            body { margin: 0; font-family: Arial, sans-serif; background: ${currentTemplate.preview.includes('gradient') ? 'linear-gradient(135deg, #1e293b, #0f172a)' : '#1e293b'}; }
            .slideshow { position: relative; width: 100vw; height: 100vh; overflow: hidden; }
            .slide { display: none; position: absolute; width: 100%; height: 100%; }
            .slide.active { display: flex; align-items: center; justify-content: center; }
            .slide img, .slide video { max-width: 100%; max-height: 100%; object-fit: contain; }
            .overlay { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); color: white; padding: 20px; }
            .controls { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); display: flex; gap: 10px; }
            .btn { background: rgba(255,255,255,0.2); border: none; color: white; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
            .btn:hover { background: rgba(255,255,255,0.3); }
          </style>
        </head>
        <body>
          <div class="slideshow">
            ${approvedMedia.map((media, index) => `
              <div class="slide ${index === 0 ? 'active' : ''}" data-index="${index}">
                ${media.file_type === 'image'
                  ? `<img src="${media.filtered_url || media.file_url}" alt="Event memory" />`
                  : `<video src="${media.file_url}" controls muted />`
                }
                <div class="overlay">
                  <h3>${media.caption || ''}</h3>
                  <p>By ${media.uploaded_by || 'Guest'} • ${new Date(media.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            `).join('')}
            <div class="controls">
              <button class="btn" onclick="prevSlide()">&#x2B8C; Previous</button>
              <button class="btn" onclick="togglePlay()" id="playBtn">&#x23F8; Pause</button>
              <button class="btn" onclick="nextSlide()">Next &#x2B8D;</button>
            </div>
          </div>
          <script>
            let currentSlide = 0;
            let isPlaying = true;
            let interval;
            
            function showSlide(n) {
              const slides = document.querySelectorAll('.slide');
              slides.forEach(slide => slide.classList.remove('active'));
              slides[n].classList.add('active');
            }
            
            function nextSlide() {
              currentSlide = (currentSlide + 1) % ${approvedMedia.length};
              showSlide(currentSlide);
            }
            
            function prevSlide() {
              currentSlide = currentSlide === 0 ? ${approvedMedia.length - 1} : currentSlide - 1;
              showSlide(currentSlide);
            }
            
            function togglePlay() {
              const btn = document.getElementById('playBtn');
              if (isPlaying) {
                clearInterval(interval);
                btn.textContent = '&#x23F5; Play';
              } else {
                interval = setInterval(nextSlide, ${slideDuration});
                btn.textContent = '&#x23F8; Pause';
              }
              isPlaying = !isPlaying;
            }
            
            // Auto-start slideshow
            interval = setInterval(nextSlide, ${slideDuration});
          </script>
        </body>
        </html>
      `;
      
      // Create and download the file
      const blob = new Blob([slideshowHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_slideshow.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert('Slideshow downloaded! Open the HTML file in your browser to view.');
    } catch (error) {
      console.error('Error downloading slideshow:', error);
      alert('Failed to download slideshow. Please try again.');
    }
    setIsDownloading(false);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-600 border-t-transparent mx-auto mb-4"></div>
          <p>Loading slideshow...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
          <p className="text-slate-300">Please ensure you have a valid event ID in the URL.</p>
        </div>
      </div>
    );
  }

  if (approvedMedia.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center text-white max-w-md">
          <Heart className="w-16 h-16 mx-auto mb-6 text-amber-400" />
          <h2 className="text-3xl font-bold mb-4">{event.title}</h2>
          <p className="text-xl mb-6">Memories Loading...</p>
          <p className="text-slate-300">
            Photos and videos shared by guests will appear here once approved!
          </p>
        </div>
      </div>
    );
  }

  const currentMedia = approvedMedia[currentIndex];

  return (
    <div className={`min-h-screen ${currentTemplate.preview} ${isFullscreen ? 'p-0' : 'p-4'}`}>
      <div className="h-full flex flex-col">
        {/* Header */}
        {!isFullscreen && (
          <div className="text-center mb-6 relative">
            <h1 className={`text-4xl font-bold mb-2 ${currentTemplate.textColor}`}>{event.title}</h1>
            <p className="text-amber-400 text-lg">Live Memory Slideshow</p>
            
            {/* Template & Settings */}
            <div className="absolute top-0 right-0 flex gap-2">
              <Button
                onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Palette className="w-4 h-4 mr-2" />
                Templates
              </Button>
              <Button
                onClick={downloadSlideshow}
                disabled={isDownloading}
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                {isDownloading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Download
              </Button>
            </div>
            
            {/* Template Selector */}
            {showTemplateSelector && (
              <div className="absolute top-12 right-0 w-96 bg-white rounded-lg shadow-xl p-4 z-10">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Choose Template</h3>
                <SlideshowTemplates
                  selectedTemplate={selectedTemplate}
                  onTemplateSelect={(templateId) => {
                    setSelectedTemplate(templateId);
                    setShowTemplateSelector(false);
                  }}
                  currentPlan={eventPlan}
                />
              </div>
            )}
          </div>
        )}

        {/* Main Slideshow Area */}
        <div className="flex-1 relative">
          <Card className="h-full border-0 shadow-2xl bg-black overflow-hidden">
            <CardContent className="p-0 h-full relative">
              {currentMedia.file_type === 'image' ? (
                <img
                  src={currentMedia.filtered_url || currentMedia.file_url}
                  alt="Event memory"
                  className="w-full h-full object-contain"
                />
              ) : (
                <video
                  src={currentMedia.file_url}
                  className="w-full h-full object-contain"
                  autoPlay
                  muted
                  loop
                />
              )}

              {/* Media Info Overlay */}
              <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${currentTemplate.overlayColor} p-6`}>
                <div className="text-white">
                  {currentMedia.caption && (
                    <p className="text-xl mb-2">{currentMedia.caption}</p>
                  )}
                  <div className="flex items-center gap-2 text-amber-400">
                    <UserIcon className="w-4 h-4" />
                    <span>{currentMedia.uploaded_by || 'Guest'}</span>
                    <span className="mx-2">•</span>
                    <span className="text-white/70">
                      {new Date(currentMedia.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="absolute top-4 left-4 right-4">
                <div className="flex gap-1">
                  {approvedMedia.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1 flex-1 rounded ${
                        index === currentIndex ? 'bg-amber-400' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Watermark - Conditionally rendered based on custom_branding plan setting */}
              {eventPlan?.custom_branding === false && (
                <div className="absolute bottom-4 right-4 text-white/50 text-sm font-semibold">
                  Powered by MemTribe
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="mt-6 flex justify-center gap-4">
          <Button
            onClick={prevSlide}
            variant="outline"
            size="icon"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <SkipBack className="w-5 h-5" />
          </Button>

          <Button
            onClick={togglePlayPause}
            variant="outline"
            size="icon"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>

          <Button
            onClick={nextSlide}
            variant="outline"
            size="icon"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <SkipForward className="w-5 h-5" />
          </Button>

          <Button
            onClick={toggleFullscreen}
            variant="outline"
            size="icon"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Maximize className="w-5 h-5" />
          </Button>
        </div>

        {/* Stats */}
        {!isFullscreen && (
          <div className={`text-center mt-4 ${currentTemplate.textColor}`}>
            <p>{currentIndex + 1} of {approvedMedia.length} memories</p>
          </div>
        )}
      </div>
    </div>
  );
}
