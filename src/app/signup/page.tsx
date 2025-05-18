"use client";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthForm } from "@/components/auth/AuthForm";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth"; // Assuming this hook provides signUpWithEmail
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import Link from "next/link";

// This Zod schema MUST EXACTLY MATCH the 'signupSchema' defined in AuthForm.tsx
// It is derived from formSchemaBase.extend({...}) as seen in AuthForm.tsx
const formSchemaBaseForPage = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const signupFormSchema = formSchemaBaseForPage.extend({
  displayName: z.string().min(2, { message: "Display name must be at least 2 characters." }).optional(),
  confirmPassword: z.string(), // Matches AuthForm.tsx (no min length here, as refine handles equality)
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"], // Error will be associated with the confirmPassword field
});

// This type is now derived from the schema that matches AuthForm's internal signupSchema
type SignupFormValues = z.infer<typeof signupFormSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { signUpWithEmail } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // handleSignup now correctly expects SignupFormValues,
  // which matches what AuthForm will provide after its internal Zod validation.
  const handleSignup = async (values: SignupFormValues) => {
    setLoading(true);
    try {
      // The 'values' object here has been validated by Zod inside AuthForm
      // against the 'signupSchema' (defined in AuthForm.tsx).
      // So, values.password is guaranteed to be a string.
      await signUpWithEmail(values.email, values.password, values.displayName);

      toast({
        title: "Signup Successful",
        description: "Welcome! Your account has been created.",
      });
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Signup Error:", error);
      // This error would be from signUpWithEmail or other logic,
      // as Zod validation errors are handled by react-hook-form within AuthForm.
      toast({
        title: "Signup Failed",
        description: error.message |
| "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create Your Account" description="Enter your details below to create your account.">
      <AuthForm mode="signup" onSubmit={handleSignup} loading={loading} />
      {/* If you have SocialSignInButtons, include it here */}
      {/* <SocialSignInButtons /> */}
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Button variant="link" className="px-1" asChild>
          <Link href="/login">Login</Link>
        </Button>
      </p>
    </AuthLayout>
  );
}
