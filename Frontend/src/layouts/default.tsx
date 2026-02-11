import { Navbar } from "@/components/Navbar";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col min-h-screen bg-[#F4F4F5]">
      <Navbar />
      <main className="container mx-auto max-w-full px-12 flex-grow py-8">
        {children}
      </main>
    </div>
  );
}
