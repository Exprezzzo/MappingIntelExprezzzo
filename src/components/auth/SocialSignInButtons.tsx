"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { signInWithGoogle, signInWithApple, setupRecaptcha, signInWithPhoneNumber as firebaseSignInWithPhoneNumber } from "@/lib/firebase/auth";
import { Apple, Loader2, Phone } from "lucide-react"; // Apple icon might not exist in lucide-react, placeholder
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import type { RecaptchaVerifier, ConfirmationResult } from "firebase/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Google Icon SVG
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6.04C45.09 39.02 48 32.44 48 24c0-.66-.03-1.31-.07-1.95l.05.4z" opacity=".3"/> {/* Changed this line to make the half circle visible */}
    <path fill="#34A853" d="M10.53 28.39C9.92 26.64 9.5 24.79 9.5 22.86c0-1.93.42-3.78 1.03-5.53l-7.98-6.19C.92 14.76 0 18.71 0 22.86c0 4.15.92 8.1 2.56 11.47l7.97-6.19z"/>
    <path fill="#FBBC05" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" opacity=".3"/> {/* Changed this line to make the half circle visible */}
     <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6.04C45.09 39.02 48 32.44 48 24c0-.66-.03-1.31-.07-1.95l.05.4z"/>
    <path fill="#FBBC05" d="M24 48c6.47 0 11.9-2.38 15.84-6.36l-7.73-6.04c-2.15 1.45-4.92 2.3-8.11 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    <path fill="none" d="M0 0h48v48H0z"/>
  </svg>
);

// Apple Icon SVG (Simplified)
const AppleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.213 15.394c-.633.972-1.48 1.914-2.603 1.914-1.017 0-1.492-.674-2.52-.674-1.043 0-1.607.644-2.536.683-.943.039-1.728-.787-2.422-1.684-.989-1.254-1.773-3.43-1.773-5.662 0-3.123 1.668-4.685 3.736-4.685 1.165 0 2.04.824 2.718.824.62 0 1.652-.918 2.91-.853.678.028 2.228.314 2.938 2.043-.203.126-1.262.718-1.262 2.298 0 1.803 1.44 2.544 1.44 2.544s-.096.076-.073.09c.135.078.86.47 1.233 1.448zM15.416 4.06c.58-.698 1.003-1.67 1.003-2.678C15.833.52 15.072 0 14.328 0c-.718.009-1.652.445-2.27.989-.58.699-1.004 1.679-1.004 2.697.583.86 1.838.931 2.436.917.644-.02 1.345-.293 1.926-.543z"/>
  </svg>
);


export default function SocialSignInButtons() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState<"google" | "apple" | "phone" | null>(null);
  const [phoneStep, setPhoneStep] = useState<"input" | "otp">("input");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const [appVerifier, setAppVerifier] = useState<RecaptchaVerifier | null>(null);
  const [isPhoneLoading, setIsPhoneLoading] = useState(false);

  useEffect(() => {
    if (phoneStep === "input" && recaptchaContainerRef.current && !appVerifier) {
      const verifier = setupRecaptcha(recaptchaContainerRef.current.id);
      setAppVerifier(verifier);
    }
  }, [phoneStep, appVerifier]);

  const handleGoogleSignIn = async () => {
    setLoading("google");
    try {
      await signInWithGoogle();
      toast({ title: "Signed in with Google successfully!" });
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      toast({ title: "Google Sign-In Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const handleAppleSignIn = async () => {
    setLoading("apple");
    try {
      await signInWithApple();
      toast({ title: "Signed in with Apple successfully!" });
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Apple Sign-In Error:", error);
      toast({ title: "Apple Sign-In Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };
  
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appVerifier || !phoneNumber) {
      toast({ title: "Error", description: "Phone number and reCAPTCHA are required.", variant: "destructive" });
      return;
    }
    setIsPhoneLoading(true);
    setLoading("phone");
    try {
      // Ensure phone number is in E.164 format (e.g., +1XXXXXXXXXX)
      const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+1${phoneNumber}`; // Assuming US numbers if no prefix
      const result = await firebaseSignInWithPhoneNumber(formattedPhoneNumber, appVerifier);
      setConfirmationResult(result);
      setPhoneStep("otp");
      toast({ title: "OTP Sent", description: "Please check your phone for the OTP." });
    } catch (error: any) {
      console.error("Phone Sign-In Error (Send OTP):", error);
      toast({ title: "Failed to Send OTP", description: error.message, variant: "destructive" });
      // Reset reCAPTCHA if it failed
      if (appVerifier && (window as any).grecaptcha) {
        (window as any).grecaptcha.reset((window as any).recaptchaWidgetId); 
      }
    } finally {
      setIsPhoneLoading(false);
      setLoading(null);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult || !otp) {
      toast({ title: "Error", description: "OTP is required.", variant: "destructive" });
      return;
    }
    setIsPhoneLoading(true);
    setLoading("phone");
    try {
      await confirmationResult.confirm(otp);
      toast({ title: "Signed in with Phone successfully!" });
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Phone Sign-In Error (Verify OTP):", error);
      toast({ title: "Failed to Verify OTP", description: error.message, variant: "destructive" });
    } finally {
      setIsPhoneLoading(false);
      setLoading(null);
    }
  };


  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={!!loading}>
          {loading === "google" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
          Google
        </Button>
        <Button variant="outline" className="w-full" onClick={handleAppleSignIn} disabled={!!loading}>
          {loading === "apple" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AppleIcon />}
          Apple
        </Button>
      </div>
      
      {/* Phone Sign-In */}
      <div className="space-y-2 pt-2 border-t border-border">
         <p className="text-sm text-muted-foreground text-center py-2">Sign in with Phone</p>
        {phoneStep === "input" && (
          <form onSubmit={handleSendOtp} className="space-y-4">
             <div id="recaptcha-container-social" ref={recaptchaContainerRef} className="my-2"></div>
            <div>
              <Label htmlFor="phone-number">Phone Number (e.g. +15551234567)</Label>
              <Input 
                id="phone-number"
                type="tel" 
                value={phoneNumber} 
                onChange={(e) => setPhoneNumber(e.target.value)} 
                placeholder="Enter phone number" 
                required 
                className="mt-1"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPhoneLoading || !appVerifier}>
              {isPhoneLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Phone className="mr-2 h-4 w-4" />}
              Send OTP
            </Button>
          </form>
        )}

        {phoneStep === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <Label htmlFor="otp">OTP Code</Label>
              <Input 
                id="otp"
                type="text" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)} 
                placeholder="Enter OTP" 
                required 
                className="mt-1"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPhoneLoading}>
              {isPhoneLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Phone className="mr-2 h-4 w-4" />}
              Verify OTP & Sign In
            </Button>
             <Button variant="link" onClick={() => setPhoneStep("input")} className="w-full text-sm">
              Back to phone number input
            </Button>
          </form>
        )}
      </div>


    </div>
  );
}
