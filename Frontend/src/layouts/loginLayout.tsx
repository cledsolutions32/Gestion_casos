import { Logo } from "@/components/icons";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#F4F4F5]">
      <div className="flex flex-col items-center justify-center mb-8">
        <Logo size={100} />
      </div>
      <div className="flex flex-col items-center justify-center w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
