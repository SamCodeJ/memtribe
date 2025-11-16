import Layout from "./Layout.jsx";

import Landing from "./Landing";

import Dashboard from "./Dashboard";

import CreateEvent from "./CreateEvent";

import MyEvents from "./MyEvents";

import EventView from "./EventView";

import EditEvent from "./EditEvent";

import EventManagement from "./EventManagement";

import MediaUpload from "./MediaUpload";

import MediaModeration from "./MediaModeration";

import EventSlideshow from "./EventSlideshow";

import PhotobookCreator from "./PhotobookCreator";

import AdminSettings from "./AdminSettings";

import MediaHub from "./MediaHub";

import Subscription from "./Subscription";

import PricingManagement from "./PricingManagement";

import SystemLogs from "./SystemLogs";

import UserSubscriptions from "./UserSubscriptions";

import FinanceManagement from "./FinanceManagement";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

import Login from "./Login";

import Signup from "./Signup";

const PAGES = {
    
    Landing: Landing,
    
    Dashboard: Dashboard,
    
    CreateEvent: CreateEvent,
    
    MyEvents: MyEvents,
    
    EventView: EventView,
    
    EditEvent: EditEvent,
    
    EventManagement: EventManagement,
    
    MediaUpload: MediaUpload,
    
    MediaModeration: MediaModeration,
    
    EventSlideshow: EventSlideshow,
    
    PhotobookCreator: PhotobookCreator,
    
    AdminSettings: AdminSettings,
    
    MediaHub: MediaHub,
    
    Subscription: Subscription,
    
    PricingManagement: PricingManagement,
    
    SystemLogs: SystemLogs,
    
    UserSubscriptions: UserSubscriptions,
    
    FinanceManagement: FinanceManagement,
    
    Login: Login,
    
    Signup: Signup,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Landing />} />
                
                
                <Route path="/Landing" element={<Landing />} />
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/CreateEvent" element={<CreateEvent />} />
                
                <Route path="/MyEvents" element={<MyEvents />} />
                
                <Route path="/EventView" element={<EventView />} />
                
                <Route path="/EditEvent" element={<EditEvent />} />
                
                <Route path="/EventManagement" element={<EventManagement />} />
                
                <Route path="/MediaUpload" element={<MediaUpload />} />
                
                <Route path="/MediaModeration" element={<MediaModeration />} />
                
                <Route path="/EventSlideshow" element={<EventSlideshow />} />
                
                <Route path="/PhotobookCreator" element={<PhotobookCreator />} />
                
                <Route path="/AdminSettings" element={<AdminSettings />} />
                
                <Route path="/MediaHub" element={<MediaHub />} />
                
                <Route path="/Subscription" element={<Subscription />} />
                
                <Route path="/PricingManagement" element={<PricingManagement />} />
                
                <Route path="/SystemLogs" element={<SystemLogs />} />
                
                <Route path="/UserSubscriptions" element={<UserSubscriptions />} />
                
                <Route path="/FinanceManagement" element={<FinanceManagement />} />
                
                <Route path="/login" element={<Login />} />
                
                <Route path="/signup" element={<Signup />} />
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}