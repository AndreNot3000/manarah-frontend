"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser, updateProfile } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, Input, Button } from "@/components/ui";
import { Camera, CheckCircle, AlertCircle } from "lucide-react";
import clsx from "clsx";

interface ProfileFormInput {
  name: string;
  phone: string;
}

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch current user details
  const { data, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: getCurrentUser,
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormInput>();

  // Pre-fill form fields when data arrives
  useEffect(() => {
    if (data?.profile) {
      setValue("name", data.profile.name);
      setValue("phone", data.profile.phone || "");
      if (data.profile.avatarUrl) {
        setAvatarPreview(data.profile.avatarUrl);
      }
    }
  }, [data, setValue]);

  // Profile Update Mutation
  const updateMutation = useMutation({
    mutationFn: (formData: FormData) => updateProfile(formData),
    onSuccess: (updatedData) => {
      setSuccessMessage("Your profile has been updated successfully.");
      setErrorMessage(null);
      setSelectedFile(null);
      // Invalidate query to trigger refetch of header and dashboard name
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      
      // Update local storage user cookie just in case
      const userCookieStr = document.cookie
        .split("; ")
        .find((row) => row.startsWith("user="))
        ?.split("=")[1];
      if (userCookieStr) {
        try {
          const userObj = JSON.parse(decodeURIComponent(userCookieStr));
          userObj.name = updatedData.profile?.name || userObj.name;
          localStorage.setItem("user", JSON.stringify(userObj));
          document.cookie = `user=${encodeURIComponent(JSON.stringify(userObj))}; path=/; max-age=604800; SameSite=Lax`;
          window.dispatchEvent(new Event("storage"));
        } catch (e) {
          console.error("Error updating user cookies", e);
        }
      }
    },
    onError: (err) => {
      setErrorMessage(err.message || "Failed to update profile. Please try again.");
      setSuccessMessage(null);
    },
  });

  // Handle avatar file selection & create local preview url
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Image must be smaller than 5MB.");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleAvatarClick() {
    fileInputRef.current?.click();
  }

  async function onSubmit(formData: ProfileFormInput) {
    if (!formData.name.trim()) {
      setErrorMessage("Name cannot be empty.");
      return;
    }

    const payload = new FormData();
    payload.append("name", formData.name);
    payload.append("phone", formData.phone);
    if (selectedFile) {
      payload.append("avatar", selectedFile);
    }

    updateMutation.mutate(payload);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center font-semibold text-primary animate-pulse text-lg">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">My Profile</CardTitle>
          <CardDescription>Update your personal info, contact number, and avatar image.</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 border-t border-slate-100 space-y-6">
          
          {/* Feedback alerts */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg flex items-center gap-3 text-sm font-semibold">
              <CheckCircle size={18} className="text-green-600" />
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-center gap-3 text-sm font-semibold">
              <AlertCircle size={18} className="text-red-600" />
              {errorMessage}
            </div>
          )}

          {/* Avatar upload section */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group hover:cursor-pointer" onClick={handleAvatarClick}>
              <div className="h-28 w-28 rounded-full overflow-hidden border-4 border-slate-200 flex items-center justify-center bg-slate-100 relative">
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-primary">
                    {data?.profile?.name?.charAt(0).toUpperCase()}
                  </span>
                )}
                {/* Overlay camera icon on hover */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white" size={24} />
                </div>
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAvatarClick}
              className="text-xs font-semibold gap-1.5"
            >
              <Camera size={14} />
              Change Photo
            </Button>
            <p className="text-xs text-neutral-muted">JPG, PNG or WebP up to 5MB.</p>
          </div>

          <hr className="border-slate-100" />

          {/* Form fields */}
          <div className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-sm font-bold text-slate-700">Full Name</span>
              <Input
                type="text"
                {...register("name", { required: "Name is required" })}
                placeholder="Full Name"
                className={clsx("h-12 border-2", {
                  "border-red-500": errors.name,
                })}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-bold text-slate-700">Email Address (Read-only)</span>
              <Input
                type="email"
                value={data?.email || ""}
                disabled
                className="h-12 border-2 bg-slate-100 cursor-not-allowed text-slate-500 font-mono"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-bold text-slate-700">Phone Number</span>
              <Input
                type="text"
                {...register("phone")}
                placeholder="Phone Number"
                className="h-12 border-2"
              />
            </label>
          </div>

          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="w-full h-12 text-sm font-semibold flex items-center justify-center"
          >
            {updateMutation.isPending ? "Saving changes..." : "Save Changes"}
          </Button>

        </form>
      </Card>
    </div>
  );
}
