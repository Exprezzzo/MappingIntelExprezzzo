"use client";
import ProtectedPage from "@/components/auth/ProtectedPage";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";

export default function DashboardPage() {
  const { userProfile } = useAuth();

  return (
    <ProtectedPage>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-primary">Welcome to Your Dashboard, {userProfile?.displayName || "User"}!</CardTitle>
              <CardDescription>This is your central hub for Exprezzzo Intelligence System.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg">
                We&apos;re glad to have you here. Explore the features and manage your preferences.
              </p>
              {userProfile && (
                 <div className="p-4 border rounded-lg bg-secondary/30">
                    <h3 className="text-xl font-semibold mb-2">Your Quick Info:</h3>
                    <p><strong>Email:</strong> {userProfile.email || "Not set"}</p>
                    <p><strong>Phone:</strong> {userProfile.phoneNumber || "Not set"}</p>
                    <p><strong>Joined:</strong> {new Date(userProfile.createdAt.toDate()).toLocaleDateString()}</p>
                    <p><strong>Preferred Airport:</strong> {userProfile.preferences.preferredAirport || "Not set"}</p>
                 </div>
              )}
               <div className="mt-6">
                <Image 
                  src="https://placehold.co/800x400.png" 
                  alt="Dashboard placeholder image" 
                  width={800} 
                  height={400} 
                  className="rounded-lg shadow-md"
                  data-ai-hint="office analytics"
                />
              </div>
            </CardContent>
          </Card>

          {/* Placeholder for future content */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Feature Placeholder 1</CardTitle>
                <CardDescription>Details about this feature.</CardDescription>
              </CardHeader>
              <CardContent>
                <Image src="https://placehold.co/400x200.png" alt="Feature 1" width={400} height={200} className="rounded-md" data-ai-hint="technology interface" />
              </CardContent>
            </Card>
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Feature Placeholder 2</CardTitle>
                <CardDescription>Details about this feature.</CardDescription>
              </CardHeader>
              <CardContent>
                 <Image src="https://placehold.co/400x200.png" alt="Feature 2" width={400} height={200} className="rounded-md" data-ai-hint="data visualization" />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </ProtectedPage>
  );
}
