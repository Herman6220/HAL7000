"use client"
import Navbar from "@/components/Navbar";
import { HomeSidebar } from "@/components/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

interface HomeLayoutProps{
    children: React.ReactNode;
}

export default function HomeLayout({children}: HomeLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex w-full">
        <HomeSidebar />
        <main className="w-full flex flex-col">
          <Navbar />
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
