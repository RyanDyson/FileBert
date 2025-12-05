import { useState, useEffect, useRef, useCallback } from "react";
import { Field, FieldLabel, FieldContent } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  History,
  Users,
  Settings,
  Save,
  LogOut,
  Hand,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useNavigate } from "react-router-dom";
import { ConfirmDialog } from "../../components/global/confirm-dialog";
import { CopyButton } from "../../components/global/copy-button";
import { Actions, Toast } from "@/components/global/toast-config";
import type { Dispatch, SetStateAction } from "react";
import { useGesture } from "../lib/gesture/useGesture";
import { useMutation } from "@tanstack/react-query";

const EXPANDED_WIDTH = 650;
const EXPANDED_HEIGHT = 160;
const MINIMIZED_WIDTH = 600;
const MINIMIZED_HEIGHT = 80;
const INACTIVITY_TIMEOUT = 3000;

export const MainOverlay = ({
  action,
  setAction,
}: {
  action: Actions | null;
  setAction: Dispatch<SetStateAction<Actions | null>>;
}) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true); // Start expanded since we show toast initially
  const [editRoomName, setEditRoomName] = useState(false);
  const [roomCode, setRoomCode] = useState("123");
  const [roomName, setRoomName] = useState("Lecture - Example Topic...");
  const [nickname, setNickname] = useState("Nick name");
  const [isHost, setIsHost] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isQuestionWindowOpen, setIsQuestionWindowOpen] = useState(false);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastActionTimeRef = useRef<number>(0);
  const ACTION_COOLDOWN = 2000;

  useEffect(() => {
    if (window.electronAPI?.isQuestionWindowOpen) {
      window.electronAPI.isQuestionWindowOpen().then((isOpen) => {
        console.log("Initial question-window-status:", isOpen);
        setIsQuestionWindowOpen(isOpen);
      });
    }

    if (window.electronAPI?.onQuestionWindowStatus) {
      const cleanup = window.electronAPI.onQuestionWindowStatus((isOpen) => {
        console.log("Received question-window-status:", isOpen);
        setIsQuestionWindowOpen(isOpen);
      });
      return cleanup;
    }
  }, []);

  const { currentGesture: closeGesture } = useGesture({
    gesturePair: "open-close",
    enabled: !isQuestionWindowOpen,
  });

  const { currentGesture: sendReceiveGesture } = useGesture({
    gesturePair: "send-receive",
    enabled: !isQuestionWindowOpen,
  });

  const [displayGesture, setDisplayGesture] = useState<string | null>(null);

  useEffect(() => {
    const now = Date.now();
    if (now - lastActionTimeRef.current < ACTION_COOLDOWN) {
      return;
    }
    if (closeGesture.current) {
      setDisplayGesture(closeGesture.current);
    } else if (sendReceiveGesture.current) {
      setDisplayGesture(sendReceiveGesture.current);
    } else {
      const timer = setTimeout(() => {
        setDisplayGesture(null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [closeGesture.current, sendReceiveGesture.current]);

  useEffect(() => {
    const fetchOverlayData = async () => {
      try {
        const data = await window.electronAPI.getOverlayData();

        if (data) {
          setRoomCode((prev) => {
            console.log(
              "Previous roomCode:",
              prev,
              "New roomCode:",
              data.roomId
            );
            return data.roomId;
          });

          setIsHost((prev) => {
            const newIsHost = data.current_roles === "H";
            console.log("Previous isHost:", prev, "New isHost:", newIsHost);
            return newIsHost;
          });

          setNickname((prev) => {
            const newUsername = data.username;
            console.log(
              "Previous username:",
              prev,
              "New username:",
              newUsername
            );
            return newUsername;
          });
        }
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
    // Set initial toast action
    setAction(isHost ? Actions.room_created : Actions.room_joined);
    setTimeout(() => {
      setAction(null);
      setIsExpanded(false);
    }, 3000);
  }, [isHost, setAction]);

  const [toastProps, setToastProps] = useState<{
    question?: string;
    fileName?: string;
  }>({});
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Listen for toast action changes from IPC (e.g., from Settings window)
  useEffect(() => {
    if (window.electronAPI?.onToastAction) {
      const cleanup = window.electronAPI.onToastAction((action, data) => {
        const actionValue = action as Actions | null;

        // Clear existing timeout if any
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        setAction(actionValue);
        if (data) {
          setToastProps(data);
        } else {
          setToastProps({});
        }

        if (actionValue) {
          setIsExpanded(true);
          // Set new timeout
          timeoutRef.current = setTimeout(() => {
            setAction(null);
            setIsExpanded(false);
            timeoutRef.current = null;
          }, 3000);
        }
      });
      return () => {
        cleanup();
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [setAction]);

  // Resize window based on isExpanded state
  useEffect(() => {
    if (window.electronAPI) {
      // Only resize if not initial mount (initial mount will use window creation size)
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

  const leaveRoomMutation = useMutation({
    mutationFn: async (data: {
      roomId: string;
      username: string;
      current_roles: string;
    }) => {
      const response = await fetch(
        "https://filebertbackend.netlify.app/api/leave",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      return response.json();
    },
    onSuccess: async (responseData) => {
      if (responseData.success) {
        if (window.electronAPI?.switchToStartScreen) {
          await window.electronAPI.switchToStartScreen();
        }
        navigate("/");
        setShowConfirm(false);
      }
    },
    onError: (error) => {
      console.error("Failed to leave room:", error);
    },
  });

  const handleLeave = () => {
    let current_roles = "M";
    if (isHost) {
      current_roles = "H";
    }
    leaveRoomMutation.mutate({
      roomId: roomCode,
      username: nickname,
      current_roles,
    });
  };

  useEffect(() => {
    if (closeGesture.current === "Close Room" && !showConfirm) {
      setIsExpanded(true);
      setShowConfirm(true);
    }
  }, [closeGesture.current, showConfirm]);

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch(
        "https://filebertbackend.netlify.app/api/sending",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }
      return data;
    },
    onSuccess: () => {
      console.log("File uploaded successfully.");
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setToastProps({ fileName: "testupload1.txt" });
      setAction(Actions.send);
      setIsExpanded(true);
      timeoutRef.current = setTimeout(() => {
        setAction(null);
        setIsExpanded(false);
      }, 3000);
    },
    onError: (error: Error) => {
      console.error("Error uploading file:", error);
    },
  });

  const handleUpload = async () => {
    try {
      const blob = new Blob(["static file to upload for testing"], {
        type: "text/plain",
      });
      const staticFile = new File([blob], "testupload1.txt", {
        type: "text/plain",
      });

      const formData = new FormData();
      formData.append("file", staticFile);
      formData.append("username", nickname);
      formData.append("roomId", roomCode);

      uploadMutation.mutate(formData);
    } catch (error) {
      console.error("Error fetching static file:", error);
    }
  };

  const downloadMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await fetch(
        `https://filebertbackend.netlify.app/api/receive?roomId=${encodeURIComponent(
          code
        )}`
      );
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || res.statusText);
      }

      const blob = await res.blob();
      const disposition = res.headers.get("content-disposition") || "";
      let filename = `download_${code}`;
      const match = /filename\*?=([^;]+)/i.exec(disposition);
      if (match) {
        filename = match[1].replace(/(^"|"$)/g, "");
      }
      return { blob, filename };
    },
    onSuccess: ({ blob, filename }) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      console.log("File downloaded successfully.");

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setToastProps({ fileName: filename });
      setAction(Actions.receive);
      setIsExpanded(true);
      timeoutRef.current = setTimeout(() => {
        setAction(null);
        setIsExpanded(false);
      }, 3000);
    },
    onError: (error: Error) => {
      console.error(`Download error: ${error.message}`);
    },
  });

  const handleDownload = () => {
    downloadMutation.mutate(roomCode);
  };

  useEffect(() => {
    const now = Date.now();
    if (now - lastActionTimeRef.current < ACTION_COOLDOWN) {
      return;
    }

    if (sendReceiveGesture.current === "Send File" && !isQuestionWindowOpen) {
      if (!uploadMutation.isPending) {
        handleUpload();
        lastActionTimeRef.current = now;
      }
    } else if (
      sendReceiveGesture.current === "Receive File" &&
      !isQuestionWindowOpen
    ) {
      if (!downloadMutation.isPending) {
        handleDownload();
        lastActionTimeRef.current = now;
      }
    }
  }, [
    sendReceiveGesture.current,
    uploadMutation.isPending,
    downloadMutation.isPending,
  ]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "overflow-clip w-full h-full bg-card/90 border-b border-border/50 shadow-lg transition-all duration-300 ease-in-out p-0 flex flex-col",
        !isExpanded && "opacity-30"
      )}
    >
      {action && (
        <div className="absolute top-0 left-0 h-full right-0 z-50">
          <Toast
            action={action}
            props={{
              isLoading: false,
              fileName: "",
              code: roomCode,
              ...toastProps,
            }}
          />
        </div>
      )}
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
          "flex-1 flex items-center w-full transition-all duration-300 ease-in-out opacity-100 divide-x divide-border",
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
                    value={roomName}
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
                    value={roomCode}
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
        <div className={cn("flex items-center gap-4 px-4 h-full")}>
          <Button
            variant="ghost"
            className="text-foreground hover:bg-accent h-16 flex flex-col items-center justify-center"
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
            className="text-foreground hover:bg-accent flex h-16 flex-col items-center justify-center py-4 px-2"
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

          <Button
            variant="ghost"
            className="text-foreground flex h-16 flex-col items-center justify-center hover:bg-accent"
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

          <Button
            variant="ghost"
            className="text-foreground flex h-16 flex-col items-center justify-center hover:bg-accent"
            title="Leave"
            onClick={() => setShowConfirm(true)}
          >
            <LogOut className={cn("h-5 w-5", isExpanded && "h-16 w-16")} />
            {isExpanded && <span className="text-xs">Leave</span>}
          </Button>
        </div>
      </div>

      <div className="h-8 bg-muted/30 border-t border-border/50 flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground shrink-0">
        <Hand
          className={cn(
            "w-3 h-3",
            displayGesture && "text-primary animate-pulse"
          )}
        />
        {displayGesture ? (
          <span className="text-primary animate-in fade-in slide-in-from-bottom-1">
            Gesture Detected: {displayGesture}
          </span>
        ) : (
          <span className="opacity-50">Waiting for gesture...</span>
        )}
      </div>
    </div>
  );
};
