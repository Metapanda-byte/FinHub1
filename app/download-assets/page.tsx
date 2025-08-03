'use client';

import React, { useRef } from 'react';
import { FinHubIQLogo } from '@/components/ui/finhubiq-logo';
import { cn } from '@/lib/utils';

// High-resolution logo component for export
const HighResLogo = ({ 
  variant, 
  background, 
  width = 1200, 
  height = 400,
  showText = true 
}: {
  variant: 'light' | 'dark';
  background: string;
  width?: number;
  height?: number;
  showText?: boolean;
}) => {
  return (
    <div 
      style={{ 
        width: `${width}px`, 
        height: `${height}px`, 
        backgroundColor: background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px'
      }}
    >
      <div style={{ transform: 'scale(3)' }}>
        <FinHubIQLogo 
          variant={variant === 'dark' ? 'primary' : 'black'} 
          size="large" 
          showText={showText}
        />
      </div>
    </div>
  );
};

// Social media specific components
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

const ProfilePicture = ({ variant }: { variant: 'light' | 'dark' }) => {
  const bg = variant === 'dark' ? '#1f2937' : '#ffffff';
  
  return (
    <div style={{ 
      width: '800px', 
      height: '800px', 
      backgroundColor: bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '400px',
      border: variant === 'light' ? '8px solid #f3f4f6' : 'none'
    }}>
      <div style={{ transform: 'scale(3)' }}>
        <FinHubIQLogo 
          variant={variant === 'dark' ? 'primary' : 'black'} 
          size="large"
          showText={false}
        />
      </div>
    </div>
  );
};

