
import React, { useState, useEffect } from "react";
import { Event, User, GenerateImage, UploadFile } from "@/api/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { getPlanDetails } from "@/components/utils/plans"; // Updated import
import { Calendar, Save, ArrowLeft, ImageIcon, Sparkles } from "lucide-react";

export default function EditEvent() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [eventId, setEventId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null); // New state for current user
  const [currentPlan, setCurrentPlan] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    location: "",
    event_type: "public",
    max_attendees: "",
    event_image: "",
  });

  useEffect(() => {
    // Get event ID from URL search parameters
    const urlParams = new URLSearchParams(window.location.search);
    const idFromUrl = urlParams.get('id');

    // Update eventId state. This allows the useEffect to react to ID changes.
    // React will prevent infinite loops if the value doesn't change.
    if (idFromUrl && idFromUrl !== eventId) {
        setEventId(idFromUrl);
    } else if (!idFromUrl && eventId !== null) {
        setEventId(null);
    }

    const loadEventData = async () => {
      if (!eventId) { // Ensure eventId is set before proceeding
        setIsLoading(false);
        return;
      }

      try {
        const user = await User.me();
        setCurrentUser(user);
        const plan = await getPlanDetails(user); // Fetch plan details from database
        setCurrentPlan(plan);

        const eventToEdit = await Event.get(eventId); // Fetch specific event
        if (eventToEdit) {
          // Format dates for datetime-local input
          const formatForInput = (dateStr) => {
            if (!dateStr) return "";
            const d = new Date(dateStr);
            // Adjust for timezone offset
            const tzoffset = (new Date()).getTimezoneOffset() * 60000;
            const localISOTime = (new Date(d - tzoffset)).toISOString().slice(0, 16);
            return localISOTime;
          }

          setFormData({
              ...eventToEdit,
              max_attendees: eventToEdit.max_attendees ? String(eventToEdit.max_attendees) : "",
              start_date: formatForInput(eventToEdit.start_date),
              end_date: formatForInput(eventToEdit.end_date)
          });
        } else {
            console.warn("Event not found for ID:", eventId);
        }
      } catch (error) {
        console.error("Failed to load event data", error);
        alert("Failed to load event data. Please try again.");
      }
      setIsLoading(false);
    };

    // Only load data if eventId is available
    if (eventId) {
        loadEventData();
    } else if (!idFromUrl) { // If no ID in URL, then stop loading
        setIsLoading(false);
    }
  }, [eventId]); // Rerun effect when eventId changes

  const handleInputChange = (field, value) => {
     if (field === 'max_attendees' && currentPlan) {
      let numValue = parseInt(value, 10);
      if (isNaN(numValue)) numValue = 0; // Treat empty string or non-numeric as 0 for comparison
      if (value !== "" && numValue > currentPlan.guests_per_event) { // Use currentPlan.guests_per_event
        alert(`Your plan allows a maximum of ${currentPlan.guests_per_event} guests per event.`);
        value = currentPlan.guests_per_event.toString(); // Set to max allowed and convert back to string
      }
    }
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const uploadEventImage = async (file) => {
    setIsUploadingImage(true);
    try {
      const { file_url } = await UploadFile({ file });
      setFormData(prev => ({ ...prev, event_image: file_url }));
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    }
    setIsUploadingImage(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("Image must be smaller than 5MB");
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert("Please select an image file");
        return;
      }
      uploadEventImage(file);
    }
  };

  const generateEventImage = async () => {
    if (!formData.title) {
      alert("Please provide an event title to generate an image.");
      return;
    }
    
    // Use currentPlan?.ai_image_generation for optional chaining and correct property name
    if (!currentPlan?.ai_image_generation) {
      alert("Your current plan does not support AI image generation. Please upgrade your plan to use this feature.");
      return;
    }

    setIsGeneratingImage(true);
    try {
      const prompt = `A professional, elegant event banner for an event titled "${formData.title}". Style: modern, sophisticated, premium. High quality, suitable for a luxury event platform. No text overlay.`;
      const result = await GenerateImage({ prompt });
      setFormData(prev => ({ ...prev, event_image: result.url }));
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Failed to generate image. Please try again or enter a URL manually.");
    }
    setIsGeneratingImage(false);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.start_date || !formData.location) { // Added start_date and location as required
      alert("Please fill in all required fields (Title, Start Date & Time, Location).");
      return;
    }

    setIsLoading(true);
    try {
      // Destructure and omit properties that should not be sent in update
      const { id, created_date, updated_date, organizer_id, qr_code, ...updateData } = formData;
      await Event.update(eventId, {
          ...updateData,
          max_attendees: updateData.max_attendees ? parseInt(updateData.max_attendees, 10) : null
      });
      navigate(createPageUrl("MyEvents"));
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Failed to update event. Please try again.");
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }
  
  if (!eventId) {
    return <div className="p-8">Event not found.</div>;
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Edit Event</h1>
            <p className="text-slate-600">Update the details for your event</p>
          </div>
          <Button variant="outline" onClick={() => navigate(createPageUrl("MyEvents"))}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </div>

        <div className="space-y-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-600" />
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="event_type">Event Type</Label>
                  <Select
                    value={formData.event_type}
                    onValueChange={(value) => handleInputChange('event_type', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="invite_only">Invite Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="start_date">Start Date & Time *</Label>
                  <Input
                    id="start_date"
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date & Time</Label>
                  <Input
                    id="end_date"
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => handleInputChange('end_date', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                    <Label htmlFor="max_attendees" className="flex items-center gap-2">Max Attendees
                        {currentPlan && (
                            <Badge variant="outline" className="text-xs font-normal">Plan Max: {currentPlan.guests_per_event === Infinity ? "Unlimited" : currentPlan.guests_per_event}</Badge>
                        )}
                    </Label>
                    <Input
                        id="max_attendees"
                        type="number"
                        value={formData.max_attendees}
                        onChange={(e) => handleInputChange('max_attendees', e.target.value)}
                        placeholder="No limit"
                        className="mt-1"
                        min="1"
                    />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-amber-600" />
                Event Banner
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Input
                      value={formData.event_image || ''}
                      onChange={(e) => handleInputChange('event_image', e.target.value)}
                      placeholder="Enter image URL"
                      className="flex-1"
                    />
                    <Button
                      onClick={generateEventImage}
                      disabled={isGeneratingImage || !formData.title || !currentPlan || !currentPlan.ai_image_generation}
                      variant="outline"
                      className="shrink-0"
                    >
                      {isGeneratingImage ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-600 border-t-transparent mr-2"></div>
                      ) : (
                        <Sparkles className="w-4 h-4 mr-2" />
                      )}
                      Generate AI Image
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex-1 border-t border-slate-200"></div>
                    <span className="text-sm text-slate-500">OR</span>
                    <div className="flex-1 border-t border-slate-200"></div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="banner-upload-edit"
                    />
                    <Button
                      onClick={() => document.getElementById('banner-upload-edit')?.click()}
                      disabled={isUploadingImage}
                      variant="outline"
                      className="flex-1"
                    >
                      {isUploadingImage ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-600 border-t-transparent mr-2"></div>
                      ) : (
                        <ImageIcon className="w-4 h-4 mr-2" />
                      )}
                      Upload New Image
                    </Button>
                  </div>
                </div>
                
                {formData.event_image && (
                  <div className="rounded-lg overflow-hidden border mt-4">
                    <img 
                      src={formData.event_image} 
                      alt="Event banner preview" 
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>

        <div className="flex justify-end mt-8">
          <Button
            onClick={handleSubmit}
            disabled={isLoading || isGeneratingImage || isUploadingImage}
            className="bg-amber-600 hover:bg-amber-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
