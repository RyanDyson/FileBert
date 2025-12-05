import { File, Loader2 } from "lucide-react";

export const DownloadFileToast = ({
  fileName,
  isDownloading = false,
}: {
  fileName: string;
  isDownloading: boolean;
}) => {
  return (
    <div className="w-full h-full flex flex-col gap-2 bg-card items-center justify-center">
      {isDownloading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm font-medium w-full text-center pb-1">
            Downloading {fileName}
          </span>
        </>
      ) : (
        <>
          <File className="w-8 h-8" />
          <span className="text-sm font-medium w-full text-center pb-1">
            Downloaded {fileName}
          </span>
        </>
      )}
    </div>
  );
};
