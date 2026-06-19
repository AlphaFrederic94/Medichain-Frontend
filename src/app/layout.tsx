'use client';

import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>AfriHealth Chain — Electronic Health Records</title>
        <meta
          name="description"
          content="Blockchain-secured health records with patient-controlled consent, built for Africa's healthcare future."
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <QueryClientProvider client={queryClient}>
          <TooltipProvider delayDuration={200}>
            {children}
          </TooltipProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
