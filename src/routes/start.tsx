import { Field, FieldLabel, FieldContent } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v3";
import { useState, useEffect } from "react";
import { NicknamePopup } from "@/components/global/nickname-popup";
import { Loader2 } from "lucide-react";
import { WindowWrapper } from "@/components/global/window-wrapper";
import { useMutation } from "@tanstack/react-query";
import { useGesture } from "../lib/gesture/useGesture";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

const formatZodError = (error: unknown): string => {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  return "Validation error";
};

const createRoomSchema = z.object({
  roomName: z
    .string()
    .min(1, "Room name is required")
    .min(3, "Room name must be at least 3 characters")
    .max(100, "Room name must be less than 100 characters"),
  nickname: z
    .string()
    .min(1, "Nickname is required")
    .min(2, "Nickname must be at least 2 characters")
    .max(50, "Nickname must be less than 50 characters"),
});

const joinRoomSchema = z.object({
  roomCode: z.string().min(1, "Room code is required"),
});

type CreateRoomForm = z.infer<typeof createRoomSchema>;
type JoinRoomForm = z.infer<typeof joinRoomSchema>;

interface RoomResponse {
  roomId: string;
  current_roles: string;
}

export const Start = () => {
  const [showNicknamePopup, setShowNicknamePopup] = useState(false);
  const [joinRoomCode, setJoinRoomCode] = useState("");
  const [joinError, setJoinError] = useState<string | undefined>(undefined);
  const {
    isLoading: isLoadingGesture,
    error: errorGesture,
    currentGesture,
  } = useGesture({
    gesturePair: "open-close",
  });

  const createRoomMutation = useMutation({
    mutationFn: async (data: { nickname: string }) => {
      const response = await fetch(
        "https://filebertbackend.netlify.app/api/createRoom",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: data.nickname }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to create room");
      }
      return response.json();
    },
    onSuccess: (data: RoomResponse, variables: { nickname: string }) => {
      setTimeout(async () => {
        if (window.electronAPI?.switchToOverlay) {
          console.log("Nickname received in main process:", variables.nickname);
          await window.electronAPI.switchToOverlay(
            data.roomId,
            data.current_roles,
            variables.nickname
          );
        }
      }, 1000);
    },
  });

  const joinRoomMutation = useMutation({
    mutationFn: async (data: { roomId: string; username: string }) => {
      const response = await fetch(
        "https://filebertbackend.netlify.app/api/join",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to join room");
      }
      return response.json();
    },
    onSuccess: (
      data: RoomResponse,
      variables: { roomId: string; username: string }
    ) => {
      setShowNicknamePopup(false);
      if (window.electronAPI?.switchToOverlay) {
        window.electronAPI.switchToOverlay(
          data.roomId,
          data.current_roles,
          variables.username
        );
      }
    },
    onError: (error) => {
      setJoinError(error.message || "Failed to join room");
    },
  });

  const createRoomForm = useForm<CreateRoomForm>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      roomName: "",
      nickname: "",
    },
  });

  const joinRoomForm = useForm<JoinRoomForm>({
    resolver: zodResolver(joinRoomSchema),
    defaultValues: {
      roomCode: "",
    },
  });

  const onCreateRoomSubmit = (dataForm: CreateRoomForm) => {
    createRoomMutation.mutate({ nickname: dataForm.nickname });
  };

  useEffect(() => {
    if (currentGesture.current === "Open Room") {
      toast.success("Gesture detected: " + currentGesture.current);
    }
    if (errorGesture) {
      toast.error("Error detected: " + errorGesture);
    }

    if (currentGesture.current === "Open Room") {
      if (createRoomForm.formState.isValid) {
        createRoomForm.handleSubmit(onCreateRoomSubmit)();
      }
      if (joinRoomCode.length === 6) {
        onJoinRoomSubmit(joinRoomForm.getValues());
      }
    }
  }, [
    currentGesture.current,
    errorGesture,
    createRoomForm.formState.isValid,
    joinRoomCode,
  ]);

  const onJoinRoomSubmit = async (data: JoinRoomForm) => {
    // Simulate successful join - show nickname popup
    setTimeout(() => {
      setJoinError(undefined);
      setJoinRoomCode(data.roomCode);
      setShowNicknamePopup(true);
    }, 1000);
  };

  const handleNicknameSubmit = (nickname: string) => {
    setJoinError(undefined);
    joinRoomMutation.mutate({ roomId: joinRoomCode, username: nickname });
  };

  // Get all errors from create room form
  const createRoomErrors = Object.values(createRoomForm.formState.errors);
  const joinRoomErrors = Object.values(joinRoomForm.formState.errors);

  return (
    <WindowWrapper title="FileBert">
      <Toaster className="z-50 " />
      {(createRoomMutation.isPending ||
        joinRoomMutation.isPending ||
        isLoadingGesture) && (
        <div className="w-full h-full fixed inset-0 bg-primary/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Loader2 className="w-8 h-8 animate-spin text-primary-foreground" />
        </div>
      )}

      {showNicknamePopup && (
        <NicknamePopup
          onConfirm={handleNicknameSubmit}
          onCancel={() => setShowNicknamePopup(false)}
          errorMessage={joinError}
          isPending={joinRoomMutation.isPending}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 h-full flex flex-col items-center justify-center px-6 py-8 pb-16 max-w-md mx-auto w-full gap-4">
        {/* Create Room Form */}
        <form
          onSubmit={createRoomForm.handleSubmit(onCreateRoomSubmit)}
          className="w-full flex flex-col gap-4"
        >
          <Field className="w-full gap-2">
            <FieldLabel htmlFor="roomName">Room Name</FieldLabel>
            <FieldContent>
              <Input
                id="roomName"
                {...createRoomForm.register("roomName")}
                placeholder="Lecture - Example Topic..."
                className="bg-primary-foreground text-secondary-foreground"
                aria-invalid={!!createRoomForm.formState.errors.roomName}
              />
            </FieldContent>
          </Field>

          <Field className="w-full gap-2">
            <FieldLabel htmlFor="nickname">Your Nickname</FieldLabel>
            <FieldContent>
              <Input
                id="nickname"
                {...createRoomForm.register("nickname")}
                placeholder="Enter your nickname"
                className="bg-primary-foreground text-secondary-foreground"
                aria-invalid={!!createRoomForm.formState.errors.nickname}
              />
            </FieldContent>
          </Field>

          <Button
            type="submit"
            className="w-full bg-secondary-foreground h-12 text-base font-medium cursor-pointer"
            size="lg"
            disabled={
              createRoomForm.formState.isSubmitting ||
              createRoomErrors.length > 0
            }
          >
            {createRoomForm.formState.isSubmitting
              ? "Creating..."
              : "Create Room"}
          </Button>

          {/* Combined field errors below submit button */}
          <div className="flex flex-col gap-1">
            {createRoomErrors.map((error, index) => (
              <span className="text-xs text-destructive" key={index}>
                {error?.message || formatZodError(error)}
              </span>
            ))}
          </div>
        </form>

        {/* Separator */}
        <div className="relative w-full flex items-center">
          <Separator className="flex-1" />
          <span className="px-4 text-sm text-muted-foreground bg-card">or</span>
          <Separator className="flex-1" />
        </div>

        {/* Join Room Form */}
        <form
          onSubmit={joinRoomForm.handleSubmit(onJoinRoomSubmit)}
          className="w-full flex flex-col gap-4"
        >
          <Field className="w-full gap-2">
            <FieldLabel htmlFor="roomCode">Room Code</FieldLabel>
            <FieldContent>
              <Input
                id="roomCode"
                {...joinRoomForm.register("roomCode")}
                placeholder="Enter room code"
                className="bg-primary-foreground text-secondary-foreground"
                aria-invalid={!!joinRoomForm.formState.errors.roomCode}
                type="text"
                onChange={(e) => {
                  setJoinRoomCode(e.target.value);
                }}
              />
            </FieldContent>
          </Field>

          <Button
            type="submit"
            className="w-full h-12 bg-secondary-foreground text-base font-medium cursor-pointer"
            size="lg"
            disabled={
              joinRoomForm.formState.isSubmitting || joinRoomErrors.length > 0
            }
          >
            {joinRoomForm.formState.isSubmitting ? "Joining..." : "Join Room"}
          </Button>

          {/* Combined field errors below submit button */}
          <div className="flex flex-col gap-1">
            {joinRoomErrors.map((error, index) => (
              <span className="text-xs text-destructive" key={index}>
                {error?.message || formatZodError(error)}
              </span>
            ))}
          </div>
        </form>
      </div>
    </WindowWrapper>
  );
};
