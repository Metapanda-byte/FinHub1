import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";

export default function Plans() {
  return (
    <div className="min-h-screen">
      {/* Plans Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h1 className="text-4xl font-bold mb-4">Simple, transparent pricing</h1>
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
            <Button size="lg" className="bg-finhub-orange hover:bg-finhub-orange/90 text-white" asChild>
              <Link href="/dashboard">Try Dashboard for Free</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
} 