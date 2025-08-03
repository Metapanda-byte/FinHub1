'use client';

import React, { useRef } from 'react';
import { FinHubIQLogo } from '@/components/ui/finhubiq-logo';

// Connected1 component - exactly from logo variants
const Connected1 = ({ size = 60, primaryColor = '#ffffff', accentColor = '#f97316' }: {
  size?: number;
  primaryColor?: string;
  accentColor?: string;
}) => (
  <svg viewBox="0 0 60 60" width={size} height={size}>
    <line x1="20" y1="40" x2="30" y2="30" stroke={primaryColor} strokeWidth="1" />
    <line x1="30" y1="30" x2="40" y2="20" stroke={accentColor} strokeWidth="2" />
    <circle cx="20" cy="40" r="3" fill={primaryColor} />
    <circle cx="30" cy="30" r="4" fill={primaryColor} />
    <circle cx="40" cy="20" r="5" fill={accentColor} />
  </svg>
);

// Simple high-resolution logo component - exactly matching variants structure
const SimpleLogoExport = ({ 
  variant, 
  background,
  size = 800 
}: {
  variant: 'light' | 'dark';
  background: string;
  size?: number;
}) => {
  const primaryColor = variant === 'light' ? '#1f2937' : '#ffffff';
  const textColor = variant === 'light' ? '#1f2937' : '#ffffff';
  
  return (
    <div 
      style={{ 
        width: `${size}px`, 
        height: `${size}px`, 
        backgroundColor: background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px'
      }}
    >
      {/* EXACT replica of logo variants structure: flex items-center gap-2 */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', // gap-2 = 0.5rem = 8px
        transform: 'scale(2.5)'
      }}>
        <Connected1 
          size={40}
          primaryColor={primaryColor}
          accentColor="#f97316"
        />
        {/* EXACT replica: flex items-center space-x-1 */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center'
        }}>
          <span style={{ 
            fontSize: '20px', // text-xl = 1.25rem = 20px
            fontWeight: '500', // font-medium
            color: textColor,
            fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
            marginRight: '4px' // space-x-1 = 0.25rem = 4px
          }}>
            FinHub
          </span>
          <span style={{ 
            fontSize: '20px', // text-xl = 1.25rem = 20px
            fontWeight: '700', // font-bold
            color: '#f97316',
            fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif'
          }}>
            IQ
          </span>
        </div>
      </div>
    </div>
  );
};

// Icon-only version for large format downloads
const SimpleIconExport = ({ 
  variant, 
  background,
  size = 800 
}: {
  variant: 'light' | 'dark';
  background: string;
  size?: number;
}) => {
  const primaryColor = variant === 'light' ? '#1f2937' : '#ffffff';
  
  return (
    <div 
      style={{ 
        width: `${size}px`, 
        height: `${size}px`, 
        backgroundColor: background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '100px'
      }}
    >
      <Connected1 
        size={600}
        primaryColor={primaryColor}
        accentColor="#f97316"
      />
    </div>
  );
};

