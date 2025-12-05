import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg p-3 gap-2 text-xs w-auto min-w-[200px]",
          description: "group-[.toast]:text-muted-foreground text-[10px]",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground h-7 px-2 text-xs",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground h-7 px-2 text-xs",
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-3" />,
        info: <InfoIcon className="size-3" />,
        warning: <TriangleAlertIcon className="size-3" />,
        error: <OctagonXIcon className="size-3" />,
        loading: <Loader2Icon className="size-3 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
