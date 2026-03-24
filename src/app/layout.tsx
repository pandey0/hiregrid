import type { Metadata } from "next";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import "./globals.css";
import "@uploadthing/react/styles.css";

export const metadata: Metadata = {
  title: "HireGrid",
  description: "AI-powered hiring supply chain platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased scrollbar-hide">
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider delayDuration={300}>
            {children}
          </TooltipProvider>
          <Toaster 
            position="bottom-right" 
            toastOptions={{
              className: "arch-toast-container",
              style: {
                background: "transparent",
                border: "none",
                boxShadow: "none",
                padding: 0,
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
