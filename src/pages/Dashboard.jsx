
import React, { useState, useEffect } from "react";
import { Event, RSVP, Media, User } from "@/api/index";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import StatCard from "@/components/analytics/StatCard";
import RsvpChart from "@/components/analytics/RsvpChart";
import { getPlanDetails } from "@/components/utils/plans";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Users,
  TrendingUp,
  PlusCircle,
  Eye,
  ImageIcon,
  Star
} from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalAttendees: 0,
    totalMedia: 0,
    checkInRate: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [eventCountThisMonth, setEventCountThisMonth] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
      
      const plan = await getPlanDetails(user);
      setCurrentPlan(plan);
      
      const eventsQuery = user.role === 'admin'
        ? Event.list("-created_date")
        : Event.filter({ organizer_id: user.id }, "-created_date");

      const events = await eventsQuery;

      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const monthlyEvents = events.filter(e => new Date(e.created_date) > oneMonthAgo);
      setEventCountThisMonth(monthlyEvents.length);

      const eventIds = events.map(e => e.id);
      
      const [rsvps, mediaItems] = await Promise.all([
        eventIds.length ? RSVP.filter({ event_id: { $in: eventIds } }) : [],
        eventIds.length ? Media.filter({ event_id: { $in: eventIds } }) : []
      ]);

      const totalAttendees = rsvps.filter(r => r.status === 'attending').length;
      const totalCheckedIn = rsvps.filter(r => r.checked_in).length;

      setStats({
        totalEvents: events.length,
        totalAttendees: totalAttendees,
        totalMedia: mediaItems.length,
        checkInRate: totalAttendees > 0 ? Math.round((totalCheckedIn / totalAttendees) * 100) : 0,
      });

      const rsvpChartData = events.slice(0, 5).map(event => {
        const eventRsvps = rsvps.filter(r => r.event_id === event.id);
        return {
          name: event.title.substring(0, 15) + (event.title.length > 15 ? '...' : ''),
          attending: eventRsvps.filter(r => r.status === 'attending').length,
          maybe: eventRsvps.filter(r => r.status === 'maybe').length,
        };
      });
      setChartData(rsvpChartData);

    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-80 bg-slate-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-slate-600">
              Welcome back, {currentUser?.full_name}. Here's your performance overview.
            </p>
          </div>
          <Link to={createPageUrl("CreateEvent")}>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white">
              <PlusCircle className="w-5 h-5 mr-2" />
              Create Event
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Events" value={stats.totalEvents} icon={Calendar} color="blue" />
          <StatCard title="Total Attendees" value={stats.totalAttendees} icon={Users} color="green" />
          <StatCard title="Check-in Rate" value={`${stats.checkInRate}%`} icon={TrendingUp} color="purple" />
          <StatCard title="Total Media Files" value={stats.totalMedia} icon={ImageIcon} color="pink" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Events */}
          <Card className="border-0 shadow-lg lg:col-span-2">
            <CardHeader className="border-b border-slate-200 pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold text-slate-900">Recent Event RSVPs</CardTitle>
                <Link to={createPageUrl("MyEvents")}>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View All Events
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {chartData.length > 0 ? (
                <RsvpChart data={chartData} />
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-600 mb-2">No events to analyze</h3>
                  <p className="text-slate-500 mb-4">Create your first event to see analytics.</p>
                </div>
              )}
            </CardContent>
          </Card>
          
           {/* Subscription Status Card */}
          {currentPlan && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Star className="w-5 h-5 text-amber-500" />
                  Your Plan: {currentPlan.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Events This Month</span>
                    <span>{eventCountThisMonth} / {currentPlan.events_per_month === Infinity ? '∞' : currentPlan.events_per_month}</span>
                  </div>
                  <Progress value={(eventCountThisMonth / (currentPlan.events_per_month === Infinity ? eventCountThisMonth + 1 : currentPlan.events_per_month)) * 100} />
                </div>
                 <Link to={createPageUrl("Subscription")} className="w-full">
                  <Button variant="outline" className="w-full">Manage Subscription</Button>
                </Link>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
