import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import OtpVerification from "./OtpVerification";
import { useAuth } from "@/context/AuthContext";

const formSchema = z.object({
  displayName: z.string().min(3, "Display name must be at least 3 characters"),
  email: z.string().email("Invalid email address").refine(
    (email) => email.toLowerCase().endsWith("iitr.ac.in"), 
    "Must be an IITR email address"
  ),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

const SignupForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      // Log registration data for debugging
      console.log("Signup data:", data);
      
      // Call the register function from AuthContext
      const success = await register(data.displayName, data.email, data.password);
      
      if (success) {
        // Show OTP verification form
        setShowOtpVerification(true);
        
        toast({
          title: "Registration initiated",
          description: "Please check your email for OTP verification",
        });
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Registration failed",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const handleOtpVerified = () => {
    toast({
      title: "Registration successful",
      description: "Welcome to Unsaid!",
    });
    
    navigate("/feed");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  if (showOtpVerification) {
    return <OtpVerification email={form.getValues("email")} onVerified={handleOtpVerified} />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Display name" 
                  {...field} 
                  disabled={loading}
                  autoComplete="name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  placeholder="example@ch.iitr.ac.in" 
                  type="email" 
                  {...field} 
                  disabled={loading}
                  autoComplete="email"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    placeholder="Create a password" 
                    type={showPassword ? "text" : "password"} 
                    {...field} 
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                    onClick={togglePasswordVisibility}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    placeholder="Confirm your password" 
                    type={showConfirmPassword ? "text" : "password"} 
                    {...field} 
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                    onClick={toggleConfirmPasswordVisibility}
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full mt-6" 
          disabled={loading}
        >
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </Form>
  );
};

export default SignupForm;
