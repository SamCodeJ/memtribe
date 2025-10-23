
import React, { useState, useEffect } from "react";
import { Event, RSVP } from "@/api/index";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle2,
  User as UserIcon,
  Mail,
  Phone,
  ImageIcon // Added ImageIcon for media upload section
} from "lucide-react";

// Simple utility to create a page URL based on a base path and parameters.
// In a real application, this would typically be a more sophisticated router helper
// (e.g., integrating with React Router's `generatePath` or `useNavigate`).
// Given the usage like `MediaUpload?event=${event.id}`, it assumes the input `path`
// is already a string that can be directly used as a relative URL, potentially
// including query parameters.
const createPageUrl = (path) => {
  return `/${path}`; // Assumes it should prepend a slash for a root-relative path
};

export default function EventView() {
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);
  const [emailNotAllowed, setEmailNotAllowed] = useState(false); // New state for invite-only email check
  const [rsvpData, setRsvpData] = useState({
    guest_name: "",
    guest_email: "",
    guest_phone: "",
    status: "attending",
    guest_count: 1,
    notes: ""
  });

  useEffect(() => {
    loadEvent();
  }, []);

  const loadEvent = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const eventId = urlParams.get('id');
      
      if (!eventId) {
        console.error("No event ID provided");
        setIsLoading(false);
        return;
      }

      const events = await Event.list();
      const foundEvent = events.find(e => e.id === eventId);
      
      if (!foundEvent) {
        console.error("Event not found");
        setIsLoading(false);
        return;
      }

      setEvent(foundEvent);
    } catch (error) {
      console.error("Error loading event:", error);
    }
    setIsLoading(false);
  };

  // Function to check if the given email is in the allowed list for invite-only events
  const checkEmailAllowed = (email) => {
    if (!event || event.event_type !== 'invite_only') {
      return true; // Not an invite-only event, so email is always allowed
    }
    // Normalize email for case-insensitive comparison
    const normalizedEmail = email.toLowerCase();
    // Assuming event.allowed_emails is an array of strings
    return event.allowed_emails && event.allowed_emails.map(e => e.toLowerCase()).includes(normalizedEmail);
  };

  const handleRSVPSubmit = async () => {
    if (!rsvpData.guest_name || !rsvpData.guest_email) {
      alert("Please fill in your name and email");
      return;
    }

    // Check if email is allowed for invite-only events
    if (event.event_type === 'invite_only' && !checkEmailAllowed(rsvpData.guest_email)) {
      setEmailNotAllowed(true);
      alert("Sorry, your email is not on the guest list for this invite-only event.");
      return;
    }

    setEmailNotAllowed(false); // Reset error state if check passes
    setIsSubmitting(true);
    try {
      await RSVP.create({
        ...rsvpData,
        event_id: event.id
      });
      setRsvpSubmitted(true);
    } catch (error) {
      console.error("Error submitting RSVP:", error);
      alert("Failed to submit RSVP. Please try again.");
    }
    setIsSubmitting(false);
  };

  const handleInputChange = (field, value) => {
    setRsvpData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Reset email error when user changes email input
    if (field === 'guest_email') {
      setEmailNotAllowed(false);
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
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Event Not Found</h2>
          <p className="text-slate-600">The event you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Event Header */}
        <Card className="border-0 shadow-xl mb-8">
          <CardHeader className="p-0">
            {event.event_image && (
              <div className="relative">
                <img 
                  src={event.event_image} 
                  alt={event.title}
                  className="w-full h-64 md:h-80 object-cover rounded-t-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-t-lg"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h1 className="text-3xl md:text-5xl font-bold mb-2">{event.title}</h1>
                  <div className="flex items-center gap-4 text-white/90">
                    <Badge className="bg-white/20 text-white border-white/30">
                      {event.event_type.replace('_', ' ')}
                    </Badge>
                    <Badge className={`${
                      event.status === 'published' ? 'bg-green-600' :
                      event.status === 'draft' ? 'bg-yellow-600' :
                      'bg-slate-600'
                    } text-white`}>
                      {event.status}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </CardHeader>
          
          {!event.event_image && (
            <CardHeader className="text-center py-12">
              <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">{event.title}</h1>
              <div className="flex justify-center gap-4">
                <Badge variant="outline" className="text-lg px-4 py-2">
                  {event.event_type.replace('_', ' ')}
                </Badge>
                <Badge className={`${
                  event.status === 'published' ? 'bg-green-600' :
                  event.status === 'draft' ? 'bg-yellow-600' :
                  'bg-slate-600'
                } text-white text-lg px-4 py-2`}>
                  {event.status}
                </Badge>
              </div>
            </CardHeader>
          )}

          <CardContent className="p-8">
            {event.description && (
              <div className="mb-8">
                <p className="text-lg text-slate-700 leading-relaxed">{event.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Date & Time</p>
                  <p className="text-slate-600">{new Date(event.start_date).toLocaleDateString()}</p>
                  <p className="text-slate-600">{new Date(event.start_date).toLocaleTimeString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Location</p>
                  <p className="text-slate-600">{event.location}</p>
                </div>
              </div>

              {event.max_attendees && (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Capacity</p>
                    <p className="text-slate-600">{event.max_attendees} attendees</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Access Control Message for Invite-Only Events */}
        {event.event_type === 'invite_only' && (
          <Card className="border-0 shadow-lg mb-6 bg-amber-50 border-amber-200">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-amber-900 mb-2">Invite-Only Event</h3>
              <p className="text-amber-700">
                This is a private event. Please use the email address you were invited with to RSVP.
              </p>
            </CardContent>
          </Card>
        )}

        {/* RSVP Form */}
        {event.registration_required && !rsvpSubmitted && event.status === 'published' && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <UserIcon className="w-6 h-6 text-amber-600" />
                RSVP for this Event
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {emailNotAllowed && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">
                    ⚠️ Your email address is not authorized for this invite-only event.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="guest_name">Full Name *</Label>
                  <Input
                    id="guest_name"
                    value={rsvpData.guest_name}
                    onChange={(e) => handleInputChange('guest_name', e.target.value)}
                    placeholder="Enter your full name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="guest_email">Email Address *</Label>
                  <Input
                    id="guest_email"
                    type="email"
                    value={rsvpData.guest_email}
                    onChange={(e) => handleInputChange('guest_email', e.target.value)}
                    placeholder="Enter your email"
                    className={`mt-1 ${emailNotAllowed ? 'border-red-300 focus-visible:ring-red-500' : ''}`}
                  />
                  {event.event_type === 'invite_only' && (
                    <p className="text-xs text-slate-500 mt-1">
                      Use the email address you were invited with
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="guest_phone">Phone Number</Label>
                  <Input
                    id="guest_phone"
                    type="tel"
                    value={rsvpData.guest_phone}
                    onChange={(e) => handleInputChange('guest_phone', e.target.value)}
                    placeholder="Enter your phone number"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="guest_count">Number of Guests</Label>
                  <Input
                    id="guest_count"
                    type="number"
                    min="1"
                    value={rsvpData.guest_count}
                    onChange={(e) => handleInputChange('guest_count', parseInt(e.target.value, 10))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status">RSVP Status</Label>
                <Select
                  value={rsvpData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your response" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="attending">Yes, I'll be there</SelectItem>
                    <SelectItem value="maybe">Maybe</SelectItem>
                    <SelectItem value="not_attending">Sorry, can't make it</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={rsvpData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any additional information..."
                  rows={3}
                  className="mt-1"
                />
              </div>

              <Button
                onClick={handleRSVPSubmit}
                disabled={isSubmitting}
                size="lg"
                className="w-full bg-amber-600 hover:bg-amber-700"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                ) : (
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                )}
                Submit RSVP
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Guest Upload Instructions */}
        {event.status === 'published' && (
          <Card className="border-0 shadow-lg mt-6 bg-purple-50 border-purple-200">
            <CardContent className="p-6 text-center">
              <ImageIcon className="w-12 h-12 text-purple-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-purple-900 mb-2">Share Your Memories</h3>
              <p className="text-purple-700 mb-4">
                Upload photos and videos from the event to share with everyone! No account required - just your name and email.
              </p>
              <Button 
                onClick={() => window.open(createPageUrl(`MediaUpload?event=${event.id}`), '_blank')}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Upload Media as Guest
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Success Message */}
        {rsvpSubmitted && (
          <Card className="border-0 shadow-lg bg-green-50 border-green-200 mt-6">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-green-900 mb-2">RSVP Confirmed!</h3>
              <p className="text-green-700">
                Thank you for your response. We've received your RSVP and will send you updates about the event.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Event Status Messages */}
        {event.status === 'draft' && (
          <Card className="border-0 shadow-lg bg-yellow-50 border-yellow-200 mt-6">
            <CardContent className="p-6 text-center">
              <Clock className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">Event in Draft</h3>
              <p className="text-yellow-700">This event is still being prepared and not yet open for registration.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
