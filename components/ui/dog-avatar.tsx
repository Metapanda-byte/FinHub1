'use client';

import React, { useState, useEffect } from 'react';

interface DogAvatarProps {
  state?: 'idle' | 'listening' | 'thinking' | 'talking';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function DogAvatar({ state = 'idle', size = 'md', className = '' }: DogAvatarProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState(0);

  // Random blinking animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, 2000 + Math.random() * 4000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Breathing animation
  useEffect(() => {
    const breathingInterval = setInterval(() => {
      setBreathingPhase(prev => (prev + 1) % 100);
    }, 50);

    return () => clearInterval(breathingInterval);
  }, []);

  const sizeMap = {
    sm: { width: '64px', height: '64px' },
    md: { width: '96px', height: '96px' }, 
    lg: { width: '128px', height: '128px' },
    xl: { width: '192px', height: '192px' }
  };

  const currentSize = sizeMap[size];
  const breathingScale = 1 + Math.sin(breathingPhase * 0.1) * 0.02;

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
          filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.15))',
          transform: `scale(${state === 'listening' ? 1.05 : 1}) scale(${breathingScale})`,
          transition: 'transform 0.3s ease'
        }}
      >
        {/* Define gradients and patterns */}
        <defs>
          {/* White fur gradient */}
          <radialGradient id="whiteFur" cx="0.3" cy="0.3" r="0.8">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#f8f9fa" />
            <stop offset="80%" stopColor="#e9ecef" />
            <stop offset="100%" stopColor="#dee2e6" />
          </radialGradient>

          {/* Black fur gradient */}
          <radialGradient id="blackFur" cx="0.3" cy="0.3" r="0.8">
            <stop offset="0%" stopColor="#495057" />
            <stop offset="40%" stopColor="#343a40" />
            <stop offset="80%" stopColor="#212529" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>

          {/* Nose gradient */}
          <radialGradient id="noseGrad" cx="0.3" cy="0.2" r="0.8">
            <stop offset="0%" stopColor="#6c757d" />
            <stop offset="60%" stopColor="#495057" />
            <stop offset="100%" stopColor="#212529" />
          </radialGradient>

          {/* Eye gradient */}
          <radialGradient id="eyeGrad" cx="0.3" cy="0.3" r="0.7">
            <stop offset="0%" stopColor="#6c757d" />
            <stop offset="70%" stopColor="#495057" />
            <stop offset="100%" stopColor="#212529" />
          </radialGradient>

          {/* Tongue gradient */}
          <linearGradient id="tongueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff8fa3" />
            <stop offset="50%" stopColor="#ff6b8a" />
            <stop offset="100%" stopColor="#e03e54" />
          </linearGradient>

          {/* Collar gradient */}
          <linearGradient id="collarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4dabf7" />
            <stop offset="50%" stopColor="#339af0" />
            <stop offset="100%" stopColor="#1c7ed6" />
          </linearGradient>

          {/* Fur texture pattern */}
          <pattern id="furTexture" patternUnits="userSpaceOnUse" width="4" height="4">
            <circle cx="2" cy="2" r="0.5" fill="rgba(255,255,255,0.1)" />
          </pattern>
        </defs>

        {/* Shadow base */}
        <ellipse cx="100" cy="185" rx="45" ry="8" fill="rgba(0,0,0,0.1)" />

        {/* Body */}
        <ellipse 
          cx="100" 
          cy="150" 
          rx="35" 
          ry="28" 
          fill="url(#whiteFur)"
          style={{
            transform: state === 'thinking' ? 'scale(1.02)' : 'scale(1)',
            transition: 'transform 0.5s ease'
          }}
        />
        <ellipse cx="100" cy="150" rx="35" ry="28" fill="url(#furTexture)" opacity="0.3" />

        {/* Head */}
        <circle 
          cx="100" 
          cy="90" 
          r="45" 
          fill="url(#whiteFur)"
          style={{
            transform: state === 'talking' ? 'translateY(-3px)' : 'translateY(0)',
            transition: 'transform 0.2s ease'
          }}
        />
        <circle cx="100" cy="90" r="45" fill="url(#furTexture)" opacity="0.2" />

        {/* Head highlight */}
        <ellipse cx="85" cy="75" rx="25" ry="20" fill="rgba(255,255,255,0.4)" opacity="0.6" />

        {/* Black ear (left) - more detailed */}
        <g style={{
          transform: state === 'listening' ? 'rotate(-5deg)' : 'rotate(-15deg)',
          transformOrigin: '70px 65px',
          transition: 'transform 0.4s ease'
        }}>
          <ellipse cx="70" cy="60" rx="16" ry="25" fill="url(#blackFur)" />
          <ellipse cx="70" cy="60" rx="16" ry="25" fill="url(#furTexture)" opacity="0.2" />
          <ellipse cx="65" cy="55" rx="10" ry="15" fill="rgba(255,255,255,0.1)" />
          {/* Inner ear */}
          <ellipse cx="70" cy="65" rx="8" ry="12" fill="#8d5524" />
          <ellipse cx="70" cy="65" rx="5" ry="8" fill="#a0522d" />
        </g>

        {/* White ear (right) - more detailed */}
        <g style={{
          transform: state === 'listening' ? 'rotate(5deg)' : 'rotate(15deg)',
          transformOrigin: '130px 65px',
          transition: 'transform 0.4s ease'
        }}>
          <ellipse cx="130" cy="60" rx="16" ry="25" fill="url(#whiteFur)" />
          <ellipse cx="130" cy="60" rx="16" ry="25" fill="url(#furTexture)" opacity="0.3" />
          <ellipse cx="135" cy="55" rx="10" ry="15" fill="rgba(255,255,255,0.2)" />
          {/* Inner ear */}
          <ellipse cx="130" cy="65" rx="8" ry="12" fill="#8d5524" />
          <ellipse cx="130" cy="65" rx="5" ry="8" fill="#a0522d" />
        </g>

        {/* Black patch over left eye - more detailed */}
        <ellipse cx="80" cy="80" rx="18" ry="15" fill="url(#blackFur)" opacity="0.95" />
        <ellipse cx="80" cy="80" rx="18" ry="15" fill="url(#furTexture)" opacity="0.15" />
        <ellipse cx="75" cy="75" rx="12" ry="10" fill="rgba(0,0,0,0.3)" />

        {/* Left Eye - much more detailed */}
        <g>
          <ellipse cx="80" cy="82" rx="7" ry="8" fill="white" />
          <circle cx="80" cy="82" r="6" fill="url(#eyeGrad)" />
          <circle cx="80" cy="82" r="4" fill="#1a1a1a" />
          <circle cx="82" cy="80" r="1.5" fill="white" opacity="0.9" />
          <circle cx="79" cy="83" r="0.8" fill="white" opacity="0.6" />
          {/* Eyelashes */}
          <path d="M 75 78 Q 72 76 70 78" stroke="#1a1a1a" strokeWidth="0.5" fill="none" />
          <path d="M 78 76 Q 76 74 74 76" stroke="#1a1a1a" strokeWidth="0.5" fill="none" />
          <path d="M 82 76 Q 80 74 78 76" stroke="#1a1a1a" strokeWidth="0.5" fill="none" />
          {/* Blinking animation */}
          {isBlinking && (
            <ellipse cx="80" cy="82" rx="7" ry="1" fill="url(#whiteFur)" />
          )}
        </g>

        {/* Right Eye - much more detailed */}
        <g>
          <ellipse cx="120" cy="82" rx="7" ry="8" fill="white" />
          <circle cx="120" cy="82" r="6" fill="url(#eyeGrad)" />
          <circle cx="120" cy="82" r="4" fill="#1a1a1a" />
          <circle cx="122" cy="80" r="1.5" fill="white" opacity="0.9" />
          <circle cx="119" cy="83" r="0.8" fill="white" opacity="0.6" />
          {/* Eyelashes */}
          <path d="M 125 78 Q 128 76 130 78" stroke="#1a1a1a" strokeWidth="0.5" fill="none" />
          <path d="M 122 76 Q 124 74 126 76" stroke="#1a1a1a" strokeWidth="0.5" fill="none" />
          <path d="M 118 76 Q 120 74 122 76" stroke="#1a1a1a" strokeWidth="0.5" fill="none" />
          {/* Blinking animation */}
          {isBlinking && (
            <ellipse cx="120" cy="82" rx="7" ry="1" fill="url(#whiteFur)" />
          )}
        </g>

        {/* Snout area */}
        <ellipse cx="100" cy="105" rx="22" ry="18" fill="url(#whiteFur)" />
        <ellipse cx="100" cy="105" rx="22" ry="18" fill="url(#furTexture)" opacity="0.2" />
        <ellipse cx="95" cy="100" rx="15" ry="12" fill="rgba(255,255,255,0.3)" />

        {/* Nose - highly detailed */}
        <ellipse cx="100" cy="100" rx="5" ry="4" fill="url(#noseGrad)" />
        <ellipse cx="100" cy="100" rx="5" ry="4" fill="rgba(0,0,0,0.2)" />
        <ellipse cx="98" cy="98" rx="2" ry="1.5" fill="rgba(255,255,255,0.4)" />
        <path d="M 100 104 L 100 112" stroke="#495057" strokeWidth="2" />

        {/* Mouth area - more sophisticated */}
        <path
          d="M 85 110 Q 100 125 115 110 Q 108 118 100 118 Q 92 118 85 110"
          fill="rgba(139, 69, 19, 0.8)"
          style={{
            transform: state === 'talking' ? 'scale(1.15)' : 'scale(1)',
            transformOrigin: '100px 115px',
            transition: 'transform 0.3s ease'
          }}
        />

        {/* Tongue - highly detailed */}
        {(state === 'talking' || state === 'idle') && (
          <g style={{
            opacity: state === 'talking' ? 1 : 0.8,
            animation: state === 'talking' ? 'pulse 1.2s infinite' : 'none'
          }}>
            <ellipse cx="100" cy="118" rx="8" ry="6" fill="url(#tongueGrad)" />
            <ellipse cx="100" cy="118" rx="8" ry="6" fill="rgba(255,255,255,0.2)" opacity="0.3" />
            <ellipse cx="97" cy="115" rx="3" ry="2" fill="rgba(255,255,255,0.5)" />
            <path d="M 95 118 Q 100 122 105 118" stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none" />
          </g>
        )}

        {/* Premium Collar - highly detailed */}
        <rect x="65" y="125" width="70" height="12" rx="6" fill="url(#collarGrad)" />
        <rect x="65" y="125" width="70" height="4" rx="2" fill="rgba(255,255,255,0.3)" />
        <rect x="67" y="127" width="66" height="8" rx="4" fill="rgba(0,0,0,0.1)" />
        
        {/* Collar buckle */}
        <rect x="75" y="127" width="8" height="8" rx="1" fill="#ffd43b" stroke="#f59f00" strokeWidth="0.5" />
        <rect x="76" y="128" width="6" height="6" rx="0.5" fill="#ffd43b" />
        <circle cx="79" cy="131" r="1" fill="#f59f00" />

        {/* Collar studs */}
        <circle cx="90" cy="131" r="1.5" fill="#ffd43b" />
        <circle cx="100" cy="131" r="2" fill="#ffd43b" />
        <circle cx="110" cy="131" r="1.5" fill="#ffd43b" />
        <circle cx="120" cy="131" r="1.5" fill="#ffd43b" />

        {/* Tail - more detailed */}
        <g style={{
          animation: (state === 'talking' || state === 'listening') ? 'wag 0.6s ease-in-out infinite alternate' : 'none',
          transformOrigin: '140px 140px'
        }}>
          <ellipse cx="140" cy="140" rx="8" ry="18" fill="url(#whiteFur)" transform="rotate(25 140 140)" />
          <ellipse cx="140" cy="140" rx="8" ry="18" fill="url(#furTexture)" opacity="0.3" transform="rotate(25 140 140)" />
          <ellipse cx="138" cy="135" rx="5" ry="12" fill="rgba(255,255,255,0.4)" transform="rotate(25 138 135)" />
        </g>

        {/* Paws - more detailed */}
        <ellipse cx="75" cy="175" rx="8" ry="6" fill="url(#whiteFur)" />
        <ellipse cx="75" cy="175" rx="8" ry="6" fill="url(#furTexture)" opacity="0.2" />
        <ellipse cx="100" cy="175" rx="8" ry="6" fill="url(#whiteFur)" />
        <ellipse cx="100" cy="175" rx="8" ry="6" fill="url(#furTexture)" opacity="0.2" />
        <ellipse cx="125" cy="175" rx="8" ry="6" fill="url(#whiteFur)" />
        <ellipse cx="125" cy="175" rx="8" ry="6" fill="url(#furTexture)" opacity="0.2" />

        {/* Paw pads */}
        <ellipse cx="75" cy="177" rx="4" ry="2" fill="#8d5524" />
        <ellipse cx="100" cy="177" rx="4" ry="2" fill="#8d5524" />
        <ellipse cx="125" cy="177" rx="4" ry="2" fill="#8d5524" />

        {/* State indicators - more sophisticated */}
        {state === 'thinking' && (
          <g>
            <circle cx="150" cy="40" r="4" fill="rgba(99, 179, 237, 0.8)" style={{ animation: 'float 2s ease-in-out infinite' }} />
            <circle cx="160" cy="30" r="6" fill="rgba(99, 179, 237, 0.6)" style={{ animation: 'float 2s ease-in-out infinite 0.3s' }} />
            <circle cx="170" cy="20" r="8" fill="rgba(99, 179, 237, 0.4)" style={{ animation: 'float 2s ease-in-out infinite 0.6s' }} />
          </g>
        )}
        
        {state === 'talking' && (
          <g>
            <circle cx="155" cy="70" r="12" fill="none" stroke="rgba(59, 130, 246, 0.6)" strokeWidth="2" style={{ animation: 'expandFade 1.5s infinite' }} />
            <circle cx="165" cy="60" r="18" fill="none" stroke="rgba(59, 130, 246, 0.4)" strokeWidth="1.5" style={{ animation: 'expandFade 1.5s infinite 0.3s' }} />
            <circle cx="175" cy="50" r="24" fill="none" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1" style={{ animation: 'expandFade 1.5s infinite 0.6s' }} />
          </g>
        )}
        
        {state === 'listening' && (
          <g>
            <path d="M 30 80 Q 20 70 30 60" fill="none" stroke="rgba(34, 197, 94, 0.8)" strokeWidth="3" style={{ animation: 'soundWave 1.8s infinite' }} />
            <path d="M 20 85 Q 10 75 20 65" fill="none" stroke="rgba(34, 197, 94, 0.6)" strokeWidth="2.5" style={{ animation: 'soundWave 1.8s infinite 0.4s' }} />
            <path d="M 10 90 Q 0 80 10 70" fill="none" stroke="rgba(34, 197, 94, 0.4)" strokeWidth="2" style={{ animation: 'soundWave 1.8s infinite 0.8s' }} />
          </g>
        )}
      </svg>
      
      {/* Status indicator dot - more sophisticated */}
      {state === 'thinking' && (
        <div 
          className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center"
          style={{ 
            animation: 'pulse 2s infinite',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
          }}
        >
          <div className="w-2 h-2 bg-white rounded-full opacity-80" />
        </div>
      )}

      {/* CSS animations */}
      <style jsx>{`
        @keyframes wag {
          0% { transform: rotate(15deg); }
          100% { transform: rotate(35deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); opacity: 0.4; }
          50% { transform: translateY(-10px); opacity: 1; }
        }
        @keyframes expandFade {
          0% { transform: scale(0.8); opacity: 0.8; }
          50% { transform: scale(1.2); opacity: 0.4; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes soundWave {
          0%, 100% { opacity: 0.3; transform: scaleX(1); }
          50% { opacity: 1; transform: scaleX(1.2); }
        }
      `}</style>
    </div>
  );
}