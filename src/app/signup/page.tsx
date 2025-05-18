// src/app/signup/page.tsx

// ... your imports ...
// ... your signupFormSchema and SignupFormValues type definition (password IS required here) ...

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSignup = async (values: SignupFormValues) => { // <<<< Ensure this parameter is `values: SignupFormValues`
    setLoading(true);
    try {
      await signUpWithEmail(values.email, values.password, values.displayName);
      toast({
        title: "Signup Successful",
        description: "Welcome! Your account has been created.",
      });
      router.push("/dashboard");
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
      <AuthForm
        mode="signup"
        onSubmit={handleSignup} // This should now work if AuthForm is correctly typed internally for "signup" mode
        loading={loading}
      />
      <SocialSignInButtons />
      <div className="mt-6 text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:text-primary/80">
          Log In
        </Link>
      </div>
    </AuthLayout>
  );
}
