
import React, { useState, useEffect, useRef } from "react";
import { Event, Media, User, UploadFile } from "@/api/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getPlanDetails } from "@/components/utils/plans";
import UpgradePlanBlocker from "@/components/billing/UpgradePlanBlocker";
import {
  Upload,
  Camera,
  Image as ImageIcon,
  Video,
  CheckCircle2,
  X
} from "lucide-react";

export default function MediaUpload() {
  const [event, setEvent] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null); // State for user's plan
  const [mediaCount, setMediaCount] = useState(0); // State for media count per event

  const [isLoading, setIsLoading] = useState(true); // Manages initial page loading and data fetching
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [formData, setFormData] = useState({
    uploader_name: "",
    uploader_email: "",
    caption: ""
  });
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);

  // Effect for initial event loading and plan/media count
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('event');
    
    const loadEventData = async () => {
      try {
        const foundEvent = await Event.get(eventId);
        if (!foundEvent) {
          // If event not found even with an eventId, explicitly set event to null
          setEvent(null);
          return;
        }
        setEvent(foundEvent);
        
        // Fetch event media count
        const eventMedia = await Media.filter({ event_id: eventId });
        setMediaCount(eventMedia.length);

        // Try to get current user's plan (if authenticated)
        try {
          const currentUser = await User.me();
          const plan = await getPlanDetails(currentUser);
          setCurrentPlan(plan);
        } catch (authError) {
          // Guest users - allow uploads without strict frontend limits
          // The backend will enforce proper limits based on the event organizer's plan
          console.log("Guest upload mode - backend will enforce limits");
          setCurrentPlan(null); // Set to null to indicate no frontend limit checking
        }

      } catch (error) {
        console.error("Error loading event:", error);
        setEvent(null); // Ensure event is null on error to show "Event Not Found"
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) {
      setIsLoading(true); // Start loading if eventId is present
      loadEventData();
    } else {
      setIsLoading(false); // If no eventId, stop loading immediately
      setEvent(null); // Ensure event is null if no ID to show "Event Not Found"
    }
  }, []);

  // Effect for stream cleanup when component unmounts or stream changes
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setShowCamera(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Unable to access camera. Please ensure your browser has camera permissions enabled.");
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height); // Ensure image fills canvas
    
    canvas.toBlob(async (blob) => {
      const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
      await handleFileUpload(file);
      stopCamera();
    }, 'image/jpeg', 0.8);
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      await handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file) => {
    if (!formData.uploader_name || !formData.uploader_email) {
      alert("Please enter your name and email first");
      return;
    }

    // Check if currentPlan is loaded and if media count exceeds the limit
    // Skip check for guest users (currentPlan === null) - backend will enforce limits
    if (currentPlan && currentPlan.media_per_event && mediaCount >= currentPlan.media_per_event) {
      alert(`This event has reached its media upload limit (${currentPlan.media_per_event} media) for the organizer's ${currentPlan.name} plan.`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress for UI feedback during upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(90, prev + 10));
      }, 200);

      const { file_url } = await UploadFile({ file });
      clearInterval(progressInterval);
      setUploadProgress(100); // Set to 100% on successful upload

      const mediaType = file.type.startsWith('video/') ? 'video' : 'image';
      
      await Media.create({
        event_id: event.id,
        uploader_name: formData.uploader_name,
        uploader_email: formData.uploader_email,
        media_url: file_url,
        media_type: mediaType,
        caption: formData.caption,
        status: "pending"
      });

      setUploadedFiles(prev => [...prev, {
        url: file_url,
        type: mediaType,
        name: file.name
      }]);
      setMediaCount(prev => prev + 1); // Increment media count after successful upload

      setFormData(prev => ({ ...prev, caption: "" })); // Clear caption after upload
      
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center p-4">
          <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
          <p className="text-slate-600">The event you are looking for could not be loaded. Please ensure you have a valid event link.</p>
        </div>
      </div>
    );
  }

  // Render UpgradePlanBlocker if media limit is reached (for authenticated users only)
  if (currentPlan && currentPlan.media_per_event && mediaCount >= currentPlan.media_per_event) {
     return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="p-4 md:p-8 max-w-2xl mx-auto">
          <UpgradePlanBlocker
            title="Media Upload Limit Reached"
            message={`This event has reached the maximum of ${currentPlan.media_per_event} media uploads allowed on the organizer's ${currentPlan.name} plan.`}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Share Your Memories</h1>
          <p className="text-slate-600">Upload photos and videos from</p>
          <p className="text-xl font-semibold text-amber-600">{event.title}</p>
        </div>

        {/* User Info Form */}
        <Card className="border-0 shadow-lg mb-6">
          <CardHeader>
            <CardTitle>Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="uploader_name">Your Name <span className="text-red-500">*</span></Label>
                <Input
                  id="uploader_name"
                  value={formData.uploader_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, uploader_name: e.target.value }))}
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <Label htmlFor="uploader_email">Email <span className="text-red-500">*</span></Label>
                <Input
                  id="uploader_email"
                  type="email"
                  value={formData.uploader_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, uploader_email: e.target.value }))}
                  placeholder="Enter your email"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload Options */}
        <Card className="border-0 shadow-lg mb-6">
          <CardHeader>
            <CardTitle>Upload Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="caption">Caption (Optional)</Label>
              <Textarea
                id="caption"
                value={formData.caption}
                onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
                placeholder="Add a caption to your photo/video..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || !formData.uploader_name || !formData.uploader_email}
                className="h-20 bg-blue-600 hover:bg-blue-700"
              >
                <Upload className="w-6 h-6 mr-2" />
                Choose Files
              </Button>
              
              <Button
                onClick={startCamera}
                disabled={isUploading || !formData.uploader_name || !formData.uploader_email}
                variant="outline"
                className="h-20"
              >
                <Camera className="w-6 h-6 mr-2" />
                Take Photo
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {isUploading && (
              <div className="space-y-2">
                <p className="text-sm text-slate-600">Uploading...</p>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Camera Modal */}
        {showCamera && (
          <Card className="border-0 shadow-lg mb-6">
            <CardContent className="p-6">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg"
                />
                <div className="flex justify-center gap-4 mt-4">
                  <Button onClick={capturePhoto} className="bg-green-600 hover:bg-green-700">
                    <Camera className="w-4 h-4 mr-2" />
                    Capture
                  </Button>
                  <Button onClick={stopCamera} variant="outline">
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Successfully Uploaded
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="relative">
                    {file.type === 'image' ? (
                      <img
                        src={file.url}
                        alt={`Uploaded ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-24 bg-slate-200 rounded-lg flex items-center justify-center">
                        <Video className="w-8 h-8 text-slate-500" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-600 mt-4">
                Your media has been submitted for review. Approved content will appear in the event slideshow!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
