import React, { useState } from "react";
import { User } from "@/api/newEntities";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/Dashboard';
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Login
      await User.login(formData.email, formData.password);
      
      // Force page reload to update authentication state
      window.location.href = redirectUrl;
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{background: 'linear-gradient(to bottom right, #200552, #2A0970)'}}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <img src="/logo.png" alt="MemTribe Logo" className="w-16 h-16 object-contain mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold">
            Sign In to MemTribe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                required
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                required
                className="mt-1"
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
              {loading ? 'Please wait...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <button
              type="button"
              onClick={() => navigate('/signup' + (redirectUrl !== '/Dashboard' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''))}
              className="text-sm text-amber-600 hover:text-amber-700 block w-full"
            >
              Don't have an account? Create one now
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-sm block w-full"
              style={{color: '#8B5FD9'}}
              onMouseEnter={(e) => e.target.style.color = '#A78BE6'}
              onMouseLeave={(e) => e.target.style.color = '#8B5FD9'}
            >
              Back to Home
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}