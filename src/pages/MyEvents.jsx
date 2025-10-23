
import React, { useState, useEffect } from "react";
import { Event, RSVP, User } from "@/api/index";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Calendar,
  MapPin,
  Users,
  Eye,
  Edit,
  Share,
  Settings, // Added Settings import
  PlusCircle,
  Clock
} from "lucide-react";

export default function MyEvents() {
  const [events, setEvents] = useState([]);
  const [rsvps, setRSVPs] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
      
      let userEvents = [];
      if (user.role === 'admin') {
        userEvents = await Event.list("-created_date");
      } else {
        userEvents = await Event.filter({ organizer_id: user.id }, "-created_date");
      }
      setEvents(userEvents);

      if (userEvents.length > 0) {
        const eventIds = userEvents.map(e => e.id);
        const allRSVPs = await RSVP.list();
        const filteredRSVPs = allRSVPs.filter(rsvp => eventIds.includes(rsvp.event_id));
        setRSVPs(filteredRSVPs);
      }
    } catch (error) {
      console.error("Error loading events:", error);
    }
    setIsLoading(false);
  };

  const copyEventLink = (eventId) => {
    const eventUrl = `${window.location.origin}${createPageUrl("EventView")}?id=${eventId}`;
    navigator.clipboard.writeText(eventUrl);
    // You could add a toast notification here
  };

  const getEventStats = (eventId) => {
    const eventRSVPs = rsvps.filter(r => r.event_id === eventId);
    return {
      attending: eventRSVPs.filter(r => r.status === 'attending').length,
      maybe: eventRSVPs.filter(r => r.status === 'maybe').length,
      notAttending: eventRSVPs.filter(r => r.status === 'not_attending').length,
      total: eventRSVPs.length
    };
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-80 bg-slate-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">My Events</h1>
            <p className="text-slate-600">
              Manage and track your event portfolio
            </p>
          </div>
          <Link to={createPageUrl("CreateEvent")}>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white">
              <PlusCircle className="w-5 h-5 mr-2" />
              Create New Event
            </Button>
          </Link>
        </div>

        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => {
              const stats = getEventStats(event.id);
              
              return (
                <Card key={event.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col">
                  <CardHeader className="p-0">
                    <div className="relative">
                      {event.event_image ? (
                        <img 
                          src={event.event_image} 
                          alt={event.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-amber-100 to-amber-200 rounded-t-lg flex items-center justify-center">
                          <Calendar className="w-16 h-16 text-amber-600" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                        <Badge 
                          className={`${
                            event.status === 'published' ? 'bg-green-600' :
                            event.status === 'draft' ? 'bg-yellow-600' :
                            event.status === 'ongoing' ? 'bg-blue-600' :
                            'bg-slate-600'
                          } text-white`}
                        >
                          {event.status}
                        </Badge>
                      </div>
                      <div className="absolute top-4 right-4">
                        <Badge 
                          variant="secondary"
                          className={`${
                            event.event_type === 'public' ? 'bg-blue-100 text-blue-800' :
                            event.event_type === 'private' ? 'bg-purple-100 text-purple-800' :
                            'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {event.event_type.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 flex-grow flex flex-col">
                    <div className="space-y-4 flex-grow">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{event.title}</h3>
                        <p className="text-slate-600 text-sm line-clamp-2">{event.description || "No description provided."}</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-slate-600">
                          <Calendar className="w-4 h-4 mr-2 text-amber-600 shrink-0" />
                          <span>{new Date(event.start_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <MapPin className="w-4 h-4 mr-2 text-amber-600 shrink-0" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <Users className="w-4 h-4 mr-2 text-amber-600 shrink-0" />
                          <span>{stats.attending} attending • {stats.total} total RSVPs</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-6">
                      <Link to={createPageUrl(`EventManagement?id=${event.id}`)} className="flex-1">
                        <Button size="sm" variant="outline" className="w-full flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          Manage
                        </Button>
                      </Link>
                      <Link to={createPageUrl(`EditEvent?id=${event.id}`)} className="flex-1">
                        <Button size="sm" className="w-full bg-amber-600 hover:bg-amber-700">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <Calendar className="w-20 h-20 mx-auto text-slate-300 mb-6" />
              <h3 className="text-2xl font-bold text-slate-600 mb-4">No Events Yet</h3>
              <p className="text-slate-500 mb-8 max-w-md mx-auto">
                Start creating memorable experiences by setting up your first event. 
                It only takes a few minutes to get started.
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
