"use client";

import ProtectedPage from "@/components/auth/ProtectedPage";
import { Navbar } from "@/components/layout/Navbar";
import ProfileSettingsForm from "@/components/profile/ProfileSettingsForm";

export default function ProfilePage() {
  return (
    <ProtectedPage>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <ProfileSettingsForm />
      </main>
    </ProtectedPage>
  );
}
