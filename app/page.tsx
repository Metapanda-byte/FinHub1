"use client";

export const dynamic = 'force-dynamic';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, BarChartBig, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { cn } from "@/lib/utils";
import { FinHubIQLogo } from "@/components/ui/finhubiq-logo";

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showError, setShowError] = useState(false);
  const [reveal] = useState(true);
  
  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "auth_callback_error") {
      setShowError(true);
      // Remove error from URL
      const newUrl = window.location.pathname;
      router.push(newUrl);
    }
  }, [searchParams, router]);
  
  // Hero inline video (autoplay in browser)
  const testVideoUrl =
    "https://okatwepzvilznkyspxlg.supabase.co/storage/v1/object/public/images/Arearevised.mp4";

  // Product highlight video for split section
  const highlightVideoUrl =
    "https://okatwepzvilznkyspxlg.supabase.co/storage/v1/object/public/images/125_1440x60_shots_so.mp4";

  return (
    <div>
      {/* Auth Error Alert */}
      {showError && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <Alert variant="destructive" className="pr-12">
            <AlertDescription>
              There was an error signing in. Please try again.
            </AlertDescription>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={() => setShowError(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </Alert>
        </div>
      )}
      
      {/* Hero Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
              <span className="text-foreground">Fundamental Analysis.</span>{" "}
              <span className="text-foreground">Streamlined.</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              <span className="bg-gradient-to-r from-finhub-orange to-amber-500 bg-clip-text text-transparent">Next generation</span>{" "}
              equity research tools for {" "}
              <span className="bg-gradient-to-r from-finhub-orange to-amber-500 bg-clip-text text-transparent">every</span>{" "}
              investor
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="flex flex-col items-center">
                <Button size="lg" className="bg-finhub-orange hover:bg-finhub-orange/90 text-white text-base md:text-lg" asChild>
                  <Link href="/signup">Join the Waitlist</Link>
                </Button>
                <p className="text-xs mt-2" style={{ color: 'hsl(var(--finhub-orange))' }}>Launching soon — be first to get access</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <video
              className="rounded-lg shadow-2xl border w-full h-auto"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            >
              <source src={testVideoUrl} type="video/mp4" />
              <source src={testVideoUrl} type="video/quicktime" />
              <source src={testVideoUrl} type="video/webm" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </section>

      {/* Product Highlight Split Section (replaces previous Features Section) */}
      <section className="py-20">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            {/* Left: Tagline and brief copy */}
            <div className="flex flex-col justify-center gap-8 md:gap-10">
              <h2
                className={cn(
                  "text-4xl md:text-5xl lg:text-6xl font-bold leading-tight",
                  "bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text",
                  "transition-all duration-700",
                  reveal ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                )}
              >
                From Company deep-dives to{" "}
                <span className="bg-gradient-to-r from-finhub-orange to-orange-600 bg-clip-text text-transparent">
                  idea generation
                </span>{" "}
                at your fingertips
              </h2>
              
              <p
                className={cn(
                  "text-lg text-muted-foreground leading-relaxed",
                  "opacity-100 translate-y-0"
                )}
               >
                A modern equity research workstation that helps you explore companies, compare peers, and turn insights into action.
               </p>
                
               {/* Feature list with FinHub icons */}
               <div
                 className={cn(
                   "space-y-5",
                   "opacity-100 translate-y-0"
                 )}
               >
                {[
                  {
                    text: "Over 70,000 stocks and 30 years of data"
                  },
                  {
                    text: "Enhanced workflow with your own analyst team"
                  },
                  {
                    text: "Detailed peer benchmarking, historical financials, LBO analysis, DCF modelling made easy"
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                      <FinHubIQLogo variant="icon" className="w-5 h-5" />
                    </div>
                    <span className="text-sm md:text-base text-muted-foreground leading-relaxed">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Video with subtle styling */}
            <div className="relative w-full">
              <video
                className="rounded-lg shadow-2xl border w-full h-auto"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              >
                <source src={highlightVideoUrl} type="video/mp4" />
                <source src={highlightVideoUrl} type="video/quicktime" />
                <source src={highlightVideoUrl} type="video/webm" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of investors who trust FinHubIQ for their financial analysis needs
            </p>
            <div className="flex flex-col items-center">
              <Button size="lg" className="bg-finhub-orange hover:bg-finhub-orange/90 text-white" asChild>
                <Link href="/signup">Join the Waitlist</Link>
              </Button>
              <p className="text-xs mt-2" style={{ color: 'hsl(var(--finhub-orange))' }}>Free Access</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}