export default function DownloadAssetsPage() {
  const logoLightRef = useRef<HTMLDivElement>(null);
  const logoDarkRef = useRef<HTMLDivElement>(null);
  const logoIconLightRef = useRef<HTMLDivElement>(null);
  const logoIconDarkRef = useRef<HTMLDivElement>(null);
  const linkedinLightRef = useRef<HTMLDivElement>(null);
  const linkedinDarkRef = useRef<HTMLDivElement>(null);
  const twitterLightRef = useRef<HTMLDivElement>(null);
  const twitterDarkRef = useRef<HTMLDivElement>(null);
  const instagramLightRef = useRef<HTMLDivElement>(null);
  const instagramDarkRef = useRef<HTMLDivElement>(null);
  const profileLightRef = useRef<HTMLDivElement>(null);
  const profileDarkRef = useRef<HTMLDivElement>(null);

  const downloadAsImage = async (element: HTMLDivElement | null, filename: string) => {
    if (!element) return;

    try {
      // Dynamic import to avoid SSR issues
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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Download Brand Assets
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            High-resolution PNG files ready for social media, presentations, and marketing materials
          </p>
        </div>

        {/* Logo Files */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Logo Files</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Full Logo Light */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Full Logo - Light Mode</h3>
              <div className="border rounded-lg p-4 mb-4 bg-white">
                <div ref={logoLightRef} className="hidden">
                  <HighResLogo variant="light" background="#ffffff" />
                </div>
                <div className="flex justify-center">
                  <FinHubIQLogo variant="black" size="medium" />
                </div>
              </div>
              <div className="flex gap-2">
                <DownloadButton 
                  onClick={() => downloadAsImage(logoLightRef.current, 'finhubiq-logo-light.png')}
                >
                  Download PNG
                </DownloadButton>
                <span className="text-sm text-gray-500 flex items-center">1200×400px</span>
              </div>
            </div>

            {/* Full Logo Dark */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Full Logo - Dark Mode</h3>
              <div className="border rounded-lg p-4 mb-4 bg-gray-900">
                <div ref={logoDarkRef} className="hidden">
                  <HighResLogo variant="dark" background="#1f2937" />
                </div>
                <div className="flex justify-center">
                  <FinHubIQLogo variant="primary" size="medium" />
                </div>
              </div>
              <div className="flex gap-2">
                <DownloadButton 
                  onClick={() => downloadAsImage(logoDarkRef.current, 'finhubiq-logo-dark.png')}
                >
                  Download PNG
                </DownloadButton>
                <span className="text-sm text-gray-500 flex items-center">1200×400px</span>
              </div>
            </div>

            {/* Icon Only Light */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Icon Only - Light Mode</h3>
              <div className="border rounded-lg p-4 mb-4 bg-white">
                <div ref={logoIconLightRef} className="hidden">
                  <HighResLogo variant="light" background="#ffffff" width={800} height={800} showText={false} />
                </div>
                <div className="flex justify-center">
                  <FinHubIQLogo variant="black" size="medium" showText={false} />
                </div>
              </div>
              <div className="flex gap-2">
                <DownloadButton 
                  onClick={() => downloadAsImage(logoIconLightRef.current, 'finhubiq-icon-light.png')}
                >
                  Download PNG
                </DownloadButton>
                <span className="text-sm text-gray-500 flex items-center">800×800px</span>
              </div>
            </div>

            {/* Icon Only Dark */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Icon Only - Dark Mode</h3>
              <div className="border rounded-lg p-4 mb-4 bg-gray-900">
                <div ref={logoIconDarkRef} className="hidden">
                  <HighResLogo variant="dark" background="#1f2937" width={800} height={800} showText={false} />
                </div>
                <div className="flex justify-center">
                  <FinHubIQLogo variant="primary" size="medium" showText={false} />
                </div>
              </div>
              <div className="flex gap-2">
                <DownloadButton 
                  onClick={() => downloadAsImage(logoIconDarkRef.current, 'finhubiq-icon-dark.png')}
                >
                  Download PNG
                </DownloadButton>
                <span className="text-sm text-gray-500 flex items-center">800×800px</span>
              </div>
            </div>

          </div>
        </div>

        {/* Social Media Assets */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Social Media Assets</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* LinkedIn Banner */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">LinkedIn Banner</h3>
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
              <div className="flex gap-2">
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
              <h3 className="text-lg font-semibold mb-4">Twitter Header</h3>
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
              <div className="flex gap-2">
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
              <h3 className="text-lg font-semibold mb-4">Instagram Post</h3>
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
              <div className="flex gap-2">
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

            {/* Profile Picture */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Profile Picture</h3>
              <div className="border rounded-lg p-2 mb-4 overflow-hidden">
                <div ref={profileLightRef} className="hidden">
                  <ProfilePicture variant="light" />
                </div>
                <div ref={profileDarkRef} className="hidden">
                  <ProfilePicture variant="dark" />
                </div>
                <div style={{ transform: 'scale(0.15)', transformOrigin: 'top left', width: '120px', height: '120px' }}>
                  <ProfilePicture variant="light" />
                </div>
              </div>
              <div className="flex gap-2">
                <DownloadButton 
                  onClick={() => downloadAsImage(profileLightRef.current, 'finhubiq-profile-light.png')}
                >
                  Light Mode
                </DownloadButton>
                <DownloadButton 
                  onClick={() => downloadAsImage(profileDarkRef.current, 'finhubiq-profile-dark.png')}
                  variant="secondary"
                >
                  Dark Mode
                </DownloadButton>
                <span className="text-sm text-gray-500 flex items-center">800×800px</span>
              </div>
            </div>

          </div>
        </div>

        {/* Download All Section */}
        <div className="text-center bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Quick Download</h2>
          <p className="text-xl mb-8 text-orange-100">
            Download individual assets using the buttons above, optimized for each platform
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto text-sm">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="font-semibold">LinkedIn</div>
              <div className="text-orange-100">1584×396px</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="font-semibold">Twitter</div>
              <div className="text-orange-100">1500×500px</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="font-semibold">Instagram</div>
              <div className="text-orange-100">1080×1080px</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="font-semibold">Profile</div>
              <div className="text-orange-100">800×800px</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}