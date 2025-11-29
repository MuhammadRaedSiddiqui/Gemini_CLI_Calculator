"use client";

import { CalculatorButton } from "@/components/CalculatorButton";
import { CalculatorDisplay } from "@/components/CalculatorDisplay";
import { HistoryDrawer } from "@/components/HistoryDrawer";
import { useState, useCallback, useEffect } from "react";
import { evaluateArithmetic, evaluateTrigonometry, APIError } from "@/services/api";
import { useKeyboardInput, ButtonConfig } from "@/hooks/useKeyboardInput";
import { Button } from "@/components/ui/button";

type CalculatorMode = "basic" | "scientific";
type AngleUnit = "radians" | "degrees";

const basicButtonLayout: ButtonConfig[] = [
  { label: "AC", variant: "secondary", type: "clear" },
  { label: "±", variant: "secondary", type: "negate" },
  { label: "%", variant: "secondary", type: "percent" },
  { label: "÷", variant: "primary", type: "operator" },
  { label: "7", type: "number" },
  { label: "8", type: "number" },
  { label: "9", type: "number" },
  { label: "×", variant: "primary", type: "operator" },
  { label: "4", type: "number" },
  { label: "5", type: "number" },
  { label: "6", type: "number" },
  { label: "-", variant: "primary", type: "operator" },
  { label: "1", type: "number" },
  { label: "2", type: "number" },
  { label: "3", type: "number" },
  { label: "+", variant: "primary", type: "operator" },
  { label: "0", className: "col-span-2", type: "number" },
  { label: ".", type: "decimal" },
  { label: "=", variant: "primary", type: "equals" },
];

const scientificButtonLayout: ButtonConfig[] = [
  { label: "sin", variant: "secondary", type: "function" },
  { label: "cos", variant: "secondary", type: "function" },
  { label: "tan", variant: "secondary", type: "function" },
  { label: "÷", variant: "primary", type: "operator" },
  { label: "7", type: "number" },
  { label: "8", type: "number" },
  { label: "9", type: "number" },
  { label: "×", variant: "primary", type: "operator" },
  { label: "4", type: "number" },
  { label: "5", type: "number" },
  { label: "6", type: "number" },
  { label: "-", variant: "primary", type: "operator" },
  { label: "1", type: "number" },
  { label: "2", type: "number" },
  { label: "3", type: "number" },
  { label: "+", variant: "primary", type: "operator" },
  { label: "√", variant: "secondary", type: "function" },
  { label: "0", type: "number" },
  { label: ".", type: "decimal" },
  { label: "=", variant: "primary", type: "equals" },
];

const HISTORY_STORAGE_KEY = "calculator-history";
const MAX_HISTORY_ITEMS = 50;

