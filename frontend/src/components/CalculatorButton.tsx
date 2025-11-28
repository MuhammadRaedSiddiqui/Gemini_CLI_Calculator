import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CalculatorButtonBaseProps = React.ComponentPropsWithoutRef<typeof Button>;

interface CalculatorButtonProps extends CalculatorButtonBaseProps {
  className?: string;
  children: React.ReactNode;
  isPressed?: boolean;
}

export function CalculatorButton({
  variant = "secondary",
  className,
  children,
  isPressed = false,
  ...props
}: CalculatorButtonProps) {
  return (
    <Button
      variant={variant}
      className={cn(
        "h-16 w-full text-2xl sm:h-20 rounded-lg transition-all duration-150",
        isPressed && "scale-95 ring-2 ring-primary/50",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}