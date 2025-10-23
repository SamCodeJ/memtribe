import React, { useState, useEffect } from "react";
import { Event, User } from "@/api/index";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Image as ImageIcon,
  Play,
  BookOpen,
  Copy,
  Upload,
  Calendar,
  PlusCircle
} from "lucide-react";

export default function MediaHub() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const user = await User.me();
      let userEvents = [];
      if (user.role === 'admin') {
        userEvents = await Event.list("-created_date");
      } else {
        userEvents = await Event.filter({ organizer_id: user.id }, "-created_date");
      }
      setEvents(userEvents);
    } catch (error) {
      console.error("Error loading events:", error);
    }
    setIsLoading(false);
  };

  const copyLink = (path, eventId) => {
    const url = `${window.location.origin}${createPageUrl(path)}?event=${eventId}`;
    navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-64"></div>
          <div className="h-40 bg-slate-200 rounded-lg"></div>
          <div className="h-40 bg-slate-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Media Hub</h1>
          <p className="text-slate-600">Select an event to manage its media content.</p>
        </div>

        {events.length > 0 ? (
          <div className="space-y-6">
            {events.map((event) => (
              <Card key={event.id} className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>{event.title}</CardTitle>
                  <p className="text-sm text-slate-500">{new Date(event.start_date).toLocaleDateString()}</p>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <Link to={createPageUrl(`MediaModeration?event=${event.id}`)}>
                    <Button variant="outline" className="w-full justify-start text-left h-full">
                      <ImageIcon className="w-5 h-5 mr-3 text-blue-600" />
                      <div>
                        <p className="font-semibold">Moderate Media</p>
                        <p className="text-xs text-slate-500 font-normal">Approve or reject content</p>
                      </div>
                    </Button>
                  </Link>
                  <Link to={createPageUrl(`EventSlideshow?event=${event.id}`)}>
                    <Button variant="outline" className="w-full justify-start text-left h-full">
                      <Play className="w-5 h-5 mr-3 text-green-600" />
                      <div>
                        <p className="font-semibold">View Slideshow</p>
                        <p className="text-xs text-slate-500 font-normal">Launch live display</p>
                      </div>
                    </Button>
                  </Link>
                   <Link to={createPageUrl(`PhotobookCreator?event=${event.id}`)}>
                    <Button variant="outline" className="w-full justify-start text-left h-full">
                      <BookOpen className="w-5 h-5 mr-3 text-purple-600" />
                      <div>
                        <p className="font-semibold">Create Photobook</p>
                        <p className="text-xs text-slate-500 font-normal">Generate a keepsake book</p>
                      </div>
                    </Button>
                  </Link>
                  <Button onClick={() => copyLink("MediaUpload", event.id)} variant="outline" className="w-full justify-start text-left h-full">
                    <Copy className="w-5 h-5 mr-3 text-amber-600" />
                    <div>
                      <p className="font-semibold">Copy Upload Link</p>
                      <p className="text-xs text-slate-500 font-normal">Share with guests</p>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <Calendar className="w-20 h-20 mx-auto text-slate-300 mb-6" />
              <h3 className="text-2xl font-bold text-slate-600 mb-4">No Events Found</h3>
              <p className="text-slate-500 mb-8 max-w-md mx-auto">
                You need to create an event before you can manage its media.
              </p>
              <Link to={createPageUrl("CreateEvent")}>
                <Button size="lg" className="bg-amber-600 hover:bg-amber-700">
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Create Your First Event
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}