"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function GoogleConnectButton({ isConnected }: { isConnected: boolean }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/settings/team",
      });
    } catch {
      toast.error("Process failed");
      setIsLoading(false);
    }
  };

  if (isConnected) {
    return (
      <div className="flex items-center justify-between p-5 rounded-2xl bg-emerald-50 border border-emerald-100">
        <div>
          <span className="font-mono text-[9px] font-black text-emerald-600 uppercase tracking-widest block mb-1">Status // Sync</span>
          <p className="text-[13px] font-black text-emerald-700">GOOGLE CALENDAR ACTIVE</p>
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      </div>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isLoading}
      className="w-full h-14 bg-slate-900 hover:bg-blue-600 text-white font-black uppercase tracking-widest text-[11px] shadow-xl shadow-slate-200 rounded-2xl transition-all active:scale-95"
    >
      {isLoading ? "INITIALIZING..." : "CONNECT GOOGLE WORKSPACE //"}
    </Button>
  );
}
