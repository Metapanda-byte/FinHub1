"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

// MINIMAL TEST - Testing core components without complex state
export function ScreeningToolMinimal() {
  const [testChecked, setTestChecked] = useState(false);
  const [sliderValue, setSliderValue] = useState([0, 100]);

  console.log('🔍 Minimal component render count');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Minimal Test - No Infinite Loops</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="test-checkbox"
            checked={testChecked}
            onCheckedChange={(checked) => setTestChecked(checked === true)}
          />
          <label htmlFor="test-checkbox">
            Test Checkbox: {testChecked ? 'Checked' : 'Unchecked'}
          </label>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm">Slider Test: {sliderValue[0]} - {sliderValue[1]}</label>
          <Slider
            value={sliderValue}
            onValueChange={setSliderValue}
            min={0}
            max={100}
            step={1}
          />
        </div>
        
        <Button 
          onClick={() => {
            setTestChecked(false);
            setSliderValue([0, 100]);
          }}
          variant="outline"
        >
          Reset All
        </Button>
        
        <p className="mt-4 text-sm text-muted-foreground">
          If this causes infinite loops, the issue is with Radix UI setup.
          If not, the issue is in the main screening tool.
        </p>
      </CardContent>
    </Card>
  );
}