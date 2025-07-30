"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PDFExportButtonProps {
  targetId: string;
  filename?: string;
  buttonText?: string;
  className?: string;
}

export function PDFExportButton({ 
  targetId, 
  filename = "dashboard-export",
  buttonText = "Export PDF",
  className
}: PDFExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleExportPDF = async () => {
    setIsGenerating(true);
    
    try {
      // Get the element to export
      const element = document.getElementById(targetId);
      if (!element) {
        throw new Error("Export target not found");
      }

      // Wait a bit for charts to fully render
      await new Promise(resolve => setTimeout(resolve, 500));

      // Create canvas from HTML element
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff", // Ensure white background
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      // Calculate PDF dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      // Create PDF
      const pdf = new jsPDF("p", "mm", "a4");
      let position = 0;

      // Add image to PDF, handling multiple pages if needed
      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        0,
        position,
        imgWidth,
        imgHeight
      );
      heightLeft -= pageHeight;

      // Add new pages if content is longer than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(
          canvas.toDataURL("image/png"),
          "PNG",
          0,
          position,
          imgWidth,
          imgHeight
        );
        heightLeft -= pageHeight;
      }

      // Save the PDF
      pdf.save(`${filename}-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "PDF exported successfully",
        description: "Your dashboard has been saved as a PDF file.",
      });
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        title: "Export failed",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleExportPDF}
            disabled={isGenerating}
            variant="outline"
            size="sm"
            className={className}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                {buttonText}
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Export current view as PDF</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}