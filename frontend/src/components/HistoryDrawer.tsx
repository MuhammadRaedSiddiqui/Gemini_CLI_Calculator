"use client";

import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Clock, Trash2 } from "lucide-react";

interface HistoryDrawerProps {
  history: string[];
  onClearHistory: () => void;
  onSelectHistory?: (item: string) => void;
}

export function HistoryDrawer({ history, onClearHistory, onSelectHistory }: HistoryDrawerProps) {
  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: 340 }}
      dragElastic={0.1}
      className="fixed bottom-0 left-0 right-0 h-[400px] bg-card border-t border-border rounded-t-2xl p-4 shadow-lg max-w-md mx-auto cursor-grab"
      style={{ y: 340 }}
      whileTap={{ cursor: "grabbing" }}
      dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
      data-testid="history-drawer"
    >
      {/* Handle for dragging */}
      <div className="w-12 h-1.5 bg-secondary rounded-full mx-auto mb-4" />

      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-lg font-bold">History</h2>
          {history.length > 0 && (
            <span className="text-xs text-muted-foreground">({history.length})</span>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClearHistory} 
          disabled={history.length === 0}
          className="gap-1"
          data-testid="clear-history-button"
        >
          <Trash2 className="w-4 h-4" />
          Clear
        </Button>
      </div>

      <ul className="space-y-2 overflow-y-auto h-[calc(100%-4rem)] text-sm text-right pr-2" data-testid="history-list">
        {history.length > 0 ? (
          [...history].reverse().map((item, index) => (
            <li 
              key={index} 
              className="p-2 bg-secondary/50 rounded-md hover:bg-secondary/70 transition-colors cursor-pointer"
              onClick={() => onSelectHistory?.(item)}
              title="Click to use this result"
              data-testid={`history-item-${index}`}
            >
              <p className="text-muted-foreground text-xs" data-testid={`history-expression-${index}`}>{item.split("=")[0]}=</p>
              <p className="font-semibold text-lg" data-testid={`history-result-${index}`}>{item.split("=")[1]}</p>
            </li>
          ))
        ) : (
          <li className="text-center text-muted-foreground pt-10" data-testid="history-empty">
            <div className="flex flex-col items-center gap-2">
              <Clock className="w-8 h-8 opacity-50" />
              <p>Your calculation history will appear here.</p>
            </div>
          </li>
        )}
      </ul>
    </motion.div>
  );
}