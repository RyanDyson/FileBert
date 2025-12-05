import { Field, FieldLabel, FieldContent } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v3";
import { useRef, useState, useEffect } from "react";
import { NicknamePopup } from "@/components/global/nickname-popup";
import { Loader2 } from "lucide-react";
import { WindowWrapper } from "@/components/global/window-wrapper";
import { useQuery } from "@tanstack/react-query";
import Webcam from "react-webcam";
import { useGesture } from "../lib/gesture/useGesture";
import { GestureType } from "../lib/gesture/useGesture";
import useGesture1 from "../hooks/useGesture1";

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
  roomCode: z
    .string()
    .min(1, "Room code is required")
    .regex(/^\d{6}$/, "Room code must be exactly 6 digits"),
});

type CreateRoomForm = z.infer<typeof createRoomSchema>;
type JoinRoomForm = z.infer<typeof joinRoomSchema>;

export const Start = () => {
  const [showNicknamePopup, setShowNicknamePopup] = useState(false);
  const [joinRoomCode, setJoinRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const webcamRef = useRef(null);
  // const { isLoading, error, currentGesture } = useGesture1({
  //   cameraRef: {
  //     current: webcamRef.current?.video || null,
  //   },
  //   gesturePair: "open-close",
  // });

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

  const onCreateRoomSubmit = async (dataForm: CreateRoomForm) => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://filebertbackend.netlify.app/api/createRoom",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: dataForm.nickname }),
        }
      );

      const responseData = await response.json();
      const roomId = responseData.roomId;
      const current_roles = responseData.current_roles;
      const username = dataForm.nickname;

      if (!response.ok) {
        throw new Error("Failed to create room");
      }

      setTimeout(async () => {
        setLoading(false);
        if (window.electronAPI?.switchToOverlay) {
          console.log("Nickname received in main process:", username);
          await window.electronAPI.switchToOverlay(
            roomId,
            current_roles,
            username
          );
        }
      }, 1000);
    } catch (error) {
      console.error("Failed to create room:", error);
      setLoading(false);
    }
  };

  const onJoinRoomSubmit = async (data: JoinRoomForm) => {
    setLoading(true);
    try {
      //call in set nickname

      // Simulate successful join - show nickname popup
      setTimeout(async () => {
        setJoinRoomCode(data.roomCode);
        setShowNicknamePopup(true);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Failed to join room:", error);
      setLoading(false);
    }
  };

  const handleNicknameSubmit = async (nickname: string) => {
    try {
      const response = await fetch(
        "https://filebertbackend.netlify.app/api/join",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ roomId: joinRoomCode, username: nickname }),
        }
      );

      const responseData = await response.json();
      const roomId = responseData.roomId;
      const current_roles = responseData.current_roles;
      const username = nickname;

      if (!response.ok) {
        throw new Error("Failed to create room");
      }

      setShowNicknamePopup(false);
      if (window.electronAPI?.switchToOverlay) {
        await window.electronAPI.switchToOverlay(
          roomId,
          current_roles,
          username
        );
      }
    } catch (error) {
      console.error("Failed to submit nickname:", error);
    }
  };

  // Get all errors from create room form
  const createRoomErrors = Object.values(createRoomForm.formState.errors);
  const joinRoomErrors = Object.values(joinRoomForm.formState.errors);

  return (
    <WindowWrapper title="FileBert">
      {loading && (
        <div className="w-full h-full fixed inset-0 bg-primary/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Loader2 className="w-8 h-8 animate-spin text-primary-foreground" />
        </div>
      )}

      {showNicknamePopup && (
        <NicknamePopup
          onConfirm={handleNicknameSubmit}
          onCancel={() => setShowNicknamePopup(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 w-full h-full flex flex-col items-center justify-center px-6 py-8 max-w-md mx-auto w-full gap-4">
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
                placeholder="123456"
                className="bg-primary-foreground text-secondary-foreground"
                aria-invalid={!!joinRoomForm.formState.errors.roomCode}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
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

        <Webcam hidden={true} ref={webcamRef} />
        {/* <p>{currentGesture.current}</p> */}
      </div>
    </WindowWrapper>
  );
};
