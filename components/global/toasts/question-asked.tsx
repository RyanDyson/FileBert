import { MessageCircleQuestion } from "lucide-react";

export const QuestionAskedToast = () => {
  return (
    <div className="w-full h-full flex flex-col gap-2 bg-card items-center justify-center">
      <MessageCircleQuestion className="w-8 h-8" />
      <span className="text-sm font-medium w-full text-center pb-1">
        Pinging User Successfully
      </span>
    </div>
  );
};
