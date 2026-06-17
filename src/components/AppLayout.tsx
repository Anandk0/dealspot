"use client";
import TopHeader from "./TopHeader";
import Sidebar from "./BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopHeader />
      <div className="flex pt-0">
        <Sidebar />
        <main className="flex-1 lg:ml-64">
          {children}
        </main>
      </div>
    </div>
  );
}
