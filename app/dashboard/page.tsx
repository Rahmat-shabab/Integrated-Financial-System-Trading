import Sidebar from "@/components/sidebar";
export default function DashboardPage() {
  return (
    <div className="min-h-min bg-gray-50">
      <Sidebar currentPath="/dashboard" />
    </div>
  );
}
