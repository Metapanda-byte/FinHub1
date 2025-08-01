'use client';

import React, { useState, useEffect } from 'react';

interface KenshiAvatarProps {
  state?: 'idle' | 'listening' | 'thinking' | 'talking';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function KenshiAvatar({ state = 'idle', size = 'md', className = '' }: KenshiAvatarProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState(0);

  // Random blinking animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, 3000 + Math.random() * 4000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Breathing animation
  useEffect(() => {
    const breathingInterval = setInterval(() => {
      setBreathingPhase(prev => (prev + 1) % 100);
    }, 60);

    return () => clearInterval(breathingInterval);
  }, []);

  const sizeMap = {
    sm: { width: '64px', height: '64px' },
    md: { width: '96px', height: '96px' }, 
    lg: { width: '128px', height: '128px' },
    xl: { width: '192px', height: '192px' }
  };

  const currentSize = sizeMap[size];
  const breathingScale = 1 + Math.sin(breathingPhase * 0.08) * 0.015;

  return (
    <div 
      className={`relative inline-flex items-center justify-center ${className}`}
      style={currentSize}
    >
      <svg
        viewBox="0 0 200 200"
        width="100%"
        height="100%"
        style={{
          filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.25))',
          transform: `scale(${state === 'listening' ? 1.05 : 1}) scale(${breathingScale})`,
          transition: 'transform 0.3s ease'
        }}
      >
        {/* Professional Gradients and Effects */}
        <defs>
          {/* Kabuto Helmet - Deep Iron */}
          <radialGradient id="helmetGrad" cx="0.3" cy="0.2" r="1.2">
            <stop offset="0%" stopColor="#4a5568" />
            <stop offset="30%" stopColor="#2d3748" />
            <stop offset="70%" stopColor="#1a202c" />
            <stop offset="100%" stopColor="#0f1419" />
          </radialGradient>

          {/* Gold Maedate Crest */}
          <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffd700" />
            <stop offset="30%" stopColor="#ffed4a" />
            <stop offset="70%" stopColor="#f6ad55" />
            <stop offset="100%" stopColor="#dd6b20" />
          </linearGradient>

          {/* Crimson Armor Plates */}
          <linearGradient id="armorGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e53e3e" />
            <stop offset="30%" stopColor="#c53030" />
            <stop offset="70%" stopColor="#9b2c2c" />
            <stop offset="100%" stopColor="#742a2a" />
          </linearGradient>

          {/* Face Mask - Dark Iron */}
          <linearGradient id="menpoGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2d3748" />
            <stop offset="50%" stopColor="#1a202c" />
            <stop offset="100%" stopColor="#0f1419" />
          </linearGradient>

          {/* Glowing Eyes */}
          <radialGradient id="eyeGlow" cx="0.5" cy="0.5" r="0.8">
            <stop offset="0%" stopColor="#ff6b6b" />
            <stop offset="40%" stopColor="#ff5252" />
            <stop offset="70%" stopColor="#f44336" />
            <stop offset="100%" stopColor="#d32f2f" />
          </radialGradient>

          {/* Professional Highlights */}
          <linearGradient id="highlight" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>

          {/* Mystical Aura */}
          <radialGradient id="auraGrad" cx="0.5" cy="0.5" r="1">
            <stop offset="0%" stopColor="rgba(255, 107, 107, 0.1)" />
            <stop offset="50%" stopColor="rgba(244, 67, 54, 0.05)" />
            <stop offset="100%" stopColor="rgba(211, 47, 47, 0)" />
          </radialGradient>

          {/* Shadow Filter */}
          <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="rgba(0,0,0,0.3)"/>
          </filter>
        </defs>

        {/* Mystical aura base */}
        <circle cx="100" cy="100" r="95" fill="url(#auraGrad)" opacity="0.6" />

        {/* Shadow base */}
        <ellipse cx="100" cy="185" rx="50" ry="10" fill="rgba(0,0,0,0.15)" />

        {/* Professional Samurai Character */}
        <g style={{
          transform: state === 'thinking' ? 'scale(1.02)' : 'scale(1)',
          transition: 'transform 0.5s ease',
          filter: 'url(#dropShadow)'
        }}>

          {/* Kabuto Helmet - Main Structure */}
          <g>
            {/* Helmet Bowl */}
            <ellipse cx="100" cy="75" rx="45" ry="35" fill="url(#helmetGrad)" />
            <ellipse cx="100" cy="75" rx="45" ry="35" fill="url(#highlight)" opacity="0.2" />
            
            {/* Helmet Details - Rivets */}
            <circle cx="75" cy="65" r="2" fill="#2d3748" />
            <circle cx="125" cy="65" r="2" fill="#2d3748" />
            <circle cx="85" cy="90" r="1.5" fill="#2d3748" />
            <circle cx="115" cy="90" r="1.5" fill="#2d3748" />

