import { cn } from "@/lib/utils";
import { Calculator, FlaskConical } from "lucide-react";

interface CalculatorDisplayProps {
  expression: string;
  result: string;
  isError?: boolean;
  mode?: "basic" | "scientific";
  onModeToggle?: () => void;
}

export function CalculatorDisplay({ 
  expression, 
  result, 
  isError = false,
  mode = "basic",
  onModeToggle
}: CalculatorDisplayProps) {
  return (
    <div className="flex-1 p-6 flex flex-col justify-end items-end bg-muted/20 overflow-hidden relative" data-testid="calculator-display-container">
      {/* Mode Toggle Button */}
      {onModeToggle && (
        <button
          onClick={onModeToggle}
          className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-sm font-medium transition-colors shadow-md"
          title={`Switch to ${mode === "basic" ? "Scientific" : "Basic"} mode`}
          data-testid="mode-toggle-button"
        >
          {mode === "basic" ? (
            <>
              <FlaskConical className="w-4 h-4" />
              <span>Scientific</span>
            </>
          ) : (
            <>
              <Calculator className="w-4 h-4" />
              <span>Basic</span>
            </>
          )}
        </button>
      )}
      
      <div 
        className="text-xl text-muted-foreground truncate w-full text-right transition-all" 
        title={expression}
        data-testid="calculator-expression"
      >
        {expression || '\u00A0'}
      </div>
      <div 
        className={cn(
          "text-5xl font-bold truncate w-full text-right transition-colors duration-200",
          isError ? "text-destructive" : "text-foreground"
        )}
        title={result}
        data-testid="calculator-display"
      >
        {result}
      </div>
      {isError && (
        <div className="text-sm text-destructive/80 mt-2" data-testid="error-message">
          Please check your input and try again
        </div>
      )}
    </div>
  );
}