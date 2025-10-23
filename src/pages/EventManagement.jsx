
import React, { useState, useEffect } from "react";
import { Event, RSVP } from "@/api/index";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  QrCode,
  Users,
  CheckCircle,
  Copy,
  ArrowLeft,
  Mail,
  UserCheck,
  Search,
  Upload,
  Play,
  ImageIcon as ImageIconLucide,
  BookOpen
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function EventManagement() {
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [rsvps, setRsvps] = useState([]);
  const [filteredRsvps, setFilteredRsvps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadEventData();
  }, []);

  useEffect(() => {
    const results = rsvps.filter(rsvp =>
      rsvp.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rsvp.guest_email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRsvps(results);
  }, [searchTerm, rsvps]);

  const loadEventData = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const eventId = urlParams.get('id');
      if (!eventId) {
        setIsLoading(false);
        return;
      }

      const allEvents = await Event.list();
      const foundEvent = allEvents.find(e => e.id === eventId);
      setEvent(foundEvent);

      const allRsvps = await RSVP.filter({ event_id: eventId }, "-created_date");
      setRsvps(allRsvps);
      setFilteredRsvps(allRsvps);
    } catch (error) {
      console.error("Error loading event data:", error);
    }
    setIsLoading(false);
  };

  const handleCheckIn = async (rsvp) => {
    if (rsvp.checked_in) return;
    try {
      await RSVP.update(rsvp.id, {
        checked_in: true,
        check_in_time: new Date().toISOString()
      });
      loadEventData(); // Refresh data
    } catch (error) {
      console.error("Failed to check in guest:", error);
    }
  };

  const copyQrCodeLink = () => {
    navigator.clipboard.writeText(event.qr_code);
    alert("QR code image link copied!");
  };

  const copyMediaUploadLink = () => {
    const mediaUrl = `${window.location.origin}${createPageUrl("MediaUpload")}?event=${event.id}`;
    navigator.clipboard.writeText(mediaUrl);
    alert("Media upload link copied!");
  };

  const copySlideshowLink = () => {
    const slideshowUrl = `${window.location.origin}${createPageUrl("EventSlideshow")}?event=${event.id}`;
    navigator.clipboard.writeText(slideshowUrl);
    alert("Slideshow link copied!");
  };

  if (isLoading) {
    return <div className="p-8">Loading event dashboard...</div>;
  }

  if (!event) {
    return <div className="p-8">Event not found.</div>;
  }

  const stats = {
    total: rsvps.length,
    attending: rsvps.filter(r => r.status === 'attending').length,
    checkedIn: rsvps.filter(r => r.checked_in).length,
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Button variant="outline" size="sm" onClick={() => navigate(createPageUrl("MyEvents"))}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to All Events
          </Button>
          <h1 className="text-3xl font-bold text-slate-900 mt-4">{event.title}</h1>
          <p className="text-slate-600">Event Management Dashboard</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content: Guest List */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <CardTitle className="text-xl font-bold">Guest List</CardTitle>
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      placeholder="Search guests..." 
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Guest</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Check-in</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRsvps.length > 0 ? filteredRsvps.map(rsvp => (
                      <TableRow key={rsvp.id}>
                        <TableCell>
                          <div className="font-medium">{rsvp.guest_name}</div>
                          <div className="text-sm text-slate-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {rsvp.guest_email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={rsvp.status === 'attending' ? 'default' : 'secondary'}
                                 className={rsvp.status === 'attending' ? 'bg-green-100 text-green-800' : ''}>
                            {rsvp.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {rsvp.checked_in ? (
                            <div className="flex items-center justify-center text-green-600 gap-2">
                              <CheckCircle className="w-5 h-5" />
                              Checked-in
                            </div>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => handleCheckIn(rsvp)}>
                              <UserCheck className="w-4 h-4 mr-2" />
                              Check In
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan="3" className="text-center h-24">No guests found.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar: Enhanced with Media Management */}
          <div className="space-y-6">
            {/* QR Code Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <QrCode className="text-amber-600" />
                  Event QR Code
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-slate-600 mb-4">Guests can scan this to view the event page and RSVP.</p>
                {event.qr_code ? (
                  <div className="flex justify-center p-4 bg-slate-50 rounded-lg">
                    <img src={event.qr_code} alt="Event QR Code" className="w-48 h-48" />
                  </div>
                ) : (
                  <p>QR Code not available.</p>
                )}
                <Button variant="outline" size="sm" onClick={copyQrCodeLink} className="mt-4 w-full">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy QR Code Link
                </Button>
              </CardContent>
            </Card>

            {/* Media Management Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <ImageIconLucide className="text-purple-600" />
                  Media Hub
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={copyMediaUploadLink}
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Copy Upload Link
                </Button>
                
                <Link to={createPageUrl(`EventSlideshow?event=${event.id}`)}>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Play className="w-4 h-4 mr-2" />
                    View Slideshow
                  </Button>
                </Link>
                
                <Link to={createPageUrl(`MediaModeration?event=${event.id}`)}>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <ImageIconLucide className="w-4 h-4 mr-2" />
                    Moderate Media
                  </Button>
                </Link>
                
                <Link to={createPageUrl(`PhotobookCreator?event=${event.id}`)}>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Create Photobook
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Users className="text-amber-600" />
                  At a Glance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center text-lg">
                  <span className="text-slate-600">Total RSVPs:</span>
                  <span className="font-bold text-slate-900">{stats.total}</span>
                </div>
                <div className="flex justify-between items-center text-lg">
                  <span className="text-slate-600">Attending:</span>
                  <span className="font-bold text-green-600">{stats.attending}</span>
                </div>
                <div className="flex justify-between items-center text-lg">
                  <span className="text-slate-600">Checked In:</span>
                  <span className="font-bold text-blue-600">{stats.checkedIn}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
