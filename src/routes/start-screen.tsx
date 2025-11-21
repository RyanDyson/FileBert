import { useNavigate } from "react-router-dom";
import { Field, FieldLabel, FieldContent } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { NativeSelect } from "@/components/ui/native-select";
import { useState } from "react";

export const StartScreen = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateRoom = async () => {
    //api call to create room
    try {
      if (window.electronAPI?.switchToOverlay) {
        await window.electronAPI.switchToOverlay();
      }
      navigate("/overlay");
    } catch (error) {
      console.error(error);
    }
  };

  const handleJoinRoom = async () => {
    //api call to join room
    try {
      if (window.electronAPI?.switchToOverlay) {
        await window.electronAPI.switchToOverlay();
      }
      navigate("/overlay");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-full h-full bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center pl-28 justify-between px-6 py-1 border-b border-border">
        <h1 className="text-2xl font-bold text-foreground">Rooms</h1>
        <span className="text-sm text-muted-foreground">FileBert</span>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 max-w-md mx-auto w-full gap-4">
        {/* Create Room Button */}
        <Button
          onClick={handleCreateRoom}
          className="w-full bg-secondary-foreground h-12 text-base font-medium"
          size="lg"
        >
          Create Room
        </Button>

        {/* Separator */}
        <div className="relative w-full flex items-center">
          <Separator className="flex-1" />
          <span className="px-4 text-sm text-muted-foreground bg-background">
            or
          </span>
          <Separator className="flex-1" />
        </div>

        {/* Room Name Field */}
        <Field className="w-full gap-2">
          <FieldLabel>Room Name</FieldLabel>
          <FieldContent>
            <Input
              placeholder="Lecture - Example Topic..."
              className="bg-primary-foreground text-secondary-foreground"
            />
          </FieldContent>
        </Field>

        {/* Room Code Field */}
        <Field className="w-full gap-2">
          <FieldLabel>Room Code</FieldLabel>
          <FieldContent>
            <div className="flex items-center gap-2">
              <NativeSelect className="w-16 bg-primary-foreground text-secondary-foreground text-center flex justify-center items-center">
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </NativeSelect>
              <span className="text-muted-foreground">-</span>
              <Input
                placeholder="123456"
                className="flex-1 bg-primary-foreground text-secondary-foreground"
              />
            </div>
          </FieldContent>
        </Field>

        {/* Join Room Button */}
        <Button
          onClick={handleJoinRoom}
          className="w-full h-12 bg-secondary-foreground text-base font-medium"
          size="lg"
        >
          Join Room
        </Button>
      </div>
    </div>
  );
};
