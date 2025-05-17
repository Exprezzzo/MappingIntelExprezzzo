"use client";

import AuthForm from "@/components/auth/AuthForm";
import SocialSignInButtons from "@/components/auth/SocialSignInButtons";
import AuthLayout from "@/components/layout/AuthLayout";
import { useToast } from "@/hooks/use-toast";
import { signUpWithEmail } from "@/lib/firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as z from "zod";

const signupFormSchema = z.object({
  displayName: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupFormSchema>;


export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSignup = async (values: SignupFormValues) => {
    setLoading(true);
    try {
      await signUpWithEmail(values.email, values.password, values.displayName);
      toast({ title: "Signup Successful!", description: "Welcome! Your account has been created." });
      router.push("/dashboard"); // Or to a profile completion page
    } catch (error: any) {
      console.error("Signup Error:", error);
      toast({
        title: "Signup Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create Your Account">
      <AuthForm mode="signup" onSubmit={handleSignup} loading={loading} />
      <SocialSignInButtons />
      <div className="mt-6 text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:text-primary/80">
          Log In
        </Link>
      </div>
       <div id="recaptcha-container" className="my-4"></div> {/* For phone auth from SocialSignInButtons if needed */}
    </AuthLayout>
  );
}
