import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, BarChartBig } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
              Professional Financial Analytics for Modern Investors
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Comprehensive financial analysis, real-time market data, and advanced visualization tools to make informed investment decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/dashboard">Try Dashboard</Link>
              </Button>
              <Button size="lg" variant="outline">
                Watch Demo
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent h-40 -bottom-1"></div>
            <img
              src="https://images.pexels.com/photos/7567434/pexels-photo-7567434.jpeg"
              alt="Dashboard Preview"
              className="rounded-lg shadow-2xl border"
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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

      {/* Pricing Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-muted-foreground">
              Choose the plan that best fits your needs
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Starter",
                price: "Free",
                description: "Perfect for exploring and learning",
                features: [
                  "Basic market data",
                  "Limited historical data",
                  "5 watchlists",
                  "Basic charts",
                  "Email support"
                ]
              },
              {
                name: "Pro",
                price: "$29",
                description: "Everything you need for serious trading",
                features: [
                  "Real-time market data",
                  "Full historical data",
                  "Unlimited watchlists",
                  "Advanced charts",
                  "Priority support",
                  "Custom alerts",
                  "Portfolio analytics"
                ]
              },
              {
                name: "Enterprise",
                price: "Custom",
                description: "For professional trading teams",
                features: [
                  "Everything in Pro",
                  "API access",
                  "Custom integrations",
                  "Dedicated support",
                  "Team collaboration",
                  "Advanced analytics",
                  "Custom reporting"
                ]
              }
            ].map((plan, index) => (
              <Card key={index} className={`p-8 ${index === 1 ? 'border-primary' : ''}`}>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.price !== "Custom" && <span className="text-muted-foreground">/month</span>}
                </div>
                <p className="text-muted-foreground mb-6">{plan.description}</p>
                <Button className="w-full mb-6" variant={index === 1 ? "default" : "outline"}>
                  {index === 0 ? "Get Started" : index === 1 ? "Subscribe" : "Contact Sales"}
                </Button>
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
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
            <Button size="lg" asChild>
              <Link href="/dashboard">Try Dashboard for Free</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}