import { CheckCircle2, XCircle } from "lucide-react";

export const QuestionAnsweredToast = ({
  answer,
  question,
}: {
  answer: boolean;
  question?: string;
}) => {
  return (
    <div className="w-full h-full flex flex-col gap-1 bg-card items-center justify-center px-4">
      {answer ? (
        <CheckCircle2 className="w-8 h-8 text-green-500" />
      ) : (
        <XCircle className="w-8 h-8 text-red-500" />
      )}
      <span className="text-sm font-medium w-full text-center">
        You answered {answer ? "Yes" : "No"}
      </span>
      {question && (
        <span className="text-xs text-muted-foreground w-full text-center line-clamp-1">
          {question}
        </span>
      )}
    </div>
  );
};
