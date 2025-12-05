import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGesture } from "@/src/lib/gesture/useGesture";
import { useEffect } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nicknameSchema = (z as any).object({
  nickname: z
    .string()
    .min(1, "Nickname is required")
    .min(2, "Nickname must be at least 2 characters")
    .max(50, "Nickname must be less than 50 characters"),
});

type NicknameForm = z.infer<typeof nicknameSchema>;

// Helper function to convert Zod errors to FieldError format
const formatZodError = (error: unknown): string => {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  return "Validation error";
};

export const NicknamePopup = ({
  onConfirm,
  onCancel,
  errorMessage,
  isPending,
}: {
  onConfirm: (nickname: string) => void;
  onCancel: () => void;
  errorMessage?: string;
  isPending?: boolean;
}) => {
  const { isLoading: isLoadingGesture, currentGesture } = useGesture({
    gesturePair: "open-close",
  });

  const form = useForm<NicknameForm>({
    resolver: zodResolver(nicknameSchema),
    defaultValues: {
      nickname: "",
    },
  });

  const onSubmit = (data: NicknameForm) => {
    onConfirm(data.nickname);
  };

  useEffect(() => {
    if (
      currentGesture.current === "Open Room" &&
      !isLoadingGesture &&
      !isPending
    ) {
      form.handleSubmit(onSubmit)();
    }
  }, [currentGesture.current, isLoadingGesture, isPending]);

  return (
    <div className="w-full h-full fixed z-50 inset-0 bg-primary/50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-card border border-border p-6 rounded-lg shadow-lg flex flex-col gap-4 min-w-[400px]">
        <h2 className="text-lg font-semibold text-foreground">
          Enter Your Nickname
        </h2>
        <p className="text-sm text-muted-foreground">
          Please enter your nickname to join the room.
        </p>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <Field className="w-full gap-2">
            <FieldLabel htmlFor="nickname">Nickname</FieldLabel>
            <FieldContent>
              <Input
                id="nickname"
                {...form.register("nickname")}
                placeholder="Enter your nickname"
                className="bg-background"
                aria-invalid={!!form.formState.errors.nickname}
                autoFocus
                disabled={isPending || form.formState.isSubmitting}
              />
            </FieldContent>
            {form.formState.errors.nickname && (
              <FieldError
                errors={[
                  {
                    message:
                      typeof form.formState.errors.nickname?.message ===
                      "string"
                        ? form.formState.errors.nickname.message
                        : formatZodError(form.formState.errors.nickname),
                  },
                ]}
              />
            )}
          </Field>

          {errorMessage && (
            <p className="text-sm text-destructive text-center">
              {errorMessage}
            </p>
          )}

          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={onCancel}
              disabled={isPending || form.formState.isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={form.formState.isSubmitting || isPending}
            >
              {form.formState.isSubmitting || isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
