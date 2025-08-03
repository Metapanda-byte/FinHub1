'use client';

import React, { useRef } from 'react';
import { FinHubIQLogo, FinHubIQLogoGlow, FinHubIQLogoAnimated, FinHubIQLogoWithBackground } from '@/components/ui/finhubiq-logo';
import { cn } from '@/lib/utils';

// Social media specific components for downloads
const LinkedInBanner = ({ variant }: { variant: 'light' | 'dark' }) => {
  const bg = variant === 'dark' ? '#1f2937' : '#ffffff';
  const textColor = variant === 'dark' ? '#ffffff' : '#1f2937';
  
  return (
    <div style={{ 
      width: '1584px', 
      height: '396px', 
      backgroundColor: bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '60px',
      padding: '40px'
    }}>
      <div style={{ transform: 'scale(2.5)' }}>
        <FinHubIQLogo 
          variant={variant === 'dark' ? 'primary' : 'black'} 
          size="large"
        />
      </div>
      <div style={{ color: textColor, textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', fontWeight: 'bold', margin: '0 0 20px 0' }}>
          Financial Intelligence
        </h1>
        <p style={{ fontSize: '24px', margin: 0, opacity: 0.8 }}>
          Connected insights for smarter investments
        </p>
      </div>
    </div>
  );
};

const TwitterHeader = ({ variant }: { variant: 'light' | 'dark' }) => {
  const bg = variant === 'dark' ? 
    'linear-gradient(135deg, #1f2937 0%, #374151 100%)' : 
    'linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)';
  const textColor = variant === 'dark' ? '#ffffff' : '#1f2937';
  
  return (
    <div style={{ 
      width: '1500px', 
      height: '500px', 
      background: bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '50px',
      padding: '40px'
    }}>
      <div style={{ transform: 'scale(2.2)' }}>
        <FinHubIQLogo 
          variant={variant === 'dark' ? 'primary' : 'black'} 
          size="large"
        />
      </div>
      <div style={{ color: textColor, textAlign: 'center' }}>
        <h1 style={{ fontSize: '42px', fontWeight: 'bold', margin: '0 0 16px 0' }}>
          FinHubIQ
        </h1>
        <p style={{ fontSize: '20px', margin: 0, opacity: 0.8 }}>
          Connecting financial data for intelligent growth
        </p>
      </div>
    </div>
  );
};

const InstagramPost = ({ variant }: { variant: 'light' | 'dark' }) => {
  const bg = variant === 'dark' ? '#1f2937' : '#ffffff';
  const textColor = variant === 'dark' ? '#ffffff' : '#1f2937';
  
  return (
    <div style={{ 
      width: '1080px', 
      height: '1080px', 
      backgroundColor: bg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px',
      textAlign: 'center'
    }}>
      <div style={{ transform: 'scale(3)', marginBottom: '80px' }}>
        <FinHubIQLogo 
          variant={variant === 'dark' ? 'primary' : 'black'} 
          size="large"
        />
      </div>
      <h1 style={{ 
        fontSize: '48px', 
        fontWeight: 'bold', 
        margin: '0 0 30px 0',
        color: textColor
      }}>
        Smart Financial Insights
      </h1>
      <p style={{ 
        fontSize: '28px', 
        margin: 0, 
        opacity: 0.8,
        color: textColor,
        lineHeight: 1.4
      }}>
        Connecting data points for better investment decisions
      </p>
    </div>
  );
};

export default function BrandAssetsPage() {
  // Refs for downloadable components
  const linkedinLightRef = useRef<HTMLDivElement>(null);
  const linkedinDarkRef = useRef<HTMLDivElement>(null);
  const twitterLightRef = useRef<HTMLDivElement>(null);
  const twitterDarkRef = useRef<HTMLDivElement>(null);
  const instagramLightRef = useRef<HTMLDivElement>(null);
  const instagramDarkRef = useRef<HTMLDivElement>(null);

  const downloadAsImage = async (element: HTMLDivElement | null, filename: string) => {
    if (!element) return;

    try {
      const { default: html2canvas } = await import('html2canvas');
      
      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false
      });
      
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png', 1.0);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Error generating image. Please try again.');
    }
  };

  const DownloadButton = ({ 
    onClick, 
    children, 
    variant = 'primary' 
  }: { 
    onClick: () => void; 
    children: React.ReactNode;
    variant?: 'primary' | 'secondary';
  }) => (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2 rounded-lg font-medium transition-colors text-sm',
        variant === 'primary' 
          ? 'bg-orange-500 text-white hover:bg-orange-600' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      )}
    >
      {children}
    </button>
  );
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">FinHubIQ Brand Assets</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional marketing materials and brand guidelines for FinHubIQ&apos;s connected growth identity
          </p>
        </div>

        {/* Hero Logo Section */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-16 mb-16 text-center">
          <div className="flex justify-center mb-8">
            <FinHubIQLogoGlow variant="primary" size="large" animated={true} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Connected Intelligence</h2>
          <p className="text-gray-300 text-lg">Empowering financial growth through intelligent connections</p>
        </div>

        {/* Logo Variations */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Logo Variations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Primary Logo */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border">
              <div className="text-center mb-6">
                <div className="bg-gray-900 rounded-lg p-8 mb-4">
                  <FinHubIQLogo variant="primary" size="medium" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Primary Logo</h3>
                <p className="text-sm text-gray-600">Main brand identity for dark backgrounds</p>
              </div>
            </div>

            {/* White Logo */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border">
              <div className="text-center mb-6">
                <div className="bg-gray-100 rounded-lg p-8 mb-4 border">
                  <FinHubIQLogo variant="black" size="medium" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Light Background</h3>
                <p className="text-sm text-gray-600">For light backgrounds and documents</p>
              </div>
            </div>

            {/* Icon Only */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border">
              <div className="text-center mb-6">
                <div className="bg-gray-900 rounded-lg p-8 mb-4">
                  <FinHubIQLogo variant="icon" size="medium" showText={false} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Icon Only</h3>
                <p className="text-sm text-gray-600">Compact version for small spaces</p>
              </div>
            </div>

          </div>
        </div>

        {/* Business Cards */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Business Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Dark Business Card */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Executive Dark</h3>
              <div className="bg-gray-900 rounded-lg p-6 w-80 h-48 flex flex-col justify-between mx-auto">
                <div className="flex justify-between items-start">
                  <FinHubIQLogo variant="primary" size="small" />
                  <div className="text-right">
                    <div className="text-white text-sm font-medium">John Smith</div>
                    <div className="text-orange-500 text-xs">CEO & Founder</div>
                  </div>
                </div>
                <div className="text-white text-xs space-y-1">
                  <div>john@finhubiq.com</div>
                  <div>+1 (555) 123-4567</div>
                  <div>www.finhubiq.com</div>
                </div>
              </div>
            </div>

            {/* Light Business Card */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Light</h3>
              <div className="bg-white border-2 border-gray-200 rounded-lg p-6 w-80 h-48 flex flex-col justify-between mx-auto">
                <div className="flex justify-between items-start">
                  <FinHubIQLogo variant="black" size="small" />
                  <div className="text-right">
                    <div className="text-gray-900 text-sm font-medium">Sarah Johnson</div>
                    <div className="text-orange-500 text-xs">Head of Analytics</div>
                  </div>
                </div>
                <div className="text-gray-600 text-xs space-y-1">
                  <div>sarah@finhubiq.com</div>
                  <div>+1 (555) 123-4568</div>
                  <div>www.finhubiq.com</div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Letterhead */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Letterhead & Documents</h2>
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-2xl mx-auto">
              <div className="flex justify-between items-start mb-8">
                <FinHubIQLogo variant="black" size="medium" />
                <div className="text-right text-sm text-gray-600">
                  <div>123 Financial District</div>
                  <div>New York, NY 10001</div>
                  <div>contact@finhubiq.com</div>
                </div>
              </div>
              <div className="border-t border-orange-500 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Analysis Report</h3>
                <div className="space-y-4 text-sm text-gray-600">
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                  <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Downloadable Social Media Assets */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Downloadable Social Media Assets</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* LinkedIn Banner */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">LinkedIn Banner</h3>
              <div className="border rounded-lg p-2 mb-4 overflow-hidden">
                <div ref={linkedinLightRef} className="hidden">
                  <LinkedInBanner variant="light" />
                </div>
                <div ref={linkedinDarkRef} className="hidden">
                  <LinkedInBanner variant="dark" />
                </div>
                <div style={{ transform: 'scale(0.2)', transformOrigin: 'top left', width: '316px', height: '79px' }}>
                  <LinkedInBanner variant="light" />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <DownloadButton 
                  onClick={() => downloadAsImage(linkedinLightRef.current, 'finhubiq-linkedin-light.png')}
                >
                  Light Mode
                </DownloadButton>
                <DownloadButton 
                  onClick={() => downloadAsImage(linkedinDarkRef.current, 'finhubiq-linkedin-dark.png')}
                  variant="secondary"
                >
                  Dark Mode
                </DownloadButton>
                <span className="text-sm text-gray-500 flex items-center">1584×396px</span>
              </div>
            </div>

            {/* Twitter Header */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Twitter Header</h3>
              <div className="border rounded-lg p-2 mb-4 overflow-hidden">
                <div ref={twitterLightRef} className="hidden">
                  <TwitterHeader variant="light" />
                </div>
                <div ref={twitterDarkRef} className="hidden">
                  <TwitterHeader variant="dark" />
                </div>
                <div style={{ transform: 'scale(0.2)', transformOrigin: 'top left', width: '300px', height: '100px' }}>
                  <TwitterHeader variant="light" />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <DownloadButton 
                  onClick={() => downloadAsImage(twitterLightRef.current, 'finhubiq-twitter-light.png')}
                >
                  Light Mode
                </DownloadButton>
                <DownloadButton 
                  onClick={() => downloadAsImage(twitterDarkRef.current, 'finhubiq-twitter-dark.png')}
                  variant="secondary"
                >
                  Dark Mode
                </DownloadButton>
                <span className="text-sm text-gray-500 flex items-center">1500×500px</span>
              </div>
            </div>

            {/* Instagram Post */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Instagram Post</h3>
              <div className="border rounded-lg p-2 mb-4 overflow-hidden">
                <div ref={instagramLightRef} className="hidden">
                  <InstagramPost variant="light" />
                </div>
                <div ref={instagramDarkRef} className="hidden">
                  <InstagramPost variant="dark" />
                </div>
                <div style={{ transform: 'scale(0.15)', transformOrigin: 'top left', width: '162px', height: '162px' }}>
                  <InstagramPost variant="light" />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <DownloadButton 
                  onClick={() => downloadAsImage(instagramLightRef.current, 'finhubiq-instagram-light.png')}
                >
                  Light Mode
                </DownloadButton>
                <DownloadButton 
                  onClick={() => downloadAsImage(instagramDarkRef.current, 'finhubiq-instagram-dark.png')}
                  variant="secondary"
                >
                  Dark Mode
                </DownloadButton>
                <span className="text-sm text-gray-500 flex items-center">1080×1080px</span>
              </div>
            </div>

          </div>
        </div>

        {/* Presentation Slides */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Presentation Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Title Slide */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Title Slide</h3>
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-8 aspect-[16/9] flex flex-col justify-center items-center text-center">
                <FinHubIQLogoGlow variant="primary" size="large" className="mb-6" />
                <h4 className="text-white text-2xl font-bold mb-2">Q4 Market Analysis</h4>
                <p className="text-gray-300">Connecting the dots in financial markets</p>
                <div className="mt-6 text-orange-500 text-sm">December 2024 • FinHubIQ Research</div>
              </div>
            </div>

            {/* Content Slide */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Slide</h3>
              <div className="bg-white border border-gray-200 rounded-lg p-6 aspect-[16/9] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-xl font-bold text-gray-900">Key Performance Indicators</h4>
                  <FinHubIQLogo variant="black" size="small" />
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-600">
                    <div className="text-4xl font-bold text-orange-500 mb-2">+24.5%</div>
                    <div>Portfolio Growth</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Email Signature */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Email Signature</h2>
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto border">
              <div className="flex items-center space-x-4 mb-4">
                <FinHubIQLogo variant="black" size="small" showText={false} />
                <div>
                  <div className="font-semibold text-gray-900">Alex Thompson</div>
                  <div className="text-sm text-orange-500">Senior Financial Analyst</div>
                </div>
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <div className="flex items-center space-x-2">
                  <span>📧</span>
                  <span>alex@finhubiq.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>📱</span>
                  <span>+1 (555) 123-4569</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>🌐</span>
                  <span>www.finhubiq.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Brand Guidelines */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Brand Guidelines</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Colors */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Brand Colors</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-500 rounded-lg"></div>
                  <div>
                    <div className="font-medium">Primary Orange</div>
                    <div className="text-sm text-gray-600">#F97316</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-900 rounded-lg"></div>
                  <div>
                    <div className="font-medium">Primary Dark</div>
                    <div className="text-sm text-gray-600">#111827</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white border border-gray-300 rounded-lg"></div>
                  <div>
                    <div className="font-medium">Primary Light</div>
                    <div className="text-sm text-gray-600">#FFFFFF</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Typography */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Typography</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">FinHub</div>
                  <div className="text-sm text-gray-600">Medium weight, standard spacing</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-500 mb-1">IQ</div>
                  <div className="text-sm text-gray-600">Bold weight, wider spacing</div>
                </div>
                <div className="text-sm text-gray-500 border-t pt-4">
                  Use system fonts: Inter, SF Pro, Roboto
                </div>
              </div>
            </div>

            {/* Logo Usage */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Logo Usage</h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-start space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Maintain clear space around logo</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Use high contrast backgrounds</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-red-500">✗</span>
                  <span>Don&apos;t distort or stretch</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-red-500">✗</span>
                  <span>Don&apos;t change colors arbitrarily</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Download Section */}
        <div className="text-center bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready-to-Use Social Media Assets</h2>
          <p className="text-xl mb-8 text-orange-100">
            High-resolution PNG files optimized for LinkedIn, Twitter, and Instagram - available in both light and dark modes
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto text-sm mb-8">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="font-semibold">LinkedIn Banner</div>
              <div className="text-orange-100">1584×396px</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="font-semibold">Twitter Header</div>
              <div className="text-orange-100">1500×500px</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="font-semibold">Instagram Post</div>
              <div className="text-orange-100">1080×1080px</div>
            </div>
          </div>
          <p className="text-orange-100">
            Simply click the download buttons above to get your files. Each asset comes in both light and dark mode variants.
          </p>
        </div>

      </div>
    </div>
  );
}