"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOwnTutorProfile, updateOwnTutorProfile } from "@/lib/api";
import { Card, CardTitle, Button, Input } from "@/components/ui";
import { CheckCircle2, X, Plus, Upload, FileText, Trash2, Camera } from "lucide-react";

interface NewQual {
  id: string;
  title: string;
  file: File | null;
  fileName: string;
}

const AVAILABLE_SUBJECTS = [
  { value: "QURAN", label: "Quran" },
  { value: "TAJWEED", label: "Tajweed" },
  { value: "HIFZ", label: "Hifz" },
  { value: "ARABIC", label: "Arabic" },
  { value: "ISLAMIC_STUDIES", label: "Islamic Studies" },
];

export default function TutorProfileEditor() {
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Fields State
  const [bio, setBio] = useState("");
  const [pricing, setPricing] = useState("");
  const [experience, setExperience] = useState("");
  const [availability, setAvailability] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  
  // Avatar photo upload
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Existing qualifications & removals
  const [existingQuals, setExistingQuals] = useState<{ id: string; title: string; fileUrl: string }[]>([]);
  const [removeQualIds, setRemoveQualIds] = useState<string[]>([]);

  // New qualifications state
  const [newQuals, setNewQuals] = useState<NewQual[]>([]);

  // Fetch tutor profile data
  const { data, isLoading } = useQuery({
    queryKey: ["tutorProfile"],
    queryFn: getOwnTutorProfile,
  });

  useEffect(() => {
    if (data?.tutor) {
      const t = data.tutor;
      setBio(t.bio || "");
      setPricing(t.pricing || "");
      setExperience(t.experience || "");
      setAvailability(t.availability || "");
      setSelectedSubjects(t.subjects || []);
      setExistingQuals(t.qualifications || []);
      setPhotoPreview(t.photoUrl || null);
    }
  }, [data]);

  // Mutation for updating profile
  const updateMutation = useMutation({
    mutationFn: (formData: FormData) => updateOwnTutorProfile(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tutorProfile"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setSuccess(true);
      setNewQuals([]);
      setRemoveQualIds([]);
      setErrorMsg(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => setSuccess(false), 4000);
    },
    onError: (err: Error) => {
      setErrorMsg(err.message || "Failed to update profile. Please try again.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center font-semibold text-primary animate-pulse text-lg">
          Loading profile settings...
        </div>
      </div>
    );
  }

  // Handle avatar photo selection
  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  }

  // Handle subjects toggle
  function handleSubjectToggle(val: string) {
    setSelectedSubjects((prev) =>
      prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val]
    );
  }

  // Add a new certificate line
  function handleAddQual() {
    setNewQuals((prev) => [
      ...prev,
      { id: Math.random().toString(), title: "", file: null, fileName: "" },
    ]);
  }

  // Remove a new qualification slot before upload
  function handleRemoveNewQual(id: string) {
    setNewQuals((prev) => prev.filter((q) => q.id !== id));
  }

  // Update new qualification titles & files
  function handleUpdateNewQual(id: string, fields: Partial<NewQual>) {
    setNewQuals((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...fields } : q))
    );
  }

  // Remove existing qualification file
  function handleRemoveExistingQual(id: string) {
    setExistingQuals((prev) => prev.filter((q) => q.id !== id));
    setRemoveQualIds((prev) => [...prev, id]);
  }

  // Submit profile updates form
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Verify all added qualifications have files & titles
    const invalidQual = newQuals.some((q) => !q.title.trim() || !q.file);
    if (invalidQual) {
      setErrorMsg("Please provide both a title and a document file for all new qualifications.");
      return;
    }

    const formData = new FormData();
    formData.append("bio", bio);
    formData.append("pricing", pricing);
    formData.append("experience", experience);
    formData.append("availability", availability);
    formData.append("subjects", JSON.stringify(selectedSubjects));

    if (photoFile) {
      formData.append("photo", photoFile);
    }

    if (removeQualIds.length > 0) {
      formData.append("removeQualificationIds", JSON.stringify(removeQualIds));
    }

    // Build titles list and attach files
    const titles: string[] = [];
    newQuals.forEach((q) => {
      if (q.file) {
        formData.append("qualifications", q.file);
        titles.push(q.title);
      }
    });

    if (titles.length > 0) {
      formData.append("qualificationTitles", JSON.stringify(titles));
    }

    updateMutation.mutate(formData);
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-4">
      <div>
        <h1 className="text-2xl font-black text-slate-800">Edit Profile</h1>
        <p className="text-sm text-neutral-muted mt-0.5">
          Update your biography, pricing, availability schedule, and upload certificates.
        </p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-center gap-3 text-xs font-semibold">
          <CheckCircle2 size={18} className="text-green-600" />
          Profile settings saved successfully! Your live listing has been updated.
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Photo Header Widget */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <div className="h-24 w-24 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center font-bold text-slate-400 text-3xl overflow-hidden shadow-inner">
                {photoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoPreview} alt="Tutor Avatar Preview" className="h-full w-full object-cover" />
                ) : (
                  (data?.tutor?.name?.charAt(0) || "T").toUpperCase()
                )}
              </div>
              <label className="absolute inset-0 bg-black/40 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <Camera size={18} />
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </label>
            </div>
            <div className="text-center sm:text-left space-y-1">
              <h3 className="text-sm font-bold text-slate-800">Profile Photo</h3>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                Clear portrait photographs help build trust with prospective students. Supported formats: JPG, PNG.
              </p>
              <label className="inline-block mt-2">
                <span className="text-xs text-primary font-bold hover:underline cursor-pointer">Change Image</span>
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </label>
            </div>
          </div>
        </Card>

        {/* Pricing, Experience, Availability stats fields */}
        <Card className="p-6">
          <CardTitle className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 mb-5">
            Lesson Configuration
          </CardTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Hourly Pricing Rate (Naira - ₦)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 25.00"
                value={pricing}
                onChange={(e) => setPricing(e.target.value)}
                className="h-11 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Teaching Experience (Years/Text)
              </label>
              <Input
                type="text"
                placeholder="e.g. 5 Years, Ijazah Certified"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="h-11 rounded-xl text-xs"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Availability Schedule Overview
              </label>
              <Input
                type="text"
                placeholder="e.g. Mon-Fri 4PM - 9PM GMT"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="h-11 rounded-xl text-xs"
              />
            </div>
          </div>
        </Card>

        {/* Specialized Subjects checkbox */}
        <Card className="p-6">
          <CardTitle className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 mb-5">
            Specialized Subjects
          </CardTitle>
          <div className="flex gap-3 flex-wrap">
            {AVAILABLE_SUBJECTS.map((sub) => {
              const isSelected = selectedSubjects.includes(sub.value);
              return (
                <button
                  type="button"
                  key={sub.value}
                  onClick={() => handleSubjectToggle(sub.value)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    isSelected
                      ? "bg-primary border-primary text-white shadow-sm"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {sub.label}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Biography text area */}
        <Card className="p-6">
          <CardTitle className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 mb-5">
            Biography
          </CardTitle>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Introduce Yourself (Max 2000 characters)
            </label>
            <textarea
              placeholder="Tell students about your teaching method, background, education, and learning philosophy..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={2000}
              className="w-full h-44 p-4 text-xs border-2 border-slate-200 rounded-xl focus:border-primary focus:outline-none resize-none leading-relaxed"
            />
          </div>
        </Card>

        {/* Qualifications and Certificate files upload */}
        <Card className="p-6">
          <CardTitle className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 mb-5 flex justify-between items-center">
            <span>Uploaded Certificates</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddQual}
              className="rounded-lg h-9 text-xs font-bold gap-1"
            >
              <Plus size={14} />
              Add Certificate
            </Button>
          </CardTitle>

          <div className="space-y-4">
            {/* Existing certificates list */}
            {existingQuals.map((qual) => (
              <div
                key={qual.id}
                className="flex items-center justify-between p-3 border border-slate-100 bg-slate-50/50 rounded-xl"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="text-primary shrink-0" size={16} />
                  <span className="text-xs text-slate-700 font-semibold">{qual.title}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveExistingQual(qual.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            {/* New certificates to upload list */}
            {newQuals.map((qual) => (
              <div
                key={qual.id}
                className="p-4 border-2 border-dashed border-slate-200 rounded-xl space-y-3 bg-slate-50/20"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    New Certificate
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveNewQual(qual.id)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Certificate Title
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. Hafiz Certificate"
                      value={qual.title}
                      onChange={(e) => handleUpdateNewQual(qual.id, { title: e.target.value })}
                      className="h-10 rounded-lg text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Document File (PDF / Image)
                    </label>
                    {qual.file ? (
                      <div className="h-10 px-3 border border-slate-200 bg-white rounded-lg flex items-center justify-between text-xs text-slate-600">
                        <span className="truncate max-w-[200px] font-medium">{qual.fileName}</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateNewQual(qual.id, { file: null, fileName: "" })}
                          className="text-red-500 hover:text-red-700"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <label className="h-10 px-3 border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-lg flex items-center justify-center gap-1.5 bg-white text-xs text-slate-500 cursor-pointer transition-colors font-medium">
                        <Upload size={14} />
                        Choose File
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              handleUpdateNewQual(qual.id, { file: f, fileName: f.name });
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {existingQuals.length === 0 && newQuals.length === 0 && (
              <div className="text-center py-6 text-slate-400 text-xs italic">
                No certificate qualifications uploaded yet. Add certificates to increase profile credibility!
              </div>
            )}
          </div>
        </Card>

        {/* Submit Form action buttons */}
        <div className="flex gap-4 justify-end pt-2">
          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="rounded-xl h-11 px-6 text-xs font-bold bg-gradient-to-r from-primary to-green-700 text-white"
          >
            {updateMutation.isPending ? "Saving Profile..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
