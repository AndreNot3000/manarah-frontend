"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  listCompetitions, 
  createCompetitionAdmin, 
  updateCompetitionAdmin, 
  getCompetitionParticipantsAdmin, 
  publishResultsAdmin,
  generateCertificateAdmin,
  getRegistrationDocumentsAdmin,
  updatePaymentStatusAdmin,
  CompetitionListItem,
  CompetitionAdminInput
} from "@/lib/api";
import { Card, CardTitle, CardDescription, Button, Badge, Input } from "@/components/ui";
import { 
  Plus, Edit, Users, Trophy, Download, ChevronLeft, ChevronRight 
} from "lucide-react";

export default function AdminCompetitionsDashboard() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCompId, setEditingCompId] = useState<string | null>(null);
  const [viewingParticipantsId, setViewingParticipantsId] = useState<string | null>(null);
  const [publishingResultsId, setPublishingResultsId] = useState<string | null>(null);

  // Receipt Modal State
  const [reviewingReg, setReviewingReg] = useState<{ id: string; name: string } | null>(null);
  const [receiptDocs, setReceiptDocs] = useState<{ id: string; fileName: string; fileUrl: string }[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fee, setFee] = useState("0");
  const [deadline, setDeadline] = useState("");
  const [category, setCategory] = useState("Quran");
  const [type, setType] = useState("QURAN_RECITATION");
  const [status, setStatus] = useState("DRAFT");
  const [formError, setFormError] = useState<string | null>(null);

  // Winner selections state for Results
  const [winners, setWinners] = useState<{ userId: string; placement: number }[]>([]);

  // 1. Fetch competitions list
  const { data: compData, isLoading } = useQuery({
    queryKey: ["adminCompetitions", page],
    queryFn: () => listCompetitions({ page, limit }),
  });

  // 2. Fetch participants when drawer is open
  const { data: participantsData, isLoading: isParticipantsLoading } = useQuery({
    queryKey: ["competitionParticipants", viewingParticipantsId],
    queryFn: () => getCompetitionParticipantsAdmin(viewingParticipantsId!),
    enabled: !!viewingParticipantsId,
  });

  // 3. Fetch participants for results winner picker dropdown
  const { data: resultsParticipantsData } = useQuery({
    queryKey: ["competitionParticipants", publishingResultsId],
    queryFn: () => getCompetitionParticipantsAdmin(publishingResultsId!),
    enabled: !!publishingResultsId,
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (data: CompetitionAdminInput) => createCompetitionAdmin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCompetitions"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      setIsCreateOpen(false);
      clearForm();
    },
    onError: (err: Error) => {
      setFormError(err.message || "Failed to create competition.");
    }
  });

  // Edit Mutation
  const editMutation = useMutation({
    mutationFn: (data: { id: string; body: Partial<CompetitionAdminInput> }) => updateCompetitionAdmin(data.id, data.body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCompetitions"] });
      setEditingCompId(null);
      clearForm();
    },
    onError: (err: Error) => {
      setFormError(err.message || "Failed to update competition.");
    }
  });

  // Publish Results Mutation
  const publishResultsMutation = useMutation({
    mutationFn: (data: { id: string; winners: { userId: string; placement: number }[] }) =>
      publishResultsAdmin(data.id, { winners: data.winners }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCompetitions"] });
      setPublishingResultsId(null);
    },
  });
  
  // Award Certificate Mutation (FE-061)
  const awardCertificateMutation = useMutation({
    mutationFn: (data: { userId: string; competitionId: string; type: string }) =>
      generateCertificateAdmin(data),
    onSuccess: () => {
      alert("Certificate generated and awarded successfully! 🏆");
    },
    onError: (err: unknown) => {
      const error = err as Error;
      alert(`Failed to generate certificate: ${error.message}`);
    }
  });

  function handleAwardCertificate(userId: string, type: string) {
    if (!viewingParticipantsId) return;
    awardCertificateMutation.mutate({
      userId,
      competitionId: viewingParticipantsId,
      type
    });
  }

  async function handleOpenReceiptReview(regId: string, studentName: string) {
    if (!viewingParticipantsId) return;
    setReviewingReg({ id: regId, name: studentName });
    setLoadingDocs(true);
    try {
      const res = await getRegistrationDocumentsAdmin(viewingParticipantsId, regId);
      setReceiptDocs(res.documents);
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || "Failed to load receipt documents.");
    } finally {
      setLoadingDocs(false);
    }
  }

  async function handleUpdatePaymentStatus(status: "CONFIRMED" | "REJECTED") {
    if (!viewingParticipantsId || !reviewingReg) return;
    setUpdatingPayment(true);
    try {
      await updatePaymentStatusAdmin(viewingParticipantsId, reviewingReg.id, status);
      alert(`Payment successfully ${status === "CONFIRMED" ? "approved" : "rejected"}!`);
      setReviewingReg(null);
      // Refresh participants
      queryClient.invalidateQueries({ queryKey: ["competitionParticipants", viewingParticipantsId] });
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || "Failed to update payment status.");
    } finally {
      setUpdatingPayment(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center font-semibold text-primary animate-pulse text-lg">
          Loading competitions...
        </div>
      </div>
    );
  }

  const competitions = compData?.competitions || [];
  const meta = compData?.meta || { page: 1, limit: 10, total: 0 };
  const totalPages = Math.ceil(meta.total / limit) || 1;

  function clearForm() {
    setTitle("");
    setDescription("");
    setFee("0");
    setDeadline("");
    setCategory("Quran");
    setType("QURAN_RECITATION");
    setStatus("DRAFT");
    setFormError(null);
  }

  function handleOpenCreate() {
    clearForm();
    setIsCreateOpen(true);
  }

  function handleOpenEdit(comp: CompetitionListItem) {
    clearForm();
    setEditingCompId(comp.id);
    setTitle(comp.title);
    setDescription(comp.description);
    setFee(comp.fee);
    // Convert deadline date to YYYY-MM-DD for date input
    const d = new Date(comp.deadline);
    const dateStr = d.toISOString().substring(0, 10);
    setDeadline(dateStr);
    setCategory(comp.category);
    setType(comp.type);
    setStatus(comp.status);
  }

  function handleSubmitCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !description || !deadline) {
      setFormError("All fields are required.");
      return;
    }
    createMutation.mutate({
      title,
      description,
      fee,
      deadline: new Date(deadline).toISOString(),
      category,
      type,
      status
    });
  }

  function handleSubmitEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCompId) return;
    editMutation.mutate({
      id: editingCompId,
      body: {
        title,
        description,
        fee,
        deadline: new Date(deadline).toISOString(),
        category,
        type,
        status
      }
    });
  }

  // FE-052: Participant list CSV export
  function handleDownloadCSV() {
    if (!participantsData?.participants) return;
    const headers = ["Registration ID", "User ID", "Name", "Email", "Registration Status", "Payment Status", "Registered At"];
    const rows = participantsData.participants.map(p => [
      p.registrationId,
      p.userId,
      `"${p.name.replace(/"/g, '""')}"`,
      p.email,
      p.registrationStatus,
      p.paymentStatus,
      p.registeredAt
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `participants_${viewingParticipantsId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleAddWinnerRow() {
    setWinners(prev => [...prev, { userId: "", placement: prev.length + 1 }]);
  }

  function handleWinnerChange(index: number, userId: string) {
    setWinners(prev => {
      const copy = [...prev];
      copy[index].userId = userId;
      return copy;
    });
  }

  function handleWinnerPlacementChange(index: number, placement: number) {
    setWinners(prev => {
      const copy = [...prev];
      copy[index].placement = placement;
      return copy;
    });
  }

  function handlePublishResults() {
    if (!publishingResultsId) return;
    // Validate winner fields are completed
    const validWinners = winners.filter(w => w.userId !== "");
    publishResultsMutation.mutate({
      id: publishingResultsId,
      winners: validWinners
    });
  }

  return (
    <div className="space-y-6">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Competitions Admin</h1>
          <p className="text-sm text-neutral-muted mt-0.5">
            Manage events, download student registration CSVs, and publish leaderboard winners.
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="rounded-xl font-bold text-xs h-10 gap-1.5 shrink-0"
        >
          <Plus size={16} />
          Create Competition
        </Button>
      </div>

      {/* List Table */}
      {competitions.length === 0 ? (
        <Card className="p-8 text-center flex flex-col items-center justify-center border-dashed border-2">
          <span className="p-4 bg-slate-100 rounded-full text-slate-400 mb-4">
            <Trophy size={32} />
          </span>
          <CardTitle className="text-lg font-bold text-slate-700">No Competitions Created</CardTitle>
          <CardDescription className="max-w-xs mt-2 mx-auto">
            Get started by adding your first Quran recitation, Hifz, or quiz competition.
          </CardDescription>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <Card className="hidden md:block overflow-hidden border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-4 pl-6">Title</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Deadline</th>
                    <th className="p-4">Fee</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {competitions.map((comp) => {
                    const dateStr = new Date(comp.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                    return (
                      <tr key={comp.id} className="hover:bg-slate-50/50">
                        <td className="p-4 pl-6 font-bold text-slate-800 truncate max-w-[200px]">{comp.title}</td>
                        <td className="p-4 text-slate-500 font-medium">{comp.category}</td>
                        <td className="p-4 font-normal text-slate-500">{dateStr}</td>
                        <td className="p-4 font-normal text-slate-500">₦{comp.fee}</td>
                        <td className="p-4">
                          {comp.status === "OPEN" && (
                            <Badge className="bg-green-100 text-primary border-none font-bold text-[9px] px-2 py-0.5 rounded-lg">
                              OPEN
                            </Badge>
                          )}
                          {comp.status === "DRAFT" && (
                            <Badge className="bg-slate-100 text-slate-500 border-none font-bold text-[9px] px-2 py-0.5 rounded-lg">
                              DRAFT
                            </Badge>
                          )}
                          {comp.status === "CLOSED" && (
                            <Badge className="bg-red-100 text-red-800 border-none font-bold text-[9px] px-2 py-0.5 rounded-lg">
                              CLOSED
                            </Badge>
                          )}
                          {comp.status === "RESULTS_PUBLISHED" && (
                            <Badge className="bg-purple-100 text-purple-800 border-none font-bold text-[9px] px-2 py-0.5 rounded-lg">
                              RESULTS LIVE
                            </Badge>
                          )}
                        </td>
                        <td className="p-4 pr-6 text-right space-x-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenEdit(comp)}
                            className="rounded-lg text-[10px] font-bold h-8 px-2.5 gap-1 inline-flex items-center"
                          >
                            <Edit size={12} />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setViewingParticipantsId(comp.id)}
                            className="rounded-lg text-[10px] font-bold h-8 px-2.5 gap-1 inline-flex items-center"
                          >
                            <Users size={12} />
                            Participants
                          </Button>
                          {comp.status !== "RESULTS_PUBLISHED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setPublishingResultsId(comp.id);
                                setWinners([{ userId: "", placement: 1 }]);
                              }}
                              className="rounded-lg text-[10px] font-bold h-8 px-2.5 gap-1 inline-flex items-center border-purple-100 text-purple-700 hover:bg-purple-50"
                            >
                              <Trophy size={12} />
                              Results
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile Card List View */}
          <div className="space-y-4 md:hidden">
            {competitions.map((comp) => {
              const dateStr = new Date(comp.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
              return (
                <Card key={comp.id} className="p-4 border border-slate-200 space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-800 text-sm truncate leading-snug">{comp.title}</h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Badge className="bg-slate-100 text-slate-600 border-none font-bold text-[8px] px-1.5 py-0.5 rounded-md uppercase">
                          {comp.category}
                        </Badge>
                        <span className="text-[10px] text-slate-500 font-semibold">Fee: ₦{comp.fee}</span>
                      </div>
                    </div>
                    
                    <div>
                      {comp.status === "OPEN" && (
                        <Badge className="bg-green-100 text-primary border-none font-bold text-[8px] px-1.5 py-0.5 rounded-md">
                          OPEN
                        </Badge>
                      )}
                      {comp.status === "DRAFT" && (
                        <Badge className="bg-slate-100 text-slate-500 border-none font-bold text-[8px] px-1.5 py-0.5 rounded-md">
                          DRAFT
                        </Badge>
                      )}
                      {comp.status === "CLOSED" && (
                        <Badge className="bg-red-100 text-red-800 border-none font-bold text-[8px] px-1.5 py-0.5 rounded-md">
                          CLOSED
                        </Badge>
                      )}
                      {comp.status === "RESULTS_PUBLISHED" && (
                        <Badge className="bg-purple-100 text-purple-800 border-none font-bold text-[8px] px-1.5 py-0.5 rounded-md">
                          RESULTS
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 font-semibold pt-1 border-t border-slate-100 flex flex-col gap-2">
                    <div>Deadline: {dateStr}</div>
                    <div className="flex gap-2 flex-wrap pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenEdit(comp)}
                        className="rounded-lg text-[10px] font-bold h-8 flex-1 gap-1"
                      >
                        <Edit size={12} />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setViewingParticipantsId(comp.id)}
                        className="rounded-lg text-[10px] font-bold h-8 flex-1 gap-1"
                      >
                        <Users size={12} />
                        Participants
                      </Button>
                      {comp.status !== "RESULTS_PUBLISHED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setPublishingResultsId(comp.id);
                            setWinners([{ userId: "", placement: 1 }]);
                          }}
                          className="rounded-lg text-[10px] font-bold h-8 flex-1 gap-1 border-purple-100 text-purple-700 hover:bg-purple-50"
                        >
                          <Trophy size={12} />
                          Results
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <Button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                variant="outline"
                className="rounded-xl h-10 px-4 flex items-center gap-1 text-xs font-semibold"
              >
                <ChevronLeft size={16} />
                Previous
              </Button>
              <span className="text-xs font-semibold text-slate-600">
                Page {page} of {totalPages}
              </span>
              <Button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                variant="outline"
                className="rounded-xl h-10 px-4 flex items-center gap-1 text-xs font-semibold"
              >
                Next
                <ChevronRight size={16} />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <CardTitle className="text-base font-black text-slate-800">New Competition</CardTitle>
                <CardDescription className="text-xs">Publish a new competition event.</CardDescription>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
            </div>

            {formError && <div className="text-xs text-red-600 font-semibold">{formError}</div>}

            <form onSubmit={handleSubmitCreate} className="space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Title</span>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="rounded-xl h-10 text-xs font-medium" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Description</span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details..."
                  rows={3}
                  className="w-full border border-slate-200 hover:border-slate-300 rounded-xl p-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Fee (₦)</span>
                  <Input type="number" min="0" value={fee} onChange={(e) => setFee(e.target.value)} className="rounded-xl h-10 text-xs font-medium" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Deadline</span>
                  <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="rounded-xl h-10 text-xs font-medium" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Category name</span>
                  <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Quran recitation" className="rounded-xl h-10 text-xs font-medium" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Category type</span>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full h-10 border border-slate-200 rounded-xl px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="QURAN_RECITATION">Quran Recitation</option>
                    <option value="HIFZ">Hifz</option>
                    <option value="ISLAMIC_QUIZ">Islamic Quiz</option>
                    <option value="ARABIC_COMPETITION">Arabic Language</option>
                    <option value="ESSAY_COMPETITION">Essay Writing</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Status</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-10 border border-slate-200 rounded-xl px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="OPEN">OPEN</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="rounded-xl h-10 text-xs font-bold px-4">Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending} className="rounded-xl h-10 text-xs font-bold px-5 bg-primary text-white">Create</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Edit Modal */}
      {editingCompId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <CardTitle className="text-base font-black text-slate-800">Edit Competition</CardTitle>
                <CardDescription className="text-xs">Update competition details.</CardDescription>
              </div>
              <button onClick={() => setEditingCompId(null)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
            </div>

            {formError && <div className="text-xs text-red-600 font-semibold">{formError}</div>}

            <form onSubmit={handleSubmitEdit} className="space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Title</span>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="rounded-xl h-10 text-xs font-medium" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Description</span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details..."
                  rows={3}
                  className="w-full border border-slate-200 hover:border-slate-300 rounded-xl p-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Fee (₦)</span>
                  <Input type="number" min="0" value={fee} onChange={(e) => setFee(e.target.value)} className="rounded-xl h-10 text-xs font-medium" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Deadline</span>
                  <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="rounded-xl h-10 text-xs font-medium" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Category name</span>
                  <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Quran recitation" className="rounded-xl h-10 text-xs font-medium" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Category type</span>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full h-10 border border-slate-200 rounded-xl px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="QURAN_RECITATION">Quran Recitation</option>
                    <option value="HIFZ">Hifz</option>
                    <option value="ISLAMIC_QUIZ">Islamic Quiz</option>
                    <option value="ARABIC_COMPETITION">Arabic Language</option>
                    <option value="ESSAY_COMPETITION">Essay Writing</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Status</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-10 border border-slate-200 rounded-xl px-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="OPEN">OPEN</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setEditingCompId(null)} className="rounded-xl h-10 text-xs font-bold px-4">Cancel</Button>
                <Button type="submit" disabled={editMutation.isPending} className="rounded-xl h-10 text-xs font-bold px-5 bg-primary text-white">Save Changes</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Viewing Participants Drawer Modal (FE-052 CSV export) */}
      {viewingParticipantsId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-xl w-full p-6 space-y-4 shadow-xl border border-slate-200 overflow-y-auto max-h-[85vh]">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <CardTitle className="text-base font-black text-slate-800">
                  Registered Participants ({participantsData?.total || 0})
                </CardTitle>
                <CardDescription className="text-xs">
                  Review student registrations and payment status reports.
                </CardDescription>
              </div>
              <button onClick={() => setViewingParticipantsId(null)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
            </div>

            {isParticipantsLoading ? (
              <div className="text-center py-10 text-xs font-semibold text-primary animate-pulse">
                Fetching participant records...
              </div>
            ) : !participantsData?.participants || participantsData.participants.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400 font-semibold">
                No students registered for this competition yet.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button
                    onClick={handleDownloadCSV}
                    className="h-9 px-3 rounded-lg text-xs font-bold gap-1 bg-green-50 border border-green-200 text-green-700 hover:bg-green-100"
                  >
                    <Download size={14} />
                    Export CSV Report
                  </Button>
                </div>

                <div className="max-h-[300px] overflow-y-auto border rounded-xl divide-y divide-slate-100">
                  {participantsData.participants.map(p => (
                    <div key={p.registrationId} className="p-3 flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs">
                      <div>
                        <span className="font-bold text-slate-800 block">{p.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{p.email}</span>
                      </div>
                      <div className="flex flex-col sm:items-end gap-2 shrink-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge className="bg-slate-100 text-slate-600 font-bold border-none text-[8px]">
                            {p.registrationStatus}
                          </Badge>
                          <Badge className={p.paymentStatus === "CONFIRMED" ? "bg-green-100 text-primary border-none font-bold text-[8px]" : "bg-amber-100 text-amber-800 border-none font-bold text-[8px]"}>
                            {p.paymentStatus}
                          </Badge>
                          {p.paymentStatus !== "CONFIRMED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenReceiptReview(p.registrationId, p.name)}
                              className="h-6 px-2 text-[9px] font-bold rounded bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                            >
                              Review Receipt
                            </Button>
                          )}
                        </div>
                        
                        <div className="flex items-center w-full sm:w-auto">
                          <select
                            onChange={(e) => {
                              const type = e.target.value;
                              if (type) {
                                handleAwardCertificate(p.userId, type);
                                e.target.value = "";
                              }
                            }}
                            className="h-7 border border-slate-200 rounded-md text-[9px] font-bold px-1.5 focus:outline-none w-full sm:w-auto"
                          >
                            <option value="">Award Certificate</option>
                            <option value="PARTICIPATION">Participation</option>
                            <option value="ACHIEVEMENT">Achievement</option>
                            <option value="WINNER">Winner</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Publish Results Modal (FE-052 Winners list) */}
      {publishingResultsId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 overflow-y-auto max-h-[85vh]">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <CardTitle className="text-base font-black text-slate-800">Publish Placements Leaderboard</CardTitle>
                <CardDescription className="text-xs">
                  Set placement ranks for qualified registered participants.
                </CardDescription>
              </div>
              <button onClick={() => setPublishingResultsId(null)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-3">
                {winners.map((winner, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <div className="flex-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Select Student</span>
                      <select
                        value={winner.userId}
                        onChange={(e) => handleWinnerChange(idx, e.target.value)}
                        className="w-full h-10 border border-slate-200 rounded-xl px-3 text-xs font-semibold focus:outline-none"
                      >
                        <option value="">-- Choose Participant --</option>
                        {resultsParticipantsData?.participants?.map(p => (
                          <option key={p.userId} value={p.userId}>{p.name} ({p.email})</option>
                        ))}
                      </select>
                    </div>

                    <div className="w-20">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Placement</span>
                      <Input
                        type="number"
                        min="1"
                        value={winner.placement}
                        onChange={(e) => handleWinnerPlacementChange(idx, parseInt(e.target.value, 10) || 1)}
                        className="rounded-xl h-10 text-xs font-bold text-center"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setWinners(prev => prev.filter((_, i) => i !== idx))}
                      className="text-red-500 font-bold hover:underline self-end pb-3 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddWinnerRow}
                  className="h-9 px-3 rounded-lg text-xs font-bold"
                >
                  + Add Winner Row
                </Button>

                <div className="space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPublishingResultsId(null)}
                    className="h-9 px-3 rounded-lg text-xs font-bold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handlePublishResults}
                    disabled={publishResultsMutation.isPending}
                    className="h-9 px-4 rounded-lg text-xs font-bold bg-primary text-white"
                  >
                    {publishResultsMutation.isPending ? "Publishing..." : "Publish Results"}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Receipt Review Modal */}
      {reviewingReg && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <Card className="max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <CardTitle className="text-base font-black text-slate-800">
                  Review Payment Receipt
                </CardTitle>
                <CardDescription className="text-xs">
                  Verify payment receipt documents submitted by {reviewingReg.name}.
                </CardDescription>
              </div>
              <button onClick={() => setReviewingReg(null)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
            </div>

            {loadingDocs ? (
              <div className="text-center py-10 text-xs font-semibold text-primary animate-pulse">
                Loading receipt documents...
              </div>
            ) : receiptDocs.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400 font-semibold">
                No documents uploaded for this registration.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2 max-h-[300px] overflow-y-auto border rounded-xl p-3 bg-slate-50/50">
                  {receiptDocs.map(doc => (
                    <div key={doc.id} className="p-3 bg-white border border-slate-100 rounded-lg flex flex-col gap-2 shadow-sm">
                      <span className="text-xs font-bold text-slate-700 truncate block">{doc.fileName}</span>
                      {doc.fileUrl.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                        <div className="relative aspect-[4/3] w-full border rounded bg-slate-100 overflow-hidden">
                          <img src={doc.fileUrl} alt={doc.fileName} className="object-contain w-full h-full" />
                        </div>
                      ) : (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-blue-600 font-semibold hover:underline block"
                        >
                          Open document in new tab →
                        </a>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setReviewingReg(null)}
                    disabled={updatingPayment}
                    className="rounded-xl h-10 text-xs font-bold px-4"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleUpdatePaymentStatus("REJECTED")}
                    disabled={updatingPayment}
                    className="rounded-xl h-10 text-xs font-bold px-5 bg-red-100 text-red-700 hover:bg-red-200 border-none"
                  >
                    Reject Receipt
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleUpdatePaymentStatus("CONFIRMED")}
                    disabled={updatingPayment}
                    className="rounded-xl h-10 text-xs font-bold px-5 bg-green-600 text-white hover:bg-green-700"
                  >
                    {updatingPayment ? "Approving..." : "Approve & Confirm"}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

    </div>
  );
}
