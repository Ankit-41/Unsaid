import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { authAtom, setAuth } from '../../atoms/authAtom';
import { authAPI } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import toast from 'react-hot-toast';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [, setAuthState] = useAtom(authAtom);
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otpError, setOtpError] = useState('');
  
  // Handle registration form submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setOtpError('');
    
    try {
      // Validate email domain
      if (!email.toLowerCase().endsWith('iitr.ac.in')) {
        setOtpError('Please use an IITR email address');
        toast.error('Please use an IITR email address');
        setLoading(false);
        return;
      }
      
      // Register user
      const response = await authAPI.register({ name, email, password });
      
      toast.success('Registration successful! Please verify your email with the OTP sent.');
      setShowOtpForm(true);
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle OTP verification
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setOtpError('');
    
    try {
      const response = await authAPI.verifyEmail({ email, otp });
      
      // Update auth state with user data and token
      setAuthState(setAuth({
        isAuthenticated: true,
        user: response.data.data.user,
        token: response.data.token,
        loading: false
      }));
      
      toast.success('Email verified successfully!');
      navigate('/');
    } catch (error: any) {
      console.error('OTP verification error:', error);
      setOtpError(error.response?.data?.message || 'Invalid or expired OTP');
      toast.error(error.response?.data?.message || 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle resend OTP
  const handleResendOTP = async () => {
    setLoading(true);
    
    try {
      await authAPI.resendOTP({ email });
      toast.success('OTP resent successfully!');
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      toast.error(error.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {showOtpForm ? 'Verify Email' : 'Create an Account'}
          </CardTitle>
          <CardDescription className="text-center">
            {showOtpForm 
              ? 'Enter the OTP sent to your email' 
              : 'Join Unsaid to share your college gossips'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {!showOtpForm ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Enter your full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your.email@iitr.ac.in"
                />
                {otpError && <p className="text-sm text-red-500">{otpError}</p>}
                <p className="text-xs text-gray-500">Only IITR email addresses are allowed</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Create a password (min. 8 characters)"
                  minLength={8}
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                />
                {otpError && <p className="text-sm text-red-500">{otpError}</p>}
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  className="text-sm text-primary hover:underline"
                  disabled={loading}
                >
                  Didn't receive OTP? Resend
                </button>
              </div>
            </form>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
