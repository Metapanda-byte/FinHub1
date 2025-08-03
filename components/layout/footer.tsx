"use client";

import Link from "next/link";
import { FinHubIQLogo } from "@/components/ui/finhubiq-logo";
import { useTheme } from "next-themes";
import { Github, Twitter, Linkedin, Mail, Globe } from "lucide-react";

export default function Footer() {
  const { theme } = useTheme();

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
      name: "GitHub",
      href: "https://github.com/finhubiq",
      icon: Github,
    },
    {
      name: "Email",
      href: "mailto:contact@finhubiq.com",
      icon: Mail,
    },
    {
      name: "Website",
      href: "https://finhubiq.com",
      icon: Globe,
    },
  ];

  const footerLinks = [
    {
      title: "Product",
      links: [
        { name: "Dashboard", href: "/dashboard" },
        { name: "Plans", href: "/plans" },
        { name: "Features", href: "#features" },
        { name: "API", href: "#api" },
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
      title: "Resources",
      links: [
        { name: "Documentation", href: "#docs" },
        { name: "Help Center", href: "#help" },
        { name: "Privacy Policy", href: "#privacy" },
        { name: "Terms of Service", href: "#terms" },
      ],
    },
  ];

  return (
    <footer className="bg-background border-t border-border">
      <div className="px-mobile py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center mb-4">
              <FinHubIQLogo variant={theme === 'light' ? 'black' : 'primary'} size="small" />
            </Link>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              Professional financial analysis and investment research platform powered by AI.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                  title={social.name}
                >
                  <social.icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {footerLinks.map((section) => (
            <div key={section.title} className="col-span-1">
              <h3 className="font-semibold text-sm mb-3">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} FinHubIQ. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Made with McLaren Orange</span>
            <div className="w-3 h-3 bg-[hsl(var(--finhub-orange))] rounded-full"></div>
          </div>
        </div>
      </div>
    </footer>
  );
}