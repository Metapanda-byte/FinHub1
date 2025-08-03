import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, BarChartBig } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { DemoButton } from "@/components/ui/video-modal";

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
              Financial Analytics Platform for Investors
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
             Seamless tools. Informed decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="flex flex-col items-center">
                <Button size="lg" className="bg-finhub-orange hover:bg-finhub-orange/90 text-white" asChild>
                  <Link href="/dashboard">Launch Workstation</Link>
                </Button>
                <p className="text-xs text-muted-foreground mt-2">Free Access</p>
              </div>
              <DemoButton 
                videoUrl="https://okatwepzvilznkyspxlg.supabase.co/storage/v1/object/public/demo/Screen%20Recording%202025-08-02%20at%202.58.18%20AM.mov" 
                title="FinHubIQ Platform Demo"
              />
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent h-40 -bottom-1"></div>
            <Image
              src="https://okatwepzvilznkyspxlg.supabase.co/storage/v1/object/public/images/platformshot.png"
              alt="FinHubIQ Dashboard Preview"
              className="rounded-lg shadow-2xl border"
              width={1200}
              height={800}
              priority
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything you need to analyze the market</h2>
            <p className="text-muted-foreground">
              Powerful tools and insights to help you make data-driven investment decisions
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                title: "Real-time Market Data",
                description: "Access live market data, price movements, and trading volumes across global markets."
              },
              {
                title: "Advanced Analytics",
                description: "Comprehensive financial analysis tools including technical indicators and fundamental metrics."
              },
              {
                title: "Portfolio Tracking",
                description: "Monitor your investments with real-time portfolio tracking and performance analytics."
              },
              {
                title: "Custom Alerts",
                description: "Set up personalized alerts for price movements, volume spikes, and market events."
              },
              {
                title: "Research Tools",
                description: "Access company financials, earnings reports, and analyst recommendations."
              },
              {
                title: "Market Insights",
                description: "Get actionable insights and market analysis from industry experts."
              }
            ].map((feature, index) => (
              <Card key={index} className="p-6">
                <BarChartBig className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
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
                <Link href="/dashboard">Launch Workstation</Link>
              </Button>
              <p className="text-xs text-muted-foreground mt-2">Free Access</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}