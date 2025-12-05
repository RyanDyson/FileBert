import { TimerOff } from "lucide-react";

export const QuestionTimeoutToast = ({ question }: { question?: string }) => {
  return (
    <div className="w-full h-full flex flex-col gap-1 bg-card items-center justify-center px-4">
      <TimerOff className="w-8 h-8 text-muted-foreground" />
      <span className="text-sm font-medium w-full text-center">Time's up!</span>
      {question && (
        <span className="text-xs text-muted-foreground w-full text-center line-clamp-1">
          {question}
        </span>
      )}
    </div>
  );
};
