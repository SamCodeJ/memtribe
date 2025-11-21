
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { createPageUrl }
 from "@/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Users,
  QrCode,
  Sparkles,
  ArrowRight,
  Star,
  Target,
  HeartHandshake,
  Check,
  Building
} from "lucide-react";
import { Package, Feature, PackageFeature } from "@/api/newEntities";

export default function Landing() {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [features, setFeatures] = useState([]);
  const [packageFeatures, setPackageFeatures] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch packages, features, and package features on mount
  useEffect(() => {
    const loadPricingData = async () => {
      try {
        setLoading(true);
        const [pkgsData, featuresData, pkgFeaturesData] = await Promise.all([
          Package.list(),
          Feature.list(),
          PackageFeature.list()
        ]);
        
        // Filter only active packages and sort by display_order
        const activePackages = pkgsData
          .filter(pkg => pkg.is_active)
          .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
        
        setPackages(activePackages);
        setFeatures(featuresData);
        setPackageFeatures(pkgFeaturesData);
      } catch (error) {
        console.error("Error loading pricing data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadPricingData();
  }, []);

  const handleLogin = async () => {
    navigate('/login?redirect=' + encodeURIComponent(createPageUrl("Dashboard")));
  };

  const handleSignup = async () => {
    navigate('/signup?redirect=' + encodeURIComponent(createPageUrl("Dashboard")));
  };

  // Helper function to get feature name by feature_id
  const getFeatureName = (featureId) => {
    const feature = features.find(f => f.id === featureId);
    return feature ? (feature.display_name || feature.feature_key) : 'Feature';
  };

  const services = [
    {
      icon: Calendar,
      title: "Smart Event Creation",
      description: "Create stunning events in minutes with our intuitive builder, complete with scheduling and management tools."
    },
    {
      icon: QrCode,
      title: "QR Code Integration",
      description: "Seamless check-in, media sharing, and event access with smart QR codes for every guest."
    },
    {
      icon: Users,
      title: "Guest Management",
      description: "Effortless RSVP tracking, guest list management, and communication tools to keep everyone informed."
    },
    {
      icon: Sparkles,
      title: "Premium Media Sharing",
      description: "A private, curated space for guests to share photos and videos, creating a collective memory of your event."
    }
  ];

  const navLinks = [
    { name: "About", href: "#about" },
    { name: "Services", href: "#services" },
    { name: "Pricing", href: "#pricing" },
    { name: "Contact", href: "#contact" }
  ];

  const handleNavClick = (e) => {
    e.preventDefault();
    const targetId = e.currentTarget.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen text-white" style={{backgroundColor: '#442873'}}>
      {/* Navigation */}
      <nav className="sticky top-0 w-full z-50 px-6 py-4 backdrop-blur-lg border-b border-white/10" style={{backgroundColor: 'rgba(68, 40, 115, 0.8)'}}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="#" className="flex items-center gap-3">
            <img src="/logo.png" alt="MemTribe Logo" className="w-10 h-10 object-contain" />
            <span className="text-2xl font-bold">MemTribe</span>
          </a>
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <a key={link.name} href={link.href} onClick={handleNavClick} className="hover:text-yellow-500 transition-colors" style={{color: '#A78BE6'}}>
                {link.name}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleLogin}
              variant="outline"
              className="border-white/40 hover:bg-white/10 backdrop-blur-sm font-semibold px-6 py-2"
              style={{color: '#A78BE6'}}
            >
              Sign In
            </Button>
            <Button 
              onClick={handleSignup}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-6 py-2"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative overflow-hidden pt-32 pb-20">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/20 to-yellow-400/20 opacity-30"></div>
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-yellow-100 text-sm font-medium">Premium Event Management</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Create Unforgettable
            <span className="block bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              Event Experiences
            </span>
          </h1>
          
          <p className="text-xl mb-10 max-w-3xl mx-auto leading-relaxed" style={{color: '#A78BE6'}}>
            Transform your events with our luxury platform featuring smart QR codes, 
            seamless guest management, and premium media sharing capabilities.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleSignup}
              size="lg"
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-8 py-4 text-lg"
            >
              Start Creating Events
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              onClick={handleLogin}
              variant="outline" 
              size="lg"
              className="border-white/40 hover:bg-white/10 backdrop-blur-sm px-8 py-4 text-lg"
              style={{color: '#A78BE6'}}
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>
      
      {/* About Us Section */}
      <section id="about" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-white mb-4">About MemTribe</h2>
              <p className="text-lg" style={{color: '#A78BE6'}}>
                MemTribe was born from a simple idea: event management should be as memorable as the events themselves. We're a passionate team of developers, designers, and event enthusiasts dedicated to creating a platform that is powerful, elegant, and intuitive.
              </p>
              <p className="text-lg" style={{color: '#A78BE6'}}>
                We believe in the power of shared experiences and our mission is to provide the tools that help you craft those unforgettable moments.
              </p>
            </div>
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center shrink-0"><Target className="w-6 h-6 text-yellow-500" /></div>
                <div>
                  <h3 className="text-xl font-semibold">Our Mission</h3>
                  <p style={{color: '#8B5FD9'}}>To empower event organizers with seamless technology, enabling them to create and share exceptional event experiences.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center shrink-0"><HeartHandshake className="w-6 h-6 text-yellow-500" /></div>
                <div>
                  <h3 className="text-xl font-semibold">Our Values</h3>
                  <p style={{color: '#8B5FD9'}}>Innovation, elegance, and a user-centric approach are at the core of everything we build.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything You Need for Perfect Events
            </h2>
            <p className="text-xl max-w-2xl mx-auto" style={{color: '#A78BE6'}}>
              From creation to completion, MemTribe provides all the tools for exceptional event management
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <service.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {service.title}
                  </h3>
                  <p style={{color: '#A78BE6'}}>
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Flexible Pricing for Every Occasion</h2>
            <p className="text-xl max-w-3xl mx-auto" style={{color: '#A78BE6'}}>
              Choose the perfect plan to create, manage, and share your unforgettable events.
            </p>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="text-white text-xl">Loading pricing plans...</div>
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-white text-xl">No pricing plans available at the moment.</div>
            </div>
          ) : (
            <div className={`grid gap-8 items-start ${packages.length === 1 ? 'lg:grid-cols-1 max-w-md mx-auto' : packages.length === 2 ? 'lg:grid-cols-2 max-w-4xl mx-auto' : packages.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
              {packages.map((pkg) => {
                // Get features for this package
                const pkgFeatures = packageFeatures.filter(pf => pf.package_id === pkg.id);
                const isPopular = pkg.is_popular;
                const isFree = pkg.monthly_price === 0;
                
                return (
                  <div 
                    key={pkg.id}
                    className={`rounded-xl p-8 flex flex-col h-full relative ${
                      isPopular 
                        ? 'bg-yellow-500/10 border-2 border-yellow-500 -my-4' 
                        : 'bg-white/10 border border-white/20'
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                        <div className="bg-yellow-500 text-white px-4 py-1 rounded-full text-sm font-semibold">Most Popular</div>
                      </div>
                    )}
                    
                    <div className="text-center mb-6">
                      <h3 className={`text-2xl font-bold ${isPopular ? 'text-yellow-500' : 'text-white'}`}>
                        {pkg.package_name}
                      </h3>
                      <p className="text-4xl font-bold my-4 text-white">
                        ${pkg.monthly_price}
                        <span className="text-lg font-normal" style={{color: '#8B5FD9'}}>/month</span>
                      </p>
                      {pkg.description && (
                        <p className="text-sm" style={{color: '#8B5FD9'}}>{pkg.description}</p>
                      )}
                    </div>
                    
                    <ul className="space-y-3 flex-grow" style={{color: '#A78BE6'}}>
                      {pkgFeatures.length > 0 ? (
                        pkgFeatures.map(pf => (
                          <li key={pf.id} className="flex gap-2">
                            <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                            <span>
                              {getFeatureName(pf.feature_id)}: {pf.is_unlimited ? 'Unlimited' : pf.feature_value}
                            </span>
                          </li>
                        ))
                      ) : (
                        <li className="flex gap-2">
                          <span>Contact us for details</span>
                        </li>
                      )}
                    </ul>
                    
                    {isFree ? (
                      <Button 
                        onClick={handleSignup} 
                        variant="outline" 
                        className="w-full mt-8 border-white/40 hover:bg-white/10" 
                        style={{color: '#A78BE6'}}
                      >
                        Get Started Free
                      </Button>
                    ) : isPopular ? (
                      <Button 
                        onClick={handleSignup} 
                        className="w-full mt-8 bg-yellow-600 hover:bg-yellow-700"
                      >
                        Choose {pkg.package_name}
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleSignup} 
                        variant="outline" 
                        className="w-full mt-8 border-white/40 hover:bg-white/10" 
                        style={{color: '#A78BE6'}}
                      >
                        Choose {pkg.package_name}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="py-24">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Get In Touch</h2>
            <p className="text-xl" style={{color: '#A78BE6'}}>Have questions? We'd love to hear from you.</p>
          </div>
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your Name" className="text-white mt-2" style={{backgroundColor: '#2A0970', borderColor: '#350C8E'}} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Your Email" className="text-white mt-2" style={{backgroundColor: '#2A0970', borderColor: '#350C8E'}} />
                </div>
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Your message..." rows={5} className="text-white mt-2" style={{backgroundColor: '#2A0970', borderColor: '#350C8E'}} />
              </div>
              <Button type="submit" size="lg" className="w-full bg-yellow-600 hover:bg-yellow-700">Send Message</Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Create Amazing Events?
          </h2>
          <p className="text-xl mb-10" style={{color: '#A78BE6'}}>
            Join thousands of event organizers who trust MemTribe for their most important gatherings
          </p>
          <Button 
            onClick={handleSignup}
            size="lg"
            className="bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-700 hover:to-yellow-600 text-white font-semibold px-10 py-4 text-lg"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/logo.png" alt="MemTribe Logo" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold text-white">MemTribe</span>
          </div>
          <p style={{color: '#8B5FD9'}}>
            © 2025 MemTribe. Crafting exceptional event experiences. Developed by Readefined Solutions.
          </p>
        </div>
      </footer>
    </div>
  );
}
