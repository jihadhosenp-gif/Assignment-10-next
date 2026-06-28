// app/(admin)/layout.jsx  ← আপনার admin layout যেখানেই থাকুক
import { requireRole } from "@/lib/core/session";

const AdminLayout = async ({ children }) => {
  await requireRole("admin");   // ← "recruiter" ছিল, "admin" করুন
  return children;
};

export default AdminLayout;