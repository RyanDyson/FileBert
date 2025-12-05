import { File, Loader2 } from "lucide-react";

export const SendFileToast = ({
  fileName,
  isSending = false,
}: {
  fileName: string;
  isSending: boolean;
}) => {
  return (
    <div className="w-full h-full flex flex-col gap-2 bg-card items-center justify-center">
      {isSending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm font-medium w-full text-center pb-1">
            Sending {fileName}
          </span>
        </>
      ) : (
        <>
          <File className="w-8 h-8" />
          <span className="text-sm font-medium w-full text-center pb-1">
            Gesture to send {fileName}
          </span>
        </>
      )}
    </div>
  );
};
