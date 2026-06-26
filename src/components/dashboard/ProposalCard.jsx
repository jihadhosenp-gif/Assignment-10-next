"use client";

import { useSession } from "@/lib/auth-client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Check,
  X,
  User,
  DollarSign,
  Clock,
  FileText,
  AlertCircle,
  Inbox,
  Calendar,
  RefreshCw,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.35, ease: "easeOut" },
  }),
};

function formatBudget(value) {
  const num = Number(value);
  return isNaN(num) ? "—" : "$" + num.toLocaleString();
}

function formatDate(value) {
  if (!value) return "—";
  const dateStr = value?.$date || value;
  const d = new Date(dateStr);
  return isNaN(d) ? "—" : d.toISOString().split("T")[0];
}

export default function ManageProposalsPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const clientEmail = session?.user?.email;
  const router = useRouter();

  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  // Helper function to get clean ID string from MongoDB format
  const getCleanId = (obj) => {
    if (!obj) return "";
    return obj?.$oid || obj?.toString() || obj;
  };

  // Fetch proposals submitted for this client's tasks
  const fetchProposals = useCallback(async () => {
    if (!clientEmail) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API_BASE}/api/proposals/client/${clientEmail}`);
      setProposals(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load proposals.");
    } finally {
      setLoading(false);
    }
  }, [clientEmail]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  // Handle Accept - Redirect to dashboard payments
  const handleAccept = (proposal) => {
    const pId = getCleanId(proposal._id);
    
    // Check if another proposal for the same taskId is already accepted
    const isAnyAlreadyAccepted = proposals.some(
      (p) => p.taskId === proposal.taskId && p.status === "accepted"
    );

    if (isAnyAlreadyAccepted) {
      alert("You have already accepted a proposal for this task.");
      return;
    }

    setProcessingId(pId);
    
    localStorage.setItem("pending_accept_proposal", JSON.stringify({
      proposalId: pId,
      taskId: proposal.taskId
    }));

    // 🎯 এখানে রাউট পরিবর্তন করে নতুন ড্যাশবোর্ড পেমেন্ট রাউটে রিডাইরেক্ট করা হলো
    router.push(`/dashboard/client/payments?proposalId=${pId}&amount=${proposal.proposed_budget}`);
  };

  // Handle Reject - Call API to update status to "rejected"
  const handleReject = async (proposal) => {
    const pId = getCleanId(proposal._id);
    if (!confirm("Are you sure you want to reject this proposal?")) return;

    setProcessingId(pId);
    try {
      await axios.patch(`${API_BASE}/api/proposals/${pId}/status`, {
        status: "rejected",
      });
      
      // Update local state instantly
      setProposals((prev) =>
        prev.map((p) => {
          const currentId = getCleanId(p._id);
          return currentId === pId ? { ...p, status: "rejected" } : p;
        })
      );
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to reject proposal.");
    } finally {
      setProcessingId(null);
    }
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0B0F] text-[#9CA3AF] text-sm">
        Loading session…
      </div>
    );
  }

  if (!clientEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0B0F] text-[#9CA3AF] text-sm">
        Please log in to manage proposals.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-[#F5F7FA] py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div 
          variants={fadeUp} 
          initial="hidden" 
          animate="visible" 
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/[0.05] pb-6"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F7FA]">
              Manage Received Proposals
            </h1>
            <p className="text-[#9CA3AF] text-sm mt-1">
              Review application details, notes, budgets and accept or reject freelancers.
            </p>
          </div>
        </motion.div>

        {/* Content Body */}
        {error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-6 text-center space-y-4">
            <AlertCircle size={32} className="text-red-400 mx-auto" />
            <p className="text-[#F5F7FA] font-medium">{error}</p>
            <button onClick={fetchProposals} className="inline-flex items-center gap-2 text-xs bg-white/[0.05] border border-white/[0.1] px-4 py-2 rounded-xl text-white hover:bg-white/[0.1] transition-all">
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        ) : loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-44 rounded-2xl bg-white/[0.03] border border-white/[0.06] animate-pulse" />
            ))}
          </div>
        ) : proposals.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 text-center space-y-4">
            <Inbox size={40} className="text-[#9CA3AF] mx-auto opacity-40" />
            <div>
              <p className="text-[#F5F7FA] font-semibold text-base">No proposals received yet</p>
              <p className="text-[#9CA3AF] text-xs mt-1">When freelancers apply to your job posts, they will appear here.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {proposals.map((proposal, idx) => {
                const pId = getCleanId(proposal._id);
                const isProcessing = processingId === pId;
                
                // Check if any proposal for the SAME task is already accepted
                const isTaskClosed = proposals.some(
                  (p) => p.taskId === proposal.taskId && p.status === "accepted"
                );

                return (
                  <motion.div
                    key={pId}
                    custom={idx}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, x: -20 }}
                    className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-5 sm:p-6 relative overflow-hidden"
                  >
                    {/* Status corner badge for non-pending items */}
                    {proposal.status !== "pending" && (
                      <div className={`absolute top-0 right-0 px-4 py-1 text-[10px] font-bold uppercase rounded-bl-xl tracking-wider 
                        ${proposal.status === "accepted" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}
                      >
                        {proposal.status}
                      </div>
                    )}

                    <div className="flex flex-col gap-4">
                      {/* Job Title & Freelancer Profile */}
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#7C6BF8] block mb-1">
                          Job Post: {proposal.taskTitle || "Untitled Task"}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center border border-white/[0.1]">
                            <User size={13} className="text-[#9CA3AF]" />
                          </div>
                          <div>
                            <h3 className="text-[#F5F7FA] font-semibold text-base leading-tight">
                              {proposal.freelancer_name}
                            </h3>
                            <p className="text-[11px] text-[#9CA3AF]">{proposal.freelancer_email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Cover Note / Application Text */}
                      {proposal.cover_note && (
                        <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3.5">
                          <span className="text-[10px] uppercase text-[#9CA3AF] font-medium block mb-1 flex items-center gap-1">
                            <FileText size={11} /> Application Message
                          </span>
                          <p className="text-sm text-[#D1D5DB] leading-relaxed whitespace-pre-line">
                            {proposal.cover_note}
                          </p>
                        </div>
                      )}

                      {/* Proposal Metrics & Actions */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2 border-t border-white/[0.05]">
                        
                        {/* Meta Spec Box */}
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1.5">
                            <DollarSign size={15} className="text-emerald-400" />
                            <div>
                              <p className="text-[10px] uppercase text-[#9CA3AF] font-medium leading-none">Bid Price</p>
                              <p className="text-[#F5F7FA] font-bold mt-0.5">{formatBudget(proposal.proposed_budget)}</p>
                            </div>
                          </div>

                          <div className="h-6 w-px bg-white/[0.08]" />

                          <div className="flex items-center gap-1.5">
                            <Clock size={15} className="text-amber-400" />
                            <div>
                              <p className="text-[10px] uppercase text-[#9CA3AF] font-medium leading-none">Delivery</p>
                              <p className="text-[#F5F7FA] font-medium mt-0.5">{proposal.estimated_days} Days</p>
                            </div>
                          </div>

                          <div className="h-6 w-px bg-white/[0.08]" />

                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-[#9CA3AF]" />
                            <div>
                              <p className="text-[10px] uppercase text-[#9CA3AF] font-medium leading-none">Applied</p>
                              <p className="text-[#9CA3AF] font-normal mt-0.5 text-xs">{formatDate(proposal.createdAt)}</p>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons render when status is 'pending' */}
                        {proposal.status === "pending" && (
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                              disabled={isProcessing || isTaskClosed}
                              onClick={() => handleReject(proposal)}
                              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-red-400 bg-red-400/10 border border-red-400/20 hover:bg-red-400/20 transition-all disabled:opacity-40"
                            >
                              <X size={13} /> Reject
                            </button>

                            <button
                              disabled={isProcessing || isTaskClosed}
                              onClick={() => handleAccept(proposal)}
                              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#7C6BF8] hover:bg-[#6C5CE7] transition-all shadow-md shadow-[#7C6BF8]/10 disabled:opacity-40 disabled:bg-neutral-800 disabled:text-neutral-500"
                              title={isTaskClosed ? "Another proposal is already accepted for this task" : ""}
                            >
                              <Check size={13} /> Accept & Pay
                            </button>
                          </div>
                        )}
                        
                        {/* Status Warnings */}
                        {proposal.status === "pending" && isTaskClosed && (
                          <span className="text-xs text-amber-400/70 flex items-center gap-1 italic">
                            <AlertCircle size={12} /> Another applicant was chosen
                          </span>
                        )}
                      </div>

                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}