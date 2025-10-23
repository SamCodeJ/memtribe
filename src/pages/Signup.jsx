import React, { useState } from "react";
import { User } from "@/api/newEntities";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/Dashboard';
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (!formData.full_name.trim()) {
      setError('Full name is required');
      setLoading(false);
      return;
    }

    try {
      // Register new user
      await User.register({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name
      });
      
      setSuccess(true);
      
      // Redirect after a short delay
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 1500);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{background: 'linear-gradient(to bottom right, #200552, #2A0970)'}}>
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{color: '#200552'}}>Account Created Successfully!</h2>
            <p className="mb-4" style={{color: '#4A1BA0'}}>Redirecting to your dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{background: 'linear-gradient(to bottom right, #200552, #2A0970)'}}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img src="/logo.png" alt="MemTribe Logo" className="w-16 h-16 object-contain mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold">
            Create Your MemTribe Account
          </CardTitle>
          <CardDescription>
            Start creating amazing events in minutes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="John Doe"
                required
                className="mt-1"
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                required
                className="mt-1"
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="At least 6 characters"
                required
                minLength={6}
                className="mt-1"
                disabled={loading}
              />
              <p className="text-xs mt-1" style={{color: '#8B5FD9'}}>Minimum 6 characters</p>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Re-enter your password"
                required
                className="mt-1"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-700"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <button
              type="button"
              onClick={() => navigate('/login' + (redirectUrl !== '/Dashboard' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''))}
              className="text-sm text-amber-600 hover:text-amber-700 block w-full"
            >
              Already have an account? Sign in
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-sm flex items-center justify-center gap-2 w-full"
              style={{color: '#8B5FD9'}}
              onMouseEnter={(e) => e.target.style.color = '#A78BE6'}
              onMouseLeave={(e) => e.target.style.color = '#8B5FD9'}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
          </div>

          {/* Terms */}
          <div className="mt-6 p-4 rounded-md" style={{backgroundColor: '#E8DFFF'}}>
            <p className="text-xs text-center" style={{color: '#4A1BA0'}}>
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

