import type { Priority, Status } from "@/lib/societydesk";
import {
  fetchComplaintsServerFn,
  fetchComplaintByIdServerFn,
  fetchComplaintHistoryServerFn,
  fetchComplaintCommentsServerFn,
  fetchNoticesServerFn,
  addComplaintCommentServerFn,
  addResolutionFeedbackServerFn,
  updateComplaintStatusServerFn,
  fetchOverdueThresholdsServerFn,
  updateOverdueThresholdServerFn,
  createNoticeServerFn,
  deleteNoticeServerFn,
  assignComplaintServerFn,
} from "./complaints.functions";

export {
  fetchComplaintsServerFn,
  fetchComplaintByIdServerFn,
  fetchComplaintHistoryServerFn,
  fetchComplaintCommentsServerFn,
  fetchNoticesServerFn,
  addComplaintCommentServerFn,
  addResolutionFeedbackServerFn,
  updateComplaintStatusServerFn,
  fetchOverdueThresholdsServerFn,
  updateOverdueThresholdServerFn,
  createNoticeServerFn,
  deleteNoticeServerFn,
  assignComplaintServerFn,
};

export type ComplaintRow = {
  id: string;
  resident_id: string;
  assigned_to?: string | null;
  category: string;
  title: string;
  description: string;
  location: string | null;
  status: Status;
  priority: Priority;
  is_overdue: boolean;
  created_at: string;
  resolved_at: string | null;
  profiles?: {
    full_name: string;
    unit_number: string | null;
    block: string | null;
    phone: string | null;
  } | null;
  assigned_profile?: {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    role: string;
  } | null;
  complaint_photos?: { id: string; storage_path: string }[];
};

export async function fetchComplaints(
  opts: {
    residentId?: string;
    assignedTo?: string;
    unassignedOnly?: boolean;
    status?: string;
    category?: string;
    priority?: string;
    block?: string;
    search?: string;
  } = {},
) {
  const data = await fetchComplaintsServerFn({ data: opts });
  return (data ?? []) as unknown as ComplaintRow[];
}

export async function fetchComplaint(id: string) {
  const data = await fetchComplaintByIdServerFn({ data: { id } });
  return data as unknown as ComplaintRow | null;
}

export type HistoryRow = {
  id: string;
  old_status: Status | null;
  new_status: Status | null;
  note: string | null;
  created_at: string;
  actor_id: string | null;
  profiles?: { full_name: string; role: string } | null;
};

export async function fetchHistory(complaintId: string) {
  const data = await fetchComplaintHistoryServerFn({ data: { complaintId } });
  return (data ?? []) as unknown as HistoryRow[];
}

export type CommentRow = {
  id: string;
  comment: string;
  created_at: string;
  author_id: string;
  profiles?: { full_name: string; role: string } | null;
};

export async function fetchComments(complaintId: string) {
  const data = await fetchComplaintCommentsServerFn({ data: { complaintId } });
  return (data ?? []) as unknown as CommentRow[];
}

export async function fetchNotices() {
  const data = await fetchNoticesServerFn();
  return (data ?? []) as unknown as {
    id: string;
    title: string;
    body: string;
    is_important: boolean;
    created_at: string;
    profiles?: { full_name: string } | null;
  }[];
}

export function photoUrl(path: string) {
  return path;
}
