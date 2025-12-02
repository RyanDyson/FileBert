import { useState, useEffect, useRef, useCallback } from "react";
import { Field, FieldLabel, FieldContent } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, History, Users, Settings, Save, LogOut } from "lucide-react";
import { cn } from "../lib/utils";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ConfirmDialog } from "../../components/global/confirm-dialog";
import { CopyButton } from "../../components/global/copy-button";
import { Actions, Toast } from "@/components/global/toast-config";
import type { Dispatch, SetStateAction } from "react";

const EXPANDED_WIDTH = 650;
const EXPANDED_HEIGHT = 120;
const MINIMIZED_WIDTH = 600;
const MINIMIZED_HEIGHT = 50;
const INACTIVITY_TIMEOUT = 3000;

export const MainOverlay = ({
  action,
  setAction,
}: {
  action: Actions | null;
  setAction: Dispatch<SetStateAction<Actions | null>>;
}) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [editRoomName, setEditRoomName] = useState(false);
  const [roomCode, setRoomCode] = useState("123");
  const [roomName, setRoomName] = useState("Lecture - Example Topic...");
  const [nickname, setNickname] = useState("Nick name");
  const [isHost, setIsHost] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchOverlayData = async () => {
      try {
        const overlayData = await window.electronAPI.getOverlayData();
        setRoomCode((prev) => {
          console.log("Previous roomCode:", prev, "New roomCode:", overlayData.roomId);
          return overlayData.roomId;
        });

        setIsHost((prev) => {
          const newIsHost = overlayData.current_roles === "H";
          console.log("Previous isHost:", prev, "New isHost:", newIsHost);
          return newIsHost;
        });

        setNickname((prev) => {
          const newUsername = overlayData.username;
          console.log("Previous username:", prev, "New username:", newUsername);
          return newUsername;
        });
      } catch (error) {
        console.error("Failed to fetch overlay data:", error);
      }
    };

    fetchOverlayData();
  }, []);

  const expandWindow = useCallback(() => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
  }, [isExpanded]);

  const minimizeWindow = useCallback(() => {
    if (isExpanded) {
      setIsExpanded(false);
      setShowConfirm(false);
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
    setIsExpanded(true);
    setAction(isHost ? Actions.room_created : Actions.room_joined);
    setTimeout(() => {
      setAction(null);
      setIsExpanded(false);
    }, 3000);
  }, []);

  // Listen for toast action changes from IPC (e.g., from Settings window)
  useEffect(() => {
    if (window.electronAPI?.onToastAction) {
      const cleanup = window.electronAPI.onToastAction((action) => {
        const actionValue = action as Actions | null;
        setAction(actionValue);
        if (actionValue) {
          setIsExpanded(true);
          setTimeout(() => {
            setAction(null);
            setIsExpanded(false);
          }, 3000);
        }
      });
      return cleanup;
    }
  }, [setAction]);

  // Resize window based on isExpanded state
  useEffect(() => {
    if (window.electronAPI) {
      if (isExpanded) {
        window.electronAPI.resizeWindow(EXPANDED_WIDTH, EXPANDED_HEIGHT);
      } else {
        window.electronAPI.resizeWindow(MINIMIZED_WIDTH, MINIMIZED_HEIGHT);
      }
    }
  }, [isExpanded]);

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

  const handleLeave = async () => {
    let current_roles = 'M';
    if (isHost){
      current_roles = 'H'
    }

    try {
      const response = await fetch("https://filebertbackend.netlify.app/api/leave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roomId: roomCode, username: nickname, current_roles: current_roles }),
      });

      const responseData = await response.json();
      const success = responseData.success;

      if(success){
        if (window.electronAPI?.switchToStartScreen) {
          await window.electronAPI.switchToStartScreen();
        }
        navigate("/");
        setShowConfirm(false);
      }
      setShowConfirm(false);
    } catch(error) {
      console.error("Failed to leave room:", error);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "overflow-clip w-full h-full bg-card/90 border-b border-border/50 shadow-lg transition-all duration-300 ease-in-out p-0",
        !isExpanded && "opacity-30"
      )}
    >
      {action && <Toast action={action} />}
      {showConfirm && isExpanded && (
        <ConfirmDialog
          title={
            isHost
              ? "Leaving as host will end the session for all users. Are you sure you want to leave?"
              : "Are you sure you want to leave the room?"
          }
          onConfirm={handleLeave}
          onCancel={() => setShowConfirm(false)}
        />
      )}
      <div
        className={cn(
          "flex items-center w-full h-full transition-all duration-300 ease-in-out opacity-100 divide-x divide-border",
          isExpanded && "max-h-full"
        )}
      >
        {/* Left Section - Room Info */}
        <div
          className={cn(
            "flex flex-col items-center gap-2 flex-1 py-4 px-4",
            isExpanded ? "max-w-md max-h-full" : "min-w-0"
          )}
        >
          {/* Room Name */}
          {isExpanded && (
            <Field className={cn("flex-1 gap-0", isExpanded && "max-h-full")}>
              <FieldLabel className="text-xs font-light text-muted-foreground">
                Room Name
              </FieldLabel>
              <FieldContent>
                <div
                  className={cn(
                    "flex items-center gap-2",
                    isExpanded && "max-h-full"
                  )}
                >
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
                    <div className="relative h-4 w-4">
                      <Save
                        className={cn(
                          "h-4 w-4 absolute inset-0 transition-all duration-300",
                          editRoomName
                            ? "opacity-100 scale-100 rotate-0"
                            : "opacity-0 scale-75 rotate-90"
                        )}
                      />
                      <Pencil
                        className={cn(
                          "h-4 w-4 absolute inset-0 transition-all duration-300",
                          editRoomName
                            ? "opacity-0 scale-75 -rotate-90"
                            : "opacity-100 scale-100 rotate-0"
                        )}
                      />
                    </div>
                  </Button>
                </div>
              </FieldContent>
            </Field>
          )}

          {/* Room Code */}
          <Field
            className={cn("gap-0 w-full", isExpanded ? "min-w-96" : "min-w-0")}
          >
            {isExpanded && (
              <FieldLabel className="text-xs font-light text-muted-foreground">
                Room Code
              </FieldLabel>
            )}
            <FieldContent className="w-full">
              <div className="flex items-center gap-2 w-full">
                <div className="flex items-center gap-1 w-full">
                  <Input
                    defaultValue={roomCode}
                    className="w-full bg-secondary text-secondary-foreground"
                    disabled
                    onChange={(e) => setRoomCode(e.target.value)}
                  />
                </div>
                <CopyButton
                  textToCopy={roomCode}
                  defaultTooltipText="Copy Room Code"
                  copiedTooltipText="Copied to Clipboard"
                />
              </div>
            </FieldContent>
          </Field>
        </div>

        {/* Right Section - Navigation */}
        <div className={cn("flex items-center gap-4 px-4 h-32")}>
          <Button
            variant="ghost"
            className="text-foreground hover:bg-accent h-full flex flex-col items-center justify-center"
            title="History"
            onClick={() => {
              if (window.electronAPI?.openHistoryWindow) {
                window.electronAPI.openHistoryWindow();
              }
            }}
          >
            <History className="h-5 w-5" />
            {isExpanded && <span className="text-xs">History</span>}
          </Button>
          <Button
            variant="ghost"
            className="text-foreground hover:bg-accent flex h-full flex-col items-center justify-center py-4 px-2"
            title="Members"
            onClick={() => {
              if (window.electronAPI?.openMembersWindow) {
                window.electronAPI.openMembersWindow();
              }
            }}
          >
            <Users className="h-5 w-5" />
            {isExpanded && <span className="text-xs">Members</span>}
          </Button>
          {isHost && (
            <Button
              variant="ghost"
              className="text-foreground flex h-full flex-col items-center justify-center hover:bg-accent"
              title="Settings"
              onClick={() => {
                if (window.electronAPI?.openSettingsWindow) {
                  window.electronAPI.openSettingsWindow();
                }
              }}
            >
              <Settings className={cn("h-5 w-5", isExpanded && "h-16 w-16")} />
              {isExpanded && <span className="text-xs">Settings</span>}
            </Button>
          )}
          <Button
            variant="ghost"
            className="text-foreground flex h-full flex-col items-center justify-center hover:bg-accent"
            title="Leave"
            onClick={() => setShowConfirm(true)}
          >
            <LogOut className={cn("h-5 w-5", isExpanded && "h-16 w-16")} />
            {isExpanded && <span className="text-xs">Leave</span>}
          </Button>
        </div>
      </div>
    </div>
  );
};