            {/* Neck Guard (Shikoro) */}
            <path d="M 60 95 Q 100 110 140 95 Q 135 120 100 125 Q 65 120 60 95 Z" fill="url(#helmetGrad)" />
            <path d="M 65 105 Q 100 115 135 105 Q 130 125 100 130 Q 70 125 65 105 Z" fill="url(#helmetGrad)" />
          </g>

          {/* Golden Maedate (Front Crest) */}
          <g>
            <path d="M 100 40 L 95 25 Q 100 20 105 25 L 100 40 Z" fill="url(#goldGrad)" />
            <path d="M 100 40 L 98 30 Q 100 28 102 30 L 100 40 Z" fill="url(#highlight)" opacity="0.4" />
            <circle cx="100" cy="32" r="3" fill="url(#goldGrad)" />
            <circle cx="100" cy="32" r="2" fill="url(#highlight)" opacity="0.6" />
          </g>

          {/* Menpo (Face Mask) */}
          <g>
            <path d="M 75 85 Q 100 105 125 85 Q 120 115 100 120 Q 80 115 75 85 Z" 
                  fill="url(#menpoGrad)" />
            <path d="M 80 90 Q 100 100 120 90 Q 115 105 100 108 Q 85 105 80 90 Z" 
                  fill="url(#highlight)" opacity="0.1" />
            
            {/* Mustache Detail */}
            <path d="M 90 105 Q 100 108 110 105" stroke="#1a202c" strokeWidth="2" fill="none" />
          </g>

          {/* Sode (Shoulder Guards) - Left */}
          <g>
            <ellipse cx="55" cy="110" rx="25" ry="40" transform="rotate(-15 55 110)" fill="url(#armorGrad)" />
            <ellipse cx="55" cy="110" rx="20" ry="35" transform="rotate(-15 55 110)" fill="url(#highlight)" opacity="0.2" />
            <path d="M 40 90 Q 70 95 65 130 Q 35 125 40 90 Z" fill="url(#armorGrad)" />
            
            {/* Armor Plates */}
            <rect x="35" y="100" width="25" height="8" rx="2" fill="#9b2c2c" transform="rotate(-15 47.5 104)" />
            <rect x="35" y="115" width="25" height="8" rx="2" fill="#9b2c2c" transform="rotate(-15 47.5 119)" />
            <rect x="35" y="130" width="25" height="8" rx="2" fill="#9b2c2c" transform="rotate(-15 47.5 134)" />
          </g>

          {/* Sode (Shoulder Guards) - Right */}
          <g>
            <ellipse cx="145" cy="110" rx="25" ry="40" transform="rotate(15 145 110)" fill="url(#armorGrad)" />
            <ellipse cx="145" cy="110" rx="20" ry="35" transform="rotate(15 145 110)" fill="url(#highlight)" opacity="0.2" />
            <path d="M 160 90 Q 130 95 135 130 Q 165 125 160 90 Z" fill="url(#armorGrad)" />
            
            {/* Armor Plates */}
            <rect x="140" y="100" width="25" height="8" rx="2" fill="#9b2c2c" transform="rotate(15 152.5 104)" />
            <rect x="140" y="115" width="25" height="8" rx="2" fill="#9b2c2c" transform="rotate(15 152.5 119)" />
            <rect x="140" y="130" width="25" height="8" rx="2" fill="#9b2c2c" transform="rotate(15 152.5 134)" />
          </g>

          {/* Do (Chest Armor) */}
          <g>
            <rect x="75" y="125" width="50" height="60" rx="8" fill="url(#armorGrad)" />
            <rect x="78" y="128" width="44" height="54" rx="6" fill="url(#highlight)" opacity="0.15" />
            
            {/* Chest Plates */}
            <rect x="78" y="135" width="44" height="10" rx="2" fill="#742a2a" />
            <rect x="78" y="150" width="44" height="10" rx="2" fill="#742a2a" />
            <rect x="78" y="165" width="44" height="10" rx="2" fill="#742a2a" />
            
            {/* Central Cord */}
            <circle cx="100" cy="140" r="3" fill="url(#goldGrad)" />
            <circle cx="100" cy="155" r="3" fill="url(#goldGrad)" />
            <circle cx="100" cy="170" r="3" fill="url(#goldGrad)" />
          </g>

          {/* Traditional Tassets (Hip Guards) */}
          <g>
            <rect x="70" y="180" width="15" height="25" rx="4" fill="url(#armorGrad)" transform="rotate(-10 77.5 192.5)" />
            <rect x="85" y="185" width="15" height="25" rx="4" fill="url(#armorGrad)" />
            <rect x="100" y="185" width="15" height="25" rx="4" fill="url(#armorGrad)" />
            <rect x="115" y="180" width="15" height="25" rx="4" fill="url(#armorGrad)" transform="rotate(10 122.5 192.5)" />
          </g>
        </g>

