"use client";

import { ScreeningTool } from "@/components/dashboard/tabs/screening-tool";
import { ScreeningToolMinimal } from "@/components/dashboard/tabs/screening-tool-minimal";

export default function TestScreeningPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold mb-6">Screening Tool Test</h1>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Minimal Test</h2>
          <ScreeningToolMinimal />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Full Screening Tool</h2>
          <ScreeningTool />
        </div>
      </div>
    </div>
  );
} 