import React, { useState, useEffect, useCallback } from "react";
import { Event, Media, GenerateImage } from "@/api/index";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Check,
  X,
  Eye,
  Filter,
  Image as ImageIcon,
  Video,
  Clock,
  User
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function MediaModeration() {
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [mediaItems, setMediaItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState({});
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [moderatorNotes, setModeratorNotes] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

  const loadData = useCallback(async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const eventId = urlParams.get('event');
      
      if (!eventId) {
        navigate(createPageUrl("MyEvents"));
        return;
      }

      const events = await Event.list();
      const foundEvent = events.find(e => e.id === eventId);
      setEvent(foundEvent);

      const allMedia = await Media.filter({ event_id: eventId }, "-created_date");
      setMediaItems(allMedia);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  }, [navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const applyBrandingFilter = async (media) => {
    setIsProcessing(prev => ({ ...prev, [media.id]: true }));
    
    try {
      if (media.media_type === 'image') {
        const prompt = `Add elegant event branding overlay to this image. Add "${event.title}" text with sophisticated typography and subtle gold accent elements. Keep the main image visible but add premium branding elements.`;
        
        const result = await InvokeLLM({
          prompt: prompt,
          file_urls: [media.media_url],
          response_json_schema: {
            type: "object",
            properties: {
              filtered_image_url: { type: "string" }
            }
          }
        });

        if (result.filtered_image_url) {
          await Media.update(media.id, {
            filtered_url: result.filtered_image_url
          });
        }
      }
      
      loadData();
    } catch (error) {
      console.error("Error applying branding:", error);
      alert("Failed to apply branding filter");
    }
    
    setIsProcessing(prev => ({ ...prev, [media.id]: false }));
  };

  const handleModeration = async (mediaId, status) => {
    try {
      await Media.update(mediaId, {
        status,
        moderator_notes: moderatorNotes
      });
      setModeratorNotes("");
      loadData();
    } catch (error) {
      console.error("Error updating media status:", error);
    }
  };

  const filteredMedia = mediaItems.filter(media => {
    if (activeTab === "all") return true;
    return media.status === activeTab;
  });

  const stats = {
    pending: mediaItems.filter(m => m.status === "pending").length,
    approved: mediaItems.filter(m => m.status === "approved").length,
    rejected: mediaItems.filter(m => m.status === "rejected").length
  };

  if (isLoading) {
    return <div className="p-8">Loading media moderation...</div>;
  }

  if (!event) {
    return <div className="p-8">Event not found.</div>;
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Media Moderation</h1>
          <p className="text-slate-600">Review and manage uploaded media for {event.title}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-sm text-slate-600">Pending Review</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <p className="text-sm text-slate-600">Approved</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <p className="text-sm text-slate-600">Rejected</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
            <TabsTrigger value="all">All Media</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMedia.map((media) => (
                <Card key={media.id} className="border-0 shadow-lg">
                  <CardContent className="p-0">
                    <div className="relative">
                      {media.media_type === 'image' ? (
                        <img
                          src={media.filtered_url || media.media_url}
                          alt="Uploaded content"
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                      ) : (
                        <video
                          src={media.media_url}
                          className="w-full h-48 object-cover rounded-t-lg"
                          controls
                        />
                      )}
                      
                      <div className="absolute top-2 left-2">
                        <Badge className={
                          media.status === 'approved' ? 'bg-green-600' :
                          media.status === 'rejected' ? 'bg-red-600' :
                          'bg-yellow-600'
                        }>
                          {media.status}
                        </Badge>
                      </div>
                      
                      <div className="absolute top-2 right-2">
                        {media.media_type === 'image' ? 
                          <ImageIcon className="w-5 h-5 text-white bg-black/50 rounded p-1" /> :
                          <Video className="w-5 h-5 text-white bg-black/50 rounded p-1" />
                        }
                      </div>
                    </div>
                    
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <User className="w-4 h-4" />
                        {media.uploader_name}
                      </div>
                      
                      {media.caption && (
                        <p className="text-sm text-slate-700">{media.caption}</p>
                      )}
                      
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        {new Date(media.created_date).toLocaleString()}
                      </div>

                      {media.status === 'pending' && (
                        <div className="space-y-3 pt-3">
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleModeration(media.id, 'approved')}
                              size="sm"
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleModeration(media.id, 'rejected')}
                              size="sm"
                              variant="destructive"
                              className="flex-1"
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                          
                          {media.media_type === 'image' && (
                            <Button
                              onClick={() => applyBrandingFilter(media)}
                              disabled={isProcessing[media.id]}
                              size="sm"
                              variant="outline"
                              className="w-full"
                            >
                              {isProcessing[media.id] ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-600 border-t-transparent mr-2"></div>
                              ) : (
                                <Filter className="w-4 h-4 mr-2" />
                              )}
                              Apply Branding
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredMedia.length === 0 && (
              <div className="text-center py-12">
                <ImageIcon className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">
                  No {activeTab} media found
                </h3>
                <p className="text-slate-500">
                  {activeTab === 'pending' ? 'No media awaiting moderation.' : 'No media in this category.'}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {activeTab === 'pending' && filteredMedia.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Moderator Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="notes">Add notes for rejected content (optional)</Label>
              <Textarea
                id="notes"
                value={moderatorNotes}
                onChange={(e) => setModeratorNotes(e.target.value)}
                placeholder="Reason for rejection or additional comments..."
                className="mt-2"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}