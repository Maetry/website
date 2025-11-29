import Image from "next/image";

import logo from "@/public/images/logo.svg";

interface LinkHandlerCardProps {
  children: React.ReactNode;
}

export const LinkHandlerCard = ({ children }: LinkHandlerCardProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#f6b68e] via-[#cf9bff] to-[#6672ff] px-4 py-10 sm:px-6 lg:px-8">
      <div
        className="absolute inset-0 -z-10 opacity-80"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35), transparent 55%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.25), transparent 55%)",
        }}
      />
      <div className="absolute inset-0 -z-20 bg-[url('/images/featureBG.svg')] bg-cover bg-center opacity-10" />

      <div className="relative w-full min-w-[280px] max-w-[400px] rounded-[36px] border border-white/40 bg-white/80 p-8 text-center shadow-[0_55px_120px_rgba(49,45,105,0.35)] backdrop-blur-2xl">
        {/* Логотип */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-[#f6b68e] via-[#cf9bff] to-[#6672ff] opacity-20 blur-xl" />
            <Image
              src={logo}
              alt="Maetry"
              className="relative h-12 w-auto dark:invert"
              priority
              width={120}
              height={48}
            />
          </div>
        </div>

        {children}
      </div>
    </div>
  );
};
