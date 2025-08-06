"use client";

import Link from "next/link";
import { FinHubIQLogo } from "@/components/ui/finhubiq-logo";
import { useTheme } from "next-themes";
import { Twitter, Linkedin, Mail, ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Footer() {
  const { theme } = useTheme();
  const [openDropdowns, setOpenDropdowns] = useState<{ [key: string]: boolean }>({});

  const toggleDropdown = (section: string) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const socialLinks = [
    {
      name: "Twitter",
      href: "https://twitter.com/finhubiq",
      icon: Twitter,
    },
    {
      name: "LinkedIn",
      href: "https://linkedin.com/company/finhubiq",
      icon: Linkedin,
    },
    {
      name: "Email",
      href: "mailto:contact@finhubiq.com",
      icon: Mail,
    },
  ];

  const footerSections = [
    {
      title: "Resources",
      links: [
        { name: "Terms of Service", href: "#terms" },
        { name: "Privacy Policy", href: "#privacy" },
        { name: "Help Center", href: "#help" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About", href: "#about" },
        { name: "Blog", href: "#blog" },
        { name: "Careers", href: "#careers" },
        { name: "Contact", href: "#contact" },
      ],
    },
    {
      title: "Developers",
      links: [
        { name: "API", href: "#api" },
        { name: "Support", href: "#support" },
        { name: "Plans", href: "/plans" },
      ],
    },
  ];

  return (
    <footer className="bg-background border-t border-border">
      <div className="px-mobile py-4">
        {/* Main Footer Content */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          
          {/* Left: Brand + Social */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6">
            <Link href="/" className="flex items-center">
              <FinHubIQLogo variant={theme === 'light' ? 'black' : 'primary'} size="small" />
            </Link>
            
            <div className="flex gap-2">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-7 h-7 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                  title={social.name}
                >
                  <social.icon className="h-3.5 w-3.5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Right: Navigation Dropdowns (Mobile) / Inline (Desktop) */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-6">
            {footerSections.map((section) => (
              <div key={section.title} className="relative">
                {/* Mobile: Dropdown Button */}
                <button
                  onClick={() => toggleDropdown(section.title)}
                  className="lg:hidden flex items-center justify-between w-full py-2 text-sm font-medium text-left hover:text-foreground transition-colors"
                >
                  {section.title}
                  <ChevronDown className={cn(
                    "h-3 w-3 transition-transform",
                    openDropdowns[section.title] ? "rotate-180" : ""
                  )} />
                </button>

                {/* Desktop: Direct Link */}
                <div className="hidden lg:block">
                  <span className="text-sm font-medium text-muted-foreground">{section.title}</span>
                </div>

                {/* Mobile: Dropdown Content */}
                {openDropdowns[section.title] && (
                  <div className="lg:hidden mt-1 pl-2 space-y-1">
                    {section.links.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        className="block py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Copyright + Status */}
        <div className="mt-4 pt-3 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} FinHubIQ. All rights reserved.
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-muted-foreground">Status</span>
            </div>
            <span className="text-xs text-muted-foreground">
              We believe financial data should be accessible to everyone.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}