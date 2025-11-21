

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/index";
import {
  Calendar,
  Users,
  Settings,
  PlusCircle,
  BarChart3,
  Crown,
  Menu,
  X,
  LogOut,
  Image as ImageIcon,
  Camera,
  DollarSign,
  FileText,
  UserCog,
  TrendingUp,
  UserCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      // Check if token exists before calling User.me()
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.log("User not authenticated");
      // Clear invalid token
      localStorage.removeItem('auth_token');
    }
    setIsLoading(false);
  };

  const handleLogout = async () => {
    await User.logout();
    setCurrentUser(null);
    navigate(createPageUrl("Landing"));
  };

  const navigationItems = [
    {
      title: "Analytics",
      url: createPageUrl("Dashboard"),
      icon: BarChart3,
      roles: ["admin", "user"]
    },
    {
      title: "My Events",
      url: createPageUrl("MyEvents"),
      icon: Calendar,
      roles: ["admin", "user"]
    },
    {
      title: "Create Event",
      url: createPageUrl("CreateEvent"),
      icon: PlusCircle,
      roles: ["admin", "user"]
    },
    {
      title: "Super Admin Panel", // Changed from "Admin Panel"
      url: createPageUrl("AdminSettings"),
      icon: Crown,
      roles: ["admin"]
    },
    {
      title: "Pricing Management",
      url: createPageUrl("PricingManagement"),
      icon: DollarSign,
      roles: ["admin"]
    },
    {
      title: "User Subscriptions",
      url: createPageUrl("UserSubscriptions"),
      icon: UserCog,
      roles: ["admin"]
    },
    {
      title: "System Logs",
      url: createPageUrl("SystemLogs"),
      icon: FileText,
      roles: ["admin"]
    },
    {
      title: "Finance Management",
      url: createPageUrl("FinanceManagement"),
      icon: TrendingUp,
      roles: ["admin"]
    }
  ];

  const mediaMenuItems = [
    {
      title: "Media Hub",
      url: createPageUrl("MediaHub"),
      icon: ImageIcon,
      description: "Manage all event media"
    },
  ];

  const accountMenuItems = [
    {
      title: "My Profile",
      url: createPageUrl("Profile"),
      icon: UserCircle,
      description: "Update your profile"
    },
    {
      title: "Subscription",
      url: createPageUrl("Subscription"),
      icon: DollarSign,
      description: "Manage your plan"
    }
  ];

  const filteredNavItems = navigationItems.filter(item =>
    !currentUser || item.roles.includes(currentUser.role)
  );

  const getRoleDisplayName = (role) => {
    switch(role) {
      case 'admin': return 'Super Admin';
      case 'user': return 'Event Organizer';
      default: return 'User';
    }
  };

  // Define public pages that don't require authentication
  const publicPages = ["Landing", "EventView", "Login", "Signup", "MediaUpload", "EventSlideshow", "login", "signup"];
  const isPublicPage = publicPages.includes(currentPageName);
  
  // Debug logging for development (can be removed in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('Layout - Current Page:', currentPageName, 'Is Public:', isPublicPage, 'Has User:', !!currentUser);
  }

  // Show loading state only for pages that require authentication
  if (isLoading && !isPublicPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-600 border-t-transparent"></div>
      </div>
    );
  }

  // Show access restricted page only for protected pages when user is not authenticated
  if (!currentUser && !isPublicPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <img src="/logo.png" alt="MemTribe Logo" className="w-16 h-16 object-contain mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
          <p className="text-gray-600 mb-6">Please log in to access MemTribe's event management features</p>
          <div className="flex flex-col gap-3">
            <Button onClick={() => navigate(createPageUrl("Login"))} className="bg-amber-600 hover:bg-amber-700">
              Sign In
            </Button>
            <Button 
              onClick={() => navigate(createPageUrl("Signup"))}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create Account
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate(createPageUrl("Landing"))}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Render public pages without sidebar layout
  if (!currentUser || isPublicPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {children}
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-slate-50">
        <Sidebar className="border-r border-slate-200 bg-white">
          <SidebarHeader className="border-b border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="MemTribe Logo" className="w-10 h-10 object-contain" />
              <div>
                <h2 className="font-bold text-xl text-slate-900">MemTribe</h2>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Event Management</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 py-2">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredNavItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`hover:bg-amber-50 hover:text-amber-900 transition-all duration-200 rounded-lg mb-1 ${
                          location.pathname === item.url ? 'bg-amber-50 text-amber-900 border-l-2 border-amber-600' : ''
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-3 py-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-8">
              <SidebarGroupLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 py-2">
                Media Management
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {mediaMenuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`hover:bg-purple-50 hover:text-purple-900 transition-all duration-200 rounded-lg mb-1 ${
                          location.pathname === item.url ? 'bg-purple-50 text-purple-900 border-l-2 border-purple-600' : ''
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-3 py-3">
                          <item.icon className="w-5 h-5" />
                          <div className="flex-1">
                            <span className="font-medium block">{item.title}</span>
                            <span className="text-xs text-slate-500">{item.description}</span>
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-8">
              <SidebarGroupLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 py-2">
                Account & Billing
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {accountMenuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`hover:bg-green-50 hover:text-green-900 transition-all duration-200 rounded-lg mb-1 ${
                          location.pathname === item.url ? 'bg-green-50 text-green-900 border-l-2 border-green-600' : ''
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-3 py-3">
                          <item.icon className="w-5 h-5" />
                          <div className="flex-1">
                            <span className="font-medium block">{item.title}</span>
                            <span className="text-xs text-slate-500">{item.description}</span>
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-8">
              <SidebarGroupLabel className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 py-2">
                Account
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-3 py-2 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {currentUser.full_name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 text-sm truncate">
                        {currentUser.full_name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {getRoleDisplayName(currentUser.role)}
                      </p>
                    </div>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200 p-4">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white border-b border-slate-200 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200" />
              <img src="/logo.png" alt="MemTribe Logo" className="w-8 h-8 object-contain" />
              <h1 className="text-xl font-bold text-slate-900">MemTribe</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 to-slate-100">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

