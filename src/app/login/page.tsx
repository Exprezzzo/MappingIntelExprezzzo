"use client";

import AuthForm from "@/components/auth/AuthForm";
import SocialSignInButtons from "@/components/auth/SocialSignInButtons";
import AuthLayout from "@/components/layout/AuthLayout";
import { useToast } from "@/hooks/use-toast";
import { signInWithEmail } from "@/lib/firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as z from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
type LoginFormValues = z.infer<typeof loginSchema>;


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      await signInWithEmail(values.email, values.password);
      toast({ title: "Login Successful!", description: "Welcome back." });
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login Error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Log In to Your Account">
      <AuthForm mode="login" onSubmit={handleLogin} loading={loading} />
      <div className="mt-4 text-center text-sm">
        <Link href="/forgot-password" className="underline text-primary hover:text-primary/80">
          Forgot your password?
        </Link>
      </div>
      <SocialSignInButtons />
      <div className="mt-6 text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold text-primary hover:text-primary/80">
          Sign Up
        </Link>
      </div>
      <div id="recaptcha-container" className="my-4"></div> {/* For phone auth from SocialSignInButtons if needed */}
    </AuthLayout>
  );
}
