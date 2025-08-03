"use client";

import { useState } from "react";

// ULTRA MINIMAL TEST - No external dependencies at all
export default function DebugTestPage() {
  const [count, setCount] = useState(0);
  
  console.log('🔍 Debug page render, count:', count);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Ultra Minimal Debug Test</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>
        Increment
      </button>
      <button onClick={() => setCount(0)}>
        Reset
      </button>
      
      <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <h2>Instructions:</h2>
        <p>1. If this page works normally → Issue is with Radix UI or complex components</p>
        <p>2. If this page has infinite loops → Issue is with Next.js/React setup</p>
        <p>3. Check browser console for render count</p>
      </div>
    </div>
  );
}