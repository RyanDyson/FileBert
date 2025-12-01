import { CheckCircle2, XCircle } from "lucide-react";

export const QuestionAnsweredToast = ({ answer }: { answer: boolean }) => {
  return (
    <div className="w-full h-full flex flex-col gap-2 bg-card items-center justify-center">
      {answer ? (
        <CheckCircle2 className="w-8 h-8" />
      ) : (
        <XCircle className="w-8 h-8" />
      )}
      <span className="text-sm font-medium w-full text-center pb-1">
        You answered {answer ? "Yes" : "No"}
      </span>
    </div>
  );
};
