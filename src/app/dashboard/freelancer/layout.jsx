import Sidebar from "@/components/dashboard/Sidebar";
import FreelancerSidebar from "@/components/dashboard/freelancerDashboard/FreelancerSidebar";

export default function DashboardLayout({
  children,
}) {
  return (
    <div className="flex min-h-screen bg-black text-white">
      <FreelancerSidebar />

      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}