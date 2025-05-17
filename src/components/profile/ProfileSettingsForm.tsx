"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { updateUserProfile } from "@/lib/firebase/firestore";
import { updateUserFirebaseProfile } from "@/lib/firebase/auth";
import type { UserProfile } from "@/lib/types";
import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const profileSettingsSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters.").optional(),
  photoURL: z.string().url("Please enter a valid URL for photo.").optional().or(z.literal("")),
  preferences: z.object({
    preferredAirport: z.string().length(3, "Airport code must be 3 letters.").toUpperCase().optional().or(z.literal("")),
    notificationSettings: z.object({
      email: z.boolean().default(true),
      push: z.boolean().default(true),
      sms: z.boolean().default(false),
    }),
    valuesBasedFilters: z.array(z.string()).optional(),
  }),
});

type ProfileSettingsFormValues = z.infer<typeof profileSettingsSchema>;

const availableFilters = [
  { id: 'local_business', label: 'Support Local Businesses' },
  { id: 'minority_owned', label: 'Support Minority-Owned Businesses' },
  { id: 'eco_friendly', label: 'Eco-Friendly Options' },
  { id: 'luxury_services', label: 'Luxury Services' },
];


export default function ProfileSettingsForm() {
  const { currentUser, userProfile, reloadUserProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<ProfileSettingsFormValues>({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: {
      displayName: "",
      photoURL: "",
      preferences: {
        preferredAirport: "",
        notificationSettings: { email: true, push: true, sms: false },
        valuesBasedFilters: [],
      },
    },
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        displayName: userProfile.displayName || "",
        photoURL: userProfile.photoURL || "",
        preferences: {
          preferredAirport: userProfile.preferences.preferredAirport || "",
          notificationSettings: {
            email: userProfile.preferences.notificationSettings?.email ?? true,
            push: userProfile.preferences.notificationSettings?.push ?? true,
            sms: userProfile.preferences.notificationSettings?.sms ?? false,
          },
          valuesBasedFilters: userProfile.preferences.valuesBasedFilters || [],
        },
      });
    }
  }, [userProfile, form]);


  const onSubmit = async (values: ProfileSettingsFormValues) => {
    if (!currentUser) {
      toast({ title: "Error", description: "You must be logged in to update your profile.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const profileDataToUpdate: Partial<UserProfile> = {
        displayName: values.displayName,
        photoURL: values.photoURL,
        preferences: {
          preferredAirport: values.preferences.preferredAirport || null, // Store null if empty
          notificationSettings: values.preferences.notificationSettings,
          valuesBasedFilters: values.preferences.valuesBasedFilters || [],
        },
      };
      
      await updateUserProfile(currentUser.uid, profileDataToUpdate);
      if (values.displayName || values.photoURL) {
        await updateUserFirebaseProfile(currentUser, values.displayName, values.photoURL);
      }
      
      await reloadUserProfile(); // Reload profile to reflect changes in context
      toast({ title: "Profile Updated", description: "Your profile settings have been saved." });
    } catch (error: any) {
      console.error("Profile Update Error:", error);
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!userProfile) {
    return (
       <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Profile Settings</CardTitle>
        <CardDescription>Manage your account details and preferences.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-8">
            {/* Basic Information Section */}
            <section>
              <h3 className="text-lg font-semibold mb-3 border-b pb-2 text-primary">Basic Information</h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="photoURL"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Photo URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/your-photo.jpg" {...field} />
                      </FormControl>
                       <FormDescription>Enter a URL for your profile picture.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            {/* Preferences Section */}
            <section>
              <h3 className="text-lg font-semibold mb-3 border-b pb-2 text-primary">Preferences</h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="preferences.preferredAirport"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Airport (3-letter code)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., LAS" {...field} maxLength={3} className="uppercase" />
                      </FormControl>
                       <FormDescription>Your most frequently used airport.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Notification Settings</FormLabel>
                   <FormDescription>Choose how you want to be notified.</FormDescription>
                  <div className="space-y-2 pt-2">
                    <FormField
                      control={form.control}
                      name="preferences.notificationSettings.email"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-card">
                          <FormLabel className="text-sm font-normal">Email Notifications</FormLabel>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="preferences.notificationSettings.push"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-card">
                          <FormLabel className="text-sm font-normal">Push Notifications</FormLabel>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="preferences.notificationSettings.sms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-card">
                           <FormLabel className="text-sm font-normal">SMS Notifications</FormLabel>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </FormItem>

                <FormField
                  control={form.control}
                  name="preferences.valuesBasedFilters"
                  render={() => (
                    <FormItem>
                      <FormLabel>Values-Based Filters</FormLabel>
                      <FormDescription>Select filters that align with your values.</FormDescription>
                      <div className="space-y-2 pt-2">
                        {availableFilters.map((filter) => (
                          <FormField
                            key={filter.id}
                            control={form.control}
                            name="preferences.valuesBasedFilters"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={filter.id}
                                  className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-3 shadow-sm bg-card"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(filter.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), filter.id])
                                          : field.onChange(
                                              (field.value || []).filter(
                                                (value) => value !== filter.id
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    {filter.label}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
