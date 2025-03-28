import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuth } from "@/context/AuthContext";
import * as api from "@/services/api";

interface OtpVerificationProps {
  email: string;
  onVerified: () => void;
}

const OtpVerification: React.FC<OtpVerificationProps> = ({ email, onVerified }) => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [remainingTime, setRemainingTime] = useState(60);
  const { verifyOTP } = useAuth();

  useEffect(() => {
    let timerId: NodeJS.Timeout;

    if (remainingTime > 0) {
      timerId = setTimeout(() => {
        setRemainingTime(remainingTime - 1);
      }, 1000);
    }

    return () => {
      clearTimeout(timerId);
    };
  }, [remainingTime]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("Verifying OTP:", { email, otp });
      const success = await verifyOTP(email, otp);
      
      if (success) {
        onVerified();
      } else {
        toast({
          title: "Verification failed",
          description: "Invalid OTP. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      toast({
        title: "Verification failed",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);

    try {
      // Use the API function for resending OTP
      const response = await api.resendOTP(email);
      
      if (response.status === 'success') {
        setRemainingTime(60);
        toast({
          title: "OTP resent",
          description: `A new OTP has been sent to ${email}`,
        });
      } else {
        toast({
          title: "Failed to resend OTP",
          description: response.message || "Please try again later",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      toast({
        title: "Failed to resend OTP",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h3 className="text-lg font-medium">Verify your email</h3>
        <p className="text-sm text-muted-foreground mt-1">
          We've sent a verification code to <span className="font-medium">{email}</span>
        </p>
      </div>

      <div className="flex justify-center my-6">
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={setOtp}
          disabled={isLoading}
          className="gap-2"
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      <Button 
        onClick={handleVerify} 
        className="w-full" 
        disabled={isLoading || otp.length !== 6}
      >
        {isLoading ? "Verifying..." : "Verify"}
      </Button>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {remainingTime > 0 ? (
            <>Didn't receive the code? Resend in {formatTime(remainingTime)}</>
          ) : (
            <Button 
              variant="link" 
              onClick={handleResendOtp}
              disabled={isLoading || remainingTime > 0}
              className="p-0 h-auto text-sm font-normal"
            >
              Resend OTP
            </Button>
          )}
        </p>
      </div>
    </div>
  );
};

export default OtpVerification;