export default function HomePage() {
  const [mode, setMode] = useState<CalculatorMode>("basic");
  const [angleUnit, setAngleUnit] = useState<AngleUnit>("degrees");
  const [currentValue, setCurrentValue] = useState("0");
  const [expression, setExpression] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  const buttonLayout = mode === "basic" ? basicButtonLayout : scientificButtonLayout;

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) {
          setHistory(parsed.slice(-MAX_HISTORY_ITEMS));
        }
      }
    } catch (err) {
      console.error("Failed to load history from localStorage:", err);
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (err) {
      console.error("Failed to save history to localStorage:", err);
    }
  }, [history]);

  // Clear pressed key visual feedback after delay
  useEffect(() => {
    if (pressedKey) {
      const timer = setTimeout(() => setPressedKey(null), 150);
      return () => clearTimeout(timer);
    }
  }, [pressedKey]);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch (err) {
      console.error("Failed to clear history from localStorage:", err);
    }
  }, []);

  const handleButtonClick = useCallback(async (btn: ButtonConfig) => {
    setError(null);
    setPressedKey(btn.label);

    switch (btn.type) {
      case "number":
        if (expression.endsWith("=")) {
          setExpression("");
          setCurrentValue(btn.label);
        } else {
          setCurrentValue((prev) => (prev === "0" ? btn.label : prev + btn.label));
        }
        break;
        
      case "decimal":
        if (!currentValue.includes(".")) {
          setCurrentValue((prev) => prev + ".");
        }
        break;
        
      case "clear":
        setCurrentValue("0");
        setExpression("");
        setError(null);
        break;
        
      case "operator":
        if (expression.endsWith("=")) {
          setExpression(currentValue + ` ${btn.label} `);
        } else {
          setExpression((prev) => prev + currentValue + ` ${btn.label} `);
        }
        setCurrentValue("0");
        break;
        
      case "equals":
        if (expression.endsWith("=")) {
          return;
        }
        
        const finalExpression = (expression + currentValue)
          .replace(/×/g, "*")
          .replace(/÷/g, "/");
          
        setExpression(finalExpression + " =");
        setIsLoading(true);
        
        try {
          const res = await evaluateArithmetic({ expression: finalExpression });
          
          const formattedResult = Number.isInteger(res.result) 
            ? String(res.result)
            : res.result.toFixed(10).replace(/\.?0+$/, "");
            
          setCurrentValue(formattedResult);
          
          setHistory((prev) => {
            const newHistory = [...prev, `${finalExpression} = ${formattedResult}`];
            return newHistory.slice(-MAX_HISTORY_ITEMS);
          });
        } catch (err) {
          const errorMessage = err instanceof APIError 
            ? err.message 
            : "Calculation failed";
          setError(errorMessage);
          setCurrentValue("Error");
          console.error("Calculation error:", err);
        } finally {
          setIsLoading(false);
        }
        break;
        
      case "negate":
        setCurrentValue((prev) => {
          const num = parseFloat(prev);
          if (isNaN(num)) return prev;
          return String(num * -1);
        });
        break;
        
      case "percent":
        setCurrentValue((prev) => {
          const num = parseFloat(prev);
          if (isNaN(num)) return prev;
          return String(num / 100);
        });
        break;
        
      case "function":
        // Handle scientific functions
        const value = parseFloat(currentValue);
        if (isNaN(value)) {
          setError("Invalid input for function");
          return;
        }

        setIsLoading(true);
        const functionName = btn.label.toLowerCase();
        
        try {
          let result: number;
          let functionExpression: string;

          if (functionName === "√") {
            // Square root using arithmetic API
            const sqrtExpression = `sqrt(${value})`;
            const res = await evaluateArithmetic({ expression: sqrtExpression });
            result = res.result;
            functionExpression = `√(${value})`;
          } else {
            // Trigonometric functions
            const trigFunctions = ["sin", "cos", "tan", "asin", "acos", "atan"];
            if (trigFunctions.includes(functionName)) {
              const res = await evaluateTrigonometry({
                function: functionName as any,
                value: value,
                unit: angleUnit
              });
              result = res.result;
              functionExpression = `${functionName}(${value}°)`;
            } else {
              setError(`Function ${functionName} not yet implemented`);
              setIsLoading(false);
              return;
            }
          }

          const formattedResult = Number.isInteger(result)
            ? String(result)
            : result.toFixed(10).replace(/\.?0+$/, "");

          setCurrentValue(formattedResult);
          setExpression("");
          
          setHistory((prev) => {
            const newHistory = [...prev, `${functionExpression} = ${formattedResult}`];
            return newHistory.slice(-MAX_HISTORY_ITEMS);
          });
        } catch (err) {
          const errorMessage = err instanceof APIError 
            ? err.message 
            : `${functionName} calculation failed`;
          setError(errorMessage);
          setCurrentValue("Error");
          console.error("Function error:", err);
        } finally {
          setIsLoading(false);
        }
        break;
    }
  }, [currentValue, expression, angleUnit]);

  useKeyboardInput(buttonLayout, handleButtonClick);

  return (
    <div className="flex flex-col h-full mb-12">
      {/* Mode Toggle and Angle Unit Selector */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">
          {mode === "basic" ? "Basic" : "Scientific"} Calculator
        </h1>
        <div className="flex gap-2 items-center">
          {mode === "scientific" && (
            <Button
              onClick={() => setAngleUnit(angleUnit === "degrees" ? "radians" : "degrees")}
              variant="ghost"
              size="sm"
              data-testid="angle-unit-toggle"
            >
              {angleUnit === "degrees" ? "DEG" : "RAD"}
            </Button>
          )}
          <Button
            onClick={() => setMode(mode === "basic" ? "scientific" : "basic")}
            variant="outline"
            size="sm"
            data-testid="mode-toggle-button"
          >
            Switch to {mode === "basic" ? "Scientific" : "Basic"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col flex-1 bg-card rounded-lg shadow-lg overflow-hidden relative mb-4">
        {/* Loading overlay */}
        {isLoading && (
          <div 
            className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10"
            data-testid="loading-overlay"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
              <p className="text-sm text-muted-foreground" data-testid="loading-text">
                Calculating...
              </p>
            </div>
          </div>
        )}

        <CalculatorDisplay 
          expression={expression} 
          result={error || currentValue} 
          isError={!!error}
        />

        <div className="grid grid-cols-4 grid-rows-5 gap-2 p-4">
          {buttonLayout.map((btn, index) => (
            <CalculatorButton
              key={`${btn.label}-${index}`}
              variant={btn.variant}
              className={btn.className}
              onClick={() => handleButtonClick(btn)}
              isPressed={pressedKey === btn.label}
              data-testid={btn.type === "number" ? `button-${btn.label}` : undefined}
            >
              {btn.label}
            </CalculatorButton>
          ))}
        </div>
        
        <HistoryDrawer 
          history={history} 
          onClearHistory={handleClearHistory}
          onSelectHistory={(item) => {
            const result = item.split("=")[1]?.trim();
            if (result) {
              setCurrentValue(result);
              setExpression("");
              setError(null);
            }
          }}
        />
      </div>
    </div>
  );
}