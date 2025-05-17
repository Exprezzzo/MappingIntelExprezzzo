"use client";

import AuthLayout from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { sendPasswordReset } from "@/lib/firebase/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setLoading(true);
    try {
      await sendPasswordReset(values.email);
      toast({ title: "Password Reset Email Sent", description: "Check your inbox for instructions." });
      setEmailSent(true);
    } catch (error: any) {
      console.error("Forgot Password Error:", error);
      toast({
        title: "Error Sending Email",
        description: error.message || "Failed to send password reset email.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Forgot Your Password?">
      {emailSent ? (
        <div className="text-center space-y-4">
          <p className="text-foreground">
            If an account exists for the email address you entered, you will receive an email with instructions on how to reset your password.
          </p>
          <Button asChild>
            <Link href="/login">Back to Log In</Link>
          </Button>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-6 text-center">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Reset Link
              </Button>
            </form>
          </Form>
        </>
      )}
      <div className="mt-6 text-center text-sm">
        Remembered your password?{" "}
        <Link href="/login" className="font-semibold text-primary hover:text-primary/80">
          Log In
        </Link>
      </div>
    </AuthLayout>
  );
}
