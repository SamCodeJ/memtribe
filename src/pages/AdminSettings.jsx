
import React, { useState, useEffect, useCallback } from "react";
import { User, Event, RSVP, Media, SystemSettings } from "@/api/index";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Crown,
  Users,
  Calendar,
  Image as ImageIcon,
  DollarSign,
  Settings,
  BarChart3,
  Shield,
  Mail,
  Check,
  X,
} from "lucide-react";

export default function AdminSettings() {
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [allRSVPs, setAllRSVPs] = useState([]);
  const [allMedia, setAllMedia] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMediaTab, setActiveMediaTab] = useState("pending");
  const [settingsId, setSettingsId] = useState(null);
  const [systemSettings, setSystemSettings] = useState({
    platform_name: "MemTribe",
    free_plan_events: 2,
    pro_plan_price: 29,
    business_plan_price: 79,
    enterprise_plan_price: 199,
    auto_approve_media: false
  });

  const loadAdminData = useCallback(async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
      
      if (user.role !== 'admin') {
        return;
      }

      const [users, events, rsvps, media, settings] = await Promise.all([
        User.list(),
        Event.list("-created_date"),
        RSVP.list(),
        Media.list("-created_date"),
        SystemSettings.list()
      ]);

      setAllUsers(users);
      setAllEvents(events);
      setAllRSVPs(rsvps);
      setAllMedia(media);

      if (settings.length > 0) {
        const settingsData = settings[0];
        setSystemSettings({
          platform_name: settingsData.platform_name || "MemTribe",
          free_plan_events: settingsData.free_plan_events || 2,
          pro_plan_price: settingsData.pro_plan_price || 29,
          business_plan_price: settingsData.business_plan_price || 79,
          enterprise_plan_price: settingsData.enterprise_plan_price || 199,
          auto_approve_media: settingsData.auto_approve_media || false
        });
        setSettingsId(settingsData.id);
      } else {
        // Create initial settings if none exist, using the default state values
        const newSettings = await SystemSettings.create({
          platform_name: "MemTribe",
          free_plan_events: 2,
          pro_plan_price: 29,
          business_plan_price: 79,
          enterprise_plan_price: 199,
          auto_approve_media: false
        });
        setSystemSettings({
          platform_name: newSettings.platform_name || "MemTribe",
          free_plan_events: newSettings.free_plan_events || 2,
          pro_plan_price: newSettings.pro_plan_price || 29,
          business_plan_price: newSettings.business_plan_price || 79,
          enterprise_plan_price: newSettings.enterprise_plan_price || 199,
          auto_approve_media: newSettings.auto_approve_media || false
        });
        setSettingsId(newSettings.id);
      }
    } catch (error) {
      console.error("Error loading admin data:", error);
    }
    setIsLoading(false);
  }, []); // Empty dependency array as it doesn't depend on any changing props or state inside this hook's scope

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]); // Now `loadAdminData` is a stable function thanks to useCallback

  const updateUserRole = async (userId, newRole) => {
    try {
      await User.update(userId, { role: newRole });
      loadAdminData(); // Refresh data
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("Failed to update user role");
    }
  };

  const handleMediaModeration = async (mediaId, newStatus) => {
    try {
      await Media.update(mediaId, { moderation_status: newStatus });
      loadAdminData(); // Refresh data to reflect the change
    } catch (error) {
      console.error("Error updating media status:", error);
      alert("Failed to update media status.");
    }
  };

  const handleSettingsSave = async () => {
    if (!settingsId) {
      console.error("No settings ID found");
      alert("Settings ID not found. Please refresh the page.");
      return;
    }
    try {
      console.log("Saving settings:", { id: settingsId, data: systemSettings });
      const result = await SystemSettings.update(settingsId, systemSettings);
      console.log("Settings saved successfully:", result);
      alert("System settings saved!");
    } catch (error) {
      console.error("Error saving settings:", error);
      console.error("Settings ID:", settingsId);
      console.error("Settings data:", systemSettings);
      alert(`Failed to save settings: ${error.message || error}`);
    }
  };

  const stats = {
    totalUsers: allUsers.length,
    totalEvents: allEvents.length,
    totalRSVPs: allRSVPs.length,
    totalMedia: allMedia.length,
    pendingMedia: allMedia.filter(m => m.moderation_status === 'pending').length,
    activeEvents: allEvents.filter(e => e.status === 'published').length
  };

  const filteredMediaForAdmin = allMedia.filter(media => {
    if (activeMediaTab === "all") return true;
    return media.moderation_status === activeMediaTab;
  });

  if (isLoading) {
    return <div className="p-8">Loading admin panel...</div>;
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="p-8 text-center">
        <Shield className="w-16 h-16 mx-auto text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
        <p className="text-slate-600">You need Super Admin privileges to access this page.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Crown className="w-8 h-8 text-amber-600" />
            Super Admin Panel
          </h1>
          <p className="text-slate-600">System overview and global settings management</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="p-4">
              <Users className="w-8 h-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-slate-900">{stats.totalUsers}</div>
              <p className="text-sm text-slate-600">Total Users</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <Calendar className="w-8 h-8 mx-auto text-green-600 mb-2" />
              <div className="text-2xl font-bold text-slate-900">{stats.totalEvents}</div>
              <p className="text-sm text-slate-600">Total Events</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <Calendar className="w-8 h-8 mx-auto text-amber-600 mb-2" />
              <div className="text-2xl font-bold text-slate-900">{stats.activeEvents}</div>
              <p className="text-sm text-slate-600">Active Events</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <Users className="w-8 h-8 mx-auto text-purple-600 mb-2" />
              <div className="text-2xl font-bold text-slate-900">{stats.totalRSVPs}</div>
              <p className="text-sm text-slate-600">Total RSVPs</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <ImageIcon className="w-8 h-8 mx-auto text-pink-600 mb-2" />
              <div className="text-2xl font-bold text-slate-900">{stats.totalMedia}</div>
              <p className="text-sm text-slate-600">Media Files</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <ImageIcon className="w-8 h-8 mx-auto text-red-600 mb-2" />
              <div className="text-2xl font-bold text-slate-900">{stats.pendingMedia}</div>
              <p className="text-sm text-slate-600">Pending Review</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="events">Event Overview</TabsTrigger>
            <TabsTrigger value="media">Media Management</TabsTrigger>
            <TabsTrigger value="settings">System Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {user.full_name?.[0]?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{user.full_name}</p>
                          <p className="text-sm text-slate-600">{user.email}</p>
                          <p className="text-xs text-slate-500">{user.company_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}>
                          {user.role === 'admin' ? 'Super Admin' : 'Event Organizer'}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateUserRole(user.id, user.role === 'admin' ? 'user' : 'admin')}
                        >
                          {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>All Events Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allEvents.map((event) => {
                    const eventRSVPs = allRSVPs.filter(r => r.event_id === event.id);
                    const organizer = allUsers.find(u => u.id === event.organizer_id);
                    
                    return (
                      <div key={event.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-slate-900">{event.title}</h3>
                            <p className="text-sm text-slate-600">by {organizer?.full_name || 'Unknown'}</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={
                              event.status === 'published' ? 'bg-green-100 text-green-800' :
                              event.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-slate-100 text-slate-800'
                            }>
                              {event.status}
                            </Badge>
                            <Badge variant="outline">
                              {event.event_type.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-slate-500">Date</p>
                            <p className="font-medium">{new Date(event.start_date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Location</p>
                            <p className="font-medium">{event.location}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">RSVPs</p>
                            <p className="font-medium">{eventRSVPs.length} guests</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media">
            <Card>
              <CardHeader>
                <CardTitle>Global Media Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeMediaTab} onValueChange={setActiveMediaTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4 mb-4">
                    <TabsTrigger value="pending">Pending ({allMedia.filter(m => m.moderation_status === 'pending').length})</TabsTrigger>
                    <TabsTrigger value="approved">Approved ({allMedia.filter(m => m.moderation_status === 'approved').length})</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected ({allMedia.filter(m => m.moderation_status === 'rejected').length})</TabsTrigger>
                    <TabsTrigger value="all">All ({allMedia.length})</TabsTrigger>
                  </TabsList>
                  
                  <div className="space-y-3">
                    {filteredMediaForAdmin.map((media) => {
                      const event = allEvents.find(e => e.id === media.event_id);
                      return (
                        <div key={media.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden">
                              {media.file_type === 'image' ? (
                                <img src={media.file_url} alt="Media" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageIcon className="w-6 h-6 text-slate-400" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{media.uploaded_by || 'Anonymous'}</p>
                              <p className="text-sm text-slate-600">{event?.title || 'Unknown Event'}</p>
                              <p className="text-xs text-slate-500">{new Date(media.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {media.moderation_status === 'pending' ? (
                              <>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleMediaModeration(media.id, 'approved')}>
                                  <Check className="w-4 h-4 mr-1" /> Approve
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleMediaModeration(media.id, 'rejected')}>
                                  <X className="w-4 h-4 mr-1" /> Decline
                                </Button>
                              </>
                            ) : (
                              <Badge className={
                                media.moderation_status === 'approved' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }>
                                {media.moderation_status}
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                     {filteredMediaForAdmin.length === 0 && (
                      <div className="text-center py-10">
                        <p className="text-slate-500">No media in this category.</p>
                      </div>
                    )}
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Platform Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Platform Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="platform_name">Platform Name</Label>
                    <Input
                      id="platform_name"
                      value={systemSettings.platform_name || ''}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, platform_name: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-approve Media</Label>
                      <p className="text-sm text-slate-600">Automatically approve uploaded media</p>
                    </div>
                    <Switch
                      checked={systemSettings.auto_approve_media || false}
                      onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, auto_approve_media: checked }))}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Pricing Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Pricing Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  <div>
                    <Label htmlFor="free_events">Starter Plan - Max Events</Label>
                    <Input
                      id="free_events"
                      type="number"
                      value={systemSettings.free_plan_events || 0}
                      onChange={(e) => setSystemSettings(prev => ({ ...prev, free_plan_events: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="pro_price">Pro Plan Price (Monthly)</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">$</span>
                      <Input
                        id="pro_price"
                        type="number"
                        value={systemSettings.pro_plan_price || 0}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, pro_plan_price: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="business_price">Business Plan Price (Monthly)</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">$</span>
                      <Input
                        id="business_price"
                        type="number"
                        value={systemSettings.business_plan_price || 0}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, business_plan_price: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="enterprise_price">Enterprise Plan Price (Monthly)</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">$</span>
                      <Input
                        id="enterprise_price"
                        type="number"
                        value={systemSettings.enterprise_plan_price || 0}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, enterprise_plan_price: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>

                  <Button onClick={handleSettingsSave} className="w-full bg-green-600 hover:bg-green-700">
                    <Settings className="w-4 h-4 mr-2" />
                    Save Pricing Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
