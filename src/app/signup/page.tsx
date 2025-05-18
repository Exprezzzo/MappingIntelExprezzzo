"use client";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthForm } from "@/components/auth/AuthForm"; // We assume AuthForm passes a general object to onSubmit
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import Link from "next/link";

// This is your Zod schema that defines the VALID structure for signup data
const signupFormSchema = z.object({
  displayName: z.string().optional(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  // confirmPassword is required by the schema for the refine check
  confirmPassword: z.string().min(6, "Password confirmation is required"),
})
.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], // Error will be associated with the confirmPassword field
});

// This is the TypeScript type for your VALIDATED form data, inferred from the Zod schema
type SignupFormValues = z.infer<typeof signupFormSchema>;

// This type represents what AuthForm *might* be passing to onSubmit,
// based on the Vercel error message (password, displayName, confirmPassword could be initially optional).
type PotentiallyIncompleteAuthFormValues = {
  email: string;
  password?: string;
  displayName?: string;
  confirmPassword?: string;
};

export default function SignupPage() {
  const router = useRouter();
  const { signUpWithEmail } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Updated handleSignup function
  const handleSignup = async (rawValuesFromAuthForm: PotentiallyIncompleteAuthFormValues) => {
    setLoading(true);
    try {
      // Explicitly validate the raw values from AuthForm using your Zod schema
      const validatedValues = signupFormSchema.parse(rawValuesFromAuthForm);
      // If parse is successful, validatedValues is guaranteed to be of type SignupFormValues,
      // where 'password' and 'confirmPassword' are definitely strings.

      await signUpWithEmail(
        validatedValues.email,
        validatedValues.password, // Now TypeScript knows this is a string
        validatedValues.displayName
      );

      toast({
        title: "Signup Successful",
        description: "Welcome! Your account has been created.",
      });
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Signup Error:", error);
      if (error instanceof z.ZodError) {
        // Handle Zod validation errors
        const firstError = error.errors;
        const errorMessage = firstError 
         ? `${firstError.path.join('.')} - ${firstError.message}` 
          : "Please check your input and try again.";
        toast({
          title: "Validation Failed",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        // Handle other errors (e.g., from signUpWithEmail)
        toast({
          title: "Signup Failed",
          description: error.message |
| "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create Your Account" description="Enter your details below to create your account.">
      {/* AuthForm's onSubmit will now call the updated handleSignup */}
      <AuthForm mode="signup" onSubmit={handleSignup} loading={loading} />
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Button variant="link" className="px-1" asChild>
          <Link href="/login">Login</Link>
        </Button>
      </p>
    </AuthLayout>
  );
}