export default function SimpleLogoDownload() {
  // Full logo refs
  const lightLogoRef = useRef<HTMLDivElement>(null);
  const lightTransparentLogoRef = useRef<HTMLDivElement>(null);
  const darkLogoRef = useRef<HTMLDivElement>(null);
  
  // Icon-only refs
  const lightIconRef = useRef<HTMLDivElement>(null);
  const lightTransparentIconRef = useRef<HTMLDivElement>(null);
  const darkIconRef = useRef<HTMLDivElement>(null);

  const downloadAsImage = async (element: HTMLDivElement | null, filename: string) => {
    if (!element) {
      alert('Element not found. Please try again.');
      return;
    }

    try {
      // Small delay to ensure element is fully rendered
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const { default: html2canvas } = await import('html2canvas');
      
      console.log('Capturing element:', element);
      console.log('Element dimensions:', element.offsetWidth, element.offsetHeight);
      
      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: true,
        width: 800,
        height: 800
      });
      
      console.log('Canvas created:', canvas.width, canvas.height);
      
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png', 1.0);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Download triggered for:', filename);
    } catch (error) {
      console.error('Error generating image:', error);
      alert(`Error generating image: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Download FinHubIQ Brand Assets
          </h1>
          <p className="text-xl text-gray-600">
            High-resolution PNG files including full logos and icon-only versions in light, dark, and transparent variants
          </p>
        </div>

        {/* Logo Downloads */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          
          {/* Light Mode Logo */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Light Mode Logo</h3>
            <div className="border rounded-lg p-4 mb-4 bg-white flex justify-center">
              <div style={{ transform: 'scale(0.3)' }}>
                <FinHubIQLogo variant="black" size="large" />
              </div>
            </div>
            {/* Off-screen rendering element */}
            <div ref={lightLogoRef} style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
              <SimpleLogoExport variant="light" background="#ffffff" />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => downloadAsImage(lightLogoRef.current, 'finhubiq-logo-light.png')}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
              >
                Download PNG
              </button>
              <span className="text-sm text-gray-500 flex items-center">800×800px</span>
            </div>
          </div>

          {/* Light Mode Transparent Logo */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Light Mode (Transparent)</h3>
            <div className="border rounded-lg p-4 mb-4 bg-gray-50 flex justify-center" style={{ backgroundImage: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' }}>
              <div style={{ transform: 'scale(0.3)' }}>
                <FinHubIQLogo variant="black" size="large" />
              </div>
            </div>
            {/* Off-screen rendering element */}
            <div ref={lightTransparentLogoRef} style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
              <SimpleLogoExport variant="light" background="transparent" />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => downloadAsImage(lightTransparentLogoRef.current, 'finhubiq-logo-light-transparent.png')}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
              >
                Download PNG
              </button>
              <span className="text-sm text-gray-500 flex items-center">800×800px</span>
            </div>
          </div>

          {/* Dark Mode Logo */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Dark Mode Logo</h3>
            <div className="border rounded-lg p-4 mb-4 bg-gray-900 flex justify-center">
              <div style={{ transform: 'scale(0.3)' }}>
                <FinHubIQLogo variant="primary" size="large" />
              </div>
            </div>
            {/* Off-screen rendering element */}
            <div ref={darkLogoRef} style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
              <SimpleLogoExport variant="dark" background="#1f2937" />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => downloadAsImage(darkLogoRef.current, 'finhubiq-logo-dark.png')}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
              >
                Download PNG
              </button>
              <span className="text-sm text-gray-500 flex items-center">800×800px</span>
            </div>
          </div>

        </div>

        {/* Icon-Only Downloads */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Icon Only Downloads</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Light Mode Icon */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Light Mode Icon</h3>
              <div className="border rounded-lg p-4 mb-4 bg-white flex justify-center">
                <div style={{ transform: 'scale(0.15)' }}>
                  <Connected1 size={40} primaryColor="#1f2937" accentColor="#f97316" />
                </div>
              </div>
              {/* Off-screen rendering element */}
              <div ref={lightIconRef} style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                <SimpleIconExport variant="light" background="#ffffff" />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => downloadAsImage(lightIconRef.current, 'finhubiq-icon-light.png')}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                >
                  Download PNG
                </button>
                <span className="text-sm text-gray-500 flex items-center">800×800px</span>
              </div>
            </div>

            {/* Light Mode Transparent Icon */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Light Mode Icon (Transparent)</h3>
              <div className="border rounded-lg p-4 mb-4 bg-gray-50 flex justify-center" style={{ backgroundImage: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' }}>
                <div style={{ transform: 'scale(0.15)' }}>
                  <Connected1 size={40} primaryColor="#1f2937" accentColor="#f97316" />
                </div>
              </div>
              {/* Off-screen rendering element */}
              <div ref={lightTransparentIconRef} style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                <SimpleIconExport variant="light" background="transparent" />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => downloadAsImage(lightTransparentIconRef.current, 'finhubiq-icon-light-transparent.png')}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                >
                  Download PNG
                </button>
                <span className="text-sm text-gray-500 flex items-center">800×800px</span>
              </div>
            </div>

            {/* Dark Mode Icon */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Dark Mode Icon</h3>
              <div className="border rounded-lg p-4 mb-4 bg-gray-900 flex justify-center">
                <div style={{ transform: 'scale(0.15)' }}>
                  <Connected1 size={40} primaryColor="#ffffff" accentColor="#f97316" />
                </div>
              </div>
              {/* Off-screen rendering element */}
              <div ref={darkIconRef} style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                <SimpleIconExport variant="dark" background="#1f2937" />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => downloadAsImage(darkIconRef.current, 'finhubiq-icon-dark.png')}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                >
                  Download PNG
                </button>
                <span className="text-sm text-gray-500 flex items-center">800×800px</span>
              </div>
            </div>

          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Usage Instructions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Full Logo Versions</h4>
              <ul className="text-blue-800 space-y-1 text-sm">
                <li>• <strong>Light Mode:</strong> Dark logo on white background</li>
                <li>• <strong>Light Transparent:</strong> Dark logo on transparent background</li>
                <li>• <strong>Dark Mode:</strong> White logo on dark background</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Icon-Only Versions</h4>
              <ul className="text-blue-800 space-y-1 text-sm">
                <li>• <strong>Light Icon:</strong> Dark icon on white background</li>
                <li>• <strong>Light Transparent:</strong> Dark icon on transparent background</li>
                <li>• <strong>Dark Icon:</strong> White icon on dark background</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-blue-200">
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>• <strong>Resolution:</strong> 800×800px at high scale for crisp, professional output</li>
              <li>• <strong>Format:</strong> PNG with proper transparency support</li>
              <li>• <strong>Use Cases:</strong> Websites, presentations, social media, print materials, app icons</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}