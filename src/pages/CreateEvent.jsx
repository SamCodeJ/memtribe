
import React, { useState, useEffect } from "react";
import { Event, User, GenerateImage, UploadFile } from "@/api/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { getPlanDetails } from "@/components/utils/plans";
import UpgradePlanBlocker from "@/components/billing/UpgradePlanBlocker";
import {
  Calendar,
  MapPin,
  Users,
  Image as ImageIcon,
  Sparkles,
  Plus,
  X,
  Save,
  Eye,
  Lock,
} from "lucide-react";

export default function CreateEvent() {
  const navigate = useNavigate();
  const [pageLoading, setPageLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [eventCount, setEventCount] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    location: "",
    event_type: "public",
    max_attendees: "",
    event_image: "",
    registration_required: true,
    allowed_emails: []
  });
  const [newEmail, setNewEmail] = useState("");

  useEffect(() => {
    const loadPrerequisites = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
        
        // Fetch dynamic plan details
        const plan = await getPlanDetails(user);
        setCurrentPlan(plan);

        // Calculate one month ago from the current date
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        
        // Filter events created by the user within the last month
        const userEvents = await Event.filter({ 
          organizer_id: user.id,
          created_date: { $gte: oneMonthAgo.toISOString() }
        });
        setEventCount(userEvents.length);

      } catch (error) {
        console.error("Error loading prerequisites:", error);
        // Optionally, handle error state or redirect
      } finally {
        setPageLoading(false);
      }
    };
    loadPrerequisites();
  }, []);

  const handleInputChange = (field, value) => {
    if (field === 'max_attendees' && currentPlan) {
      let numValue = parseInt(value, 10);
      // If input is not a valid number (e.g., empty string), set to 0 for comparison
      if (isNaN(numValue)) {
        numValue = 0;
      }
      if (value !== "" && numValue > currentPlan.guests_per_event) {
        alert(`Your plan allows a maximum of ${currentPlan.guests_per_event} guests per event.`);
        value = currentPlan.guests_per_event.toString(); // Cap at plan limit and convert back to string
      }
    }
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addAllowedEmail = () => {
    if (newEmail && newEmail.includes("@") && !formData.allowed_emails.includes(newEmail)) {
      setFormData(prev => ({
        ...prev,
        allowed_emails: [...prev.allowed_emails, newEmail]
      }));
      setNewEmail("");
    }
  };

  const removeAllowedEmail = (email) => {
    setFormData(prev => ({
      ...prev,
      allowed_emails: prev.allowed_emails.filter(e => e !== email)
    }));
  };

  const uploadEventImage = async (file) => {
    setIsUploadingImage(true);
    try {
      const { file_url } = await UploadFile({ file });
      setFormData(prev => ({
        ...prev,
        event_image: file_url
      }));
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
      alert("Please enter an event title first");
      return;
    }
    if (!currentPlan?.ai_image_generation) {
        alert("Your current plan does not support AI image generation. Please upgrade to use this feature.");
        return;
    }

    setIsGeneratingImage(true);
    try {
      const prompt = `Create a professional, elegant event banner for "${formData.title}". Style: modern, premium, sophisticated with subtle gradients. Theme: ${formData.event_type} event. High quality, suitable for luxury event management platform. No text overlay needed.`;

      const result = await GenerateImage({ prompt });
      setFormData(prev => ({
        ...prev,
        event_image: result.url
      }));
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Failed to generate image. Please try again.");
    }
    setIsGeneratingImage(false);
  };

  const generateQRCodeUrl = (eventId) => {
    const eventUrl = `${window.location.origin}${createPageUrl("EventView")}?id=${eventId}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(eventUrl)}`;
  };

  const handleSubmit = async (status = "draft") => {
    if (!formData.title || !formData.start_date || !formData.location) {
      alert("Please fill in all required fields");
      return;
    }

    // Ensure currentUser is loaded before submission
    if (!currentUser) {
      alert("User information not loaded. Please try again.");
      return;
    }

    setIsLoading(true);
    try {
      console.log('=== CREATE EVENT: Frontend Starting ===');
      console.log('Current User:', currentUser);
      console.log('Current Plan:', currentPlan);
      console.log('Event Count:', eventCount);
      
      const eventData = {
        ...formData,
        organizer_id: currentUser.id, // Use currentUser from state
        status,
        max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
        qr_code: "" // Initialize QR code
      };

      console.log('Creating event with data:', eventData);
      const createdEvent = await Event.create(eventData);
      console.log('Event created successfully:', createdEvent);

      // Generate and save QR code URL for the created event
      const qrCodeUrl = generateQRCodeUrl(createdEvent.id);
      await Event.update(createdEvent.id, { qr_code: qrCodeUrl });

      navigate(createPageUrl("MyEvents"));
    } catch (error) {
      console.error("=== CREATE EVENT ERROR ===");
      console.error("Full error object:", error);
      console.error("Error message:", error.message);
      console.error("Error response:", error.response);
      console.error("Response status:", error.response?.status);
      console.error("Response data:", error.response?.data);
      
      // Check if it's a subscription limit error
      if (error.response?.status === 403 || error.message?.includes('limit')) {
        const errorMessage = error.response?.data?.error || error.message || "Event creation limit reached. Please upgrade your plan.";
        console.log('LIMIT ERROR DETECTED:', errorMessage);
        alert(errorMessage);
        
        // Reload to refresh the event count and show the upgrade blocker
        window.location.reload();
      } else {
        console.log('GENERAL ERROR:', error.message);
        alert("Failed to create event. Please try again.");
      }
    }
    setIsLoading(false);
  };

  if (pageLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-600 border-t-transparent"></div>
      </div>
    );
  }

  // Check if the user has reached the event creation limit for their current plan
  if (currentPlan && eventCount >= currentPlan.events_per_month) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <UpgradePlanBlocker
          title="Event Limit Reached"
          message={`You have created ${eventCount} of ${currentPlan.events_per_month} events allowed on the ${currentPlan.name} plan this month. Please upgrade your plan to create more events.`}
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Create New Event</h1>
          <p className="text-slate-600">Design your perfect event experience</p>
        </div>

        <div className="space-y-8">
          {/* Basic Information */}
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
                    placeholder="Enter event title"
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
                      <SelectValue placeholder="Select event type" />
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
                  placeholder="Describe your event..."
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
                      <Badge variant="outline">Plan Max: {currentPlan.guests_per_event === Infinity ? 'Unlimited' : currentPlan.guests_per_event}</Badge>
                    )}
                  </Label>
                  <Input
                    id="max_attendees"
                    type="number"
                    value={formData.max_attendees}
                    onChange={(e) => handleInputChange('max_attendees', e.target.value)}
                    placeholder="No limit"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location *</Label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Enter event location"
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Event Image */}
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
                      value={formData.event_image}
                      onChange={(e) => handleInputChange('event_image', e.target.value)}
                      placeholder="Enter image URL"
                      className="flex-1"
                    />
                    <Button
                      onClick={generateEventImage}
                      disabled={isGeneratingImage || !formData.title}
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
                      id="banner-upload"
                    />
                    <Button
                      onClick={() => document.getElementById('banner-upload')?.click()}
                      disabled={isUploadingImage}
                      variant="outline"
                      className="flex-1"
                    >
                      {isUploadingImage ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-600 border-t-transparent mr-2"></div>
                      ) : (
                        <ImageIcon className="w-4 h-4 mr-2" />
                      )}
                      Upload Image File
                    </Button>
                  </div>
                </div>

                {formData.event_image && (
                  <div className="rounded-lg overflow-hidden border">
                    <img
                      src={formData.event_image}
                      alt="Event banner"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Event Settings */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-600" />
                Event Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Require Registration</Label>
                  <p className="text-sm text-slate-600">Guests must RSVP to attend</p>
                </div>
                <Switch
                  checked={formData.registration_required}
                  onCheckedChange={(checked) => handleInputChange('registration_required', checked)}
                />
              </div>

              {formData.event_type === "invite_only" && (
                <div className="space-y-4">
                  <Label>Allowed Email Addresses</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Enter email address"
                      onKeyPress={(e) => e.key === 'Enter' && addAllowedEmail()}
                      className="flex-1"
                    />
                    <Button
                      onClick={addAllowedEmail}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.allowed_emails.map((email, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {email}
                        <button
                          onClick={() => removeAllowedEmail(email)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button
              onClick={() => handleSubmit("draft")}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save as Draft
            </Button>
            <Button
              onClick={() => handleSubmit("published")}
              disabled={isLoading}
              className="bg-amber-600 hover:bg-amber-700 flex items-center gap-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <Eye className="w-4 h-4" />
              )}
              Publish Event
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
