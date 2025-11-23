import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Link2, CheckCircle2 } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface CopyButtonProps {
  textToCopy: string;
  defaultTooltipText?: string;
  copiedTooltipText?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export const CopyButton = ({
  textToCopy,
  defaultTooltipText = "Copy",
  copiedTooltipText = "Copied!",
  variant = "ghost",
  size = "icon",
  className = "text-primary",
}: CopyButtonProps) => {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [tooltipText, setTooltipText] = useState(defaultTooltipText);
  const [isCopied, setIsCopied] = useState(false);
  const handleCopy = () => {
    if (window.electronAPI) {
      setTooltipText(copiedTooltipText);
      setIsCopied(true);
      setIsTooltipOpen(true);
      window.electronAPI.writeClipboard(textToCopy);
      setTimeout(() => {
        setTooltipText(defaultTooltipText);
        setIsCopied(false);
        setIsTooltipOpen(false);
      }, 2000);
    }
  };

  return (
    <Tooltip open={isTooltipOpen}>
      <TooltipTrigger asChild>
        <Button
          variant={variant}
          size={size}
          onClick={handleCopy}
          onMouseEnter={() => setIsTooltipOpen(true)}
          onMouseLeave={() => setIsTooltipOpen(false)}
          className={cn(
            isCopied && "text-green-500 transition-all duration-300",
            className
          )}
        >
          <div className="relative h-4 w-4">
            <CheckCircle2
              className={cn(
                "h-4 w-4 absolute inset-0 transition-all duration-300",
                isCopied
                  ? "opacity-100 scale-100 rotate-0"
                  : "opacity-0 scale-75 rotate-90"
              )}
            />
            <Link2
              className={cn(
                "h-4 w-4 absolute inset-0 transition-all duration-300",
                isCopied
                  ? "opacity-0 scale-75 -rotate-90"
                  : "opacity-100 scale-100 rotate-0"
              )}
            />
          </div>
        </Button>
      </TooltipTrigger>
      <TooltipContent className="opacity-80 backdrop-blur-sm">
        <p className="text-xs">{tooltipText}</p>
      </TooltipContent>
    </Tooltip>
  );
};
