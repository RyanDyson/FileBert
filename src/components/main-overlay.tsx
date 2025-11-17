import { useState, useEffect, useRef, useCallback } from "react";
import { Field, FieldLabel, FieldContent } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Link2, History, Users, Settings, Save } from "lucide-react";
import { cn } from "../lib/utils";

const EXPANDED_WIDTH = 650;
const EXPANDED_HEIGHT = 120;
const MINIMIZED_WIDTH = 500;
const MINIMIZED_HEIGHT = 50;
const INACTIVITY_TIMEOUT = 3000;

export const MainOverlay = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editRoomName, setEditRoomName] = useState(false);
  const [roomName, setRoomName] = useState("Lecture - Example Topic...");
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const expandWindow = useCallback(async () => {
    if (!isExpanded && window.electronAPI) {
      setIsExpanded(true);
      await window.electronAPI.resizeWindow(EXPANDED_WIDTH, EXPANDED_HEIGHT);
    }
  }, [isExpanded]);

  const minimizeWindow = useCallback(async () => {
    if (isExpanded && window.electronAPI) {
      setIsExpanded(false);
      await window.electronAPI.resizeWindow(MINIMIZED_WIDTH, MINIMIZED_HEIGHT);
    }
  }, [isExpanded]);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      minimizeWindow();
    }, INACTIVITY_TIMEOUT);
  }, [minimizeWindow]);

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.resizeWindow(MINIMIZED_WIDTH, MINIMIZED_HEIGHT);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("mouseenter", expandWindow);
      container.addEventListener("mousemove", resetInactivityTimer);
      container.addEventListener("mouseleave", () => {
        resetInactivityTimer();
      });
    }

    const handleMouseMove = () => {
      if (isExpanded) {
        resetInactivityTimer();
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      if (container) {
        container.removeEventListener("mouseenter", expandWindow);
        container.removeEventListener("mousemove", resetInactivityTimer);
        container.removeEventListener("mouseleave", resetInactivityTimer);
      }
      window.removeEventListener("mousemove", handleMouseMove);
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [isExpanded, expandWindow, resetInactivityTimer]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-card/90 border-b border-border/50 shadow-lg transition-all duration-300 ease-in-out p-0"
    >
      <div className="flex items-centertransition-all duration-300 ease-in-out opacity-100 divide-x divide-border">
        {/* Left Section - Room Info */}
        <div className="flex flex-col max-w-md items-center gap-2 flex-1 py-4 px-4">
          {/* Room Name */}
          {isExpanded && (
            <Field className="flex-1 gap-0">
              <FieldLabel className="text-xs font-light text-muted-foreground">
                Room Name
              </FieldLabel>
              <FieldContent>
                <div className="flex items-center gap-2">
                  <Input
                    defaultValue={roomName}
                    className={cn(
                      "transition-all duration-300 ease-in-out bg-primary-foreground text-secondary-foreground",
                      editRoomName && "bg-secondary text-secondary-foreground"
                    )}
                    disabled={!editRoomName}
                    onChange={(e) => setRoomName(e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-primary"
                    onClick={() => setEditRoomName(!editRoomName)}
                  >
                    {editRoomName ? (
                      <Save className="h-4 w-4" />
                    ) : (
                      <Pencil className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </FieldContent>
            </Field>
          )}

          {/* Room Code */}
          <Field className="gap-0 w-full min-w-96">
            {isExpanded && (
              <FieldLabel className="text-xs font-light text-muted-foreground">
                Room Code
              </FieldLabel>
            )}
            <FieldContent className="w-full">
              <div className="flex items-center gap-2 w-full">
                <div className="flex items-center gap-1 w-full">
                  <Input
                    defaultValue="A"
                    className="w-12 bg-secondary text-secondary-foreground text-center"
                    disabled
                  />
                  <Input
                    defaultValue="123456"
                    className="w-full bg-secondary text-secondary-foreground"
                    disabled
                  />
                </div>
                <Button variant="ghost" size="icon" className="text-primary">
                  <Link2 className="h-4 w-4" />
                </Button>
              </div>
            </FieldContent>
          </Field>
        </div>

        {/* Right Section - Navigation */}
        <div className={cn("flex items-center gap-4 px-4")}>
          <Button
            variant="ghost"
            className="text-foreground hover:bg-accent h-fit flex flex-col items-center justify-center"
            title="History"
          >
            <History className="h-5 w-5" />
            {isExpanded && <span className="text-xs">History</span>}
          </Button>
          <Button
            variant="ghost"
            className="text-foreground hover:bg-accent flex h-fit flex-col items-center justify-center py-4 px-2"
            title="Members"
          >
            <Users className="h-5 w-5" />
            {isExpanded && <span className="text-xs">Members</span>}
          </Button>
          <Button
            variant="ghost"
            className="text-foreground flex h-fit flex-col items-center justify-center hover:bg-accent"
            title="Settings"
          >
            <Settings className={cn("h-5 w-5", isExpanded && "h-16 w-16")} />
            {isExpanded && <span className="text-xs">Settings</span>}
          </Button>
        </div>
      </div>
    </div>
  );
};