        {/* Glowing Eyes - Professional Detail */}
        <g>
          {/* Eye Sockets */}
          <ellipse cx="88" cy="70" rx="5" ry="3" fill="#1a202c" />
          <ellipse cx="112" cy="70" rx="5" ry="3" fill="#1a202c" />
          
          {/* Glowing Eyes */}
          <circle cx="88" cy="70" r="3" fill="url(#eyeGlow)" opacity="0.9">
            <animate attributeName="opacity" values="0.9;1;0.9" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="112" cy="70" r="3" fill="url(#eyeGlow)" opacity="0.9">
            <animate attributeName="opacity" values="0.9;1;0.9" dur="3s" repeatCount="indefinite" />
          </circle>
          
          {/* Eye Highlights */}
          <circle cx="87" cy="68" r="1" fill="rgba(255,255,255,0.8)" />
          <circle cx="111" cy="68" r="1" fill="rgba(255,255,255,0.8)" />
          
          {/* Blinking animation */}
          {isBlinking && (
            <>
              <ellipse cx="88" cy="70" rx="5" ry="0.5" fill="#1a202c" />
              <ellipse cx="112" cy="70" rx="5" ry="0.5" fill="#1a202c" />
            </>
          )}
        </g>

        {/* Professional State Indicators */}
        {state === 'thinking' && (
          <g>
            <circle cx="150" cy="35" r="3" fill="url(#goldGrad)" opacity="0.8" style={{ animation: 'float 2s ease-in-out infinite' }} />
            <circle cx="160" cy="25" r="4" fill="url(#goldGrad)" opacity="0.6" style={{ animation: 'float 2s ease-in-out infinite 0.3s' }} />
            <circle cx="170" cy="15" r="5" fill="url(#goldGrad)" opacity="0.4" style={{ animation: 'float 2s ease-in-out infinite 0.6s' }} />
          </g>
        )}
        
        {state === 'talking' && (
          <g>
            <circle cx="155" cy="80" r="15" fill="none" stroke="url(#goldGrad)" strokeWidth="2" opacity="0.6" style={{ animation: 'expandFade 1.5s infinite' }} />
            <circle cx="165" cy="70" r="22" fill="none" stroke="url(#goldGrad)" strokeWidth="1.5" opacity="0.4" style={{ animation: 'expandFade 1.5s infinite 0.3s' }} />
            <circle cx="175" cy="60" r="28" fill="none" stroke="url(#goldGrad)" strokeWidth="1" opacity="0.2" style={{ animation: 'expandFade 1.5s infinite 0.6s' }} />
          </g>
        )}
        
        {state === 'listening' && (
          <g>
            <path d="M 25 80 Q 15 70 25 60" fill="none" stroke="url(#goldGrad)" strokeWidth="3" opacity="0.8" style={{ animation: 'soundWave 1.8s infinite' }} />
            <path d="M 15 85 Q 5 75 15 65" fill="none" stroke="url(#goldGrad)" strokeWidth="2.5" opacity="0.6" style={{ animation: 'soundWave 1.8s infinite 0.4s' }} />
            <path d="M 5 90 Q -5 80 5 70" fill="none" stroke="url(#goldGrad)" strokeWidth="2" opacity="0.4" style={{ animation: 'soundWave 1.8s infinite 0.8s' }} />
          </g>
        )}
      </svg>
      
      {/* Professional Status Indicator */}
      {state === 'thinking' && (
        <div 
          className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-600 rounded-full flex items-center justify-center"
          style={{ 
            animation: 'pulse 2s infinite',
            boxShadow: '0 4px 16px rgba(255, 215, 0, 0.5)',
            border: '2px solid rgba(255, 255, 255, 0.3)'
          }}
        >
          <div className="w-3 h-3 bg-white rounded-full opacity-90" />
        </div>
      )}

      {/* Professional CSS Animations */}
      <style jsx>{`
        @keyframes armorGlow {
          0%, 100% { filter: drop-shadow(0 0 8px rgba(229, 62, 62, 0.4)); }
          50% { filter: drop-shadow(0 0 20px rgba(229, 62, 62, 0.8)); }
        }
        @keyframes goldShimmer {
          0%, 100% { filter: drop-shadow(0 0 6px rgba(255, 215, 0, 0.6)); }
          50% { filter: drop-shadow(0 0 12px rgba(255, 215, 0, 1)); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); opacity: 0.6; }
          50% { transform: translateY(-12px); opacity: 1; }
        }
        @keyframes expandFade {
          0% { transform: scale(0.7); opacity: 0.9; }
          50% { transform: scale(1.3); opacity: 0.5; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes soundWave {
          0%, 100% { opacity: 0.4; transform: scaleX(1); }
          50% { opacity: 1; transform: scaleX(1.3); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}