import { Input } from "@/components/ui/input";
import { CopyButton } from "../copy-button";

export const RoomCreateToast = ({ code }: { code: string }) => {
  return (
    <div className="w-full h-full flex flex-col divide-y divide-border bg-card items-center justify-center">
      <span className="text-sm font-medium w-full text-center pb-1">
        Room created successfully
      </span>
      <div className="flex items-center gap-2 pt-2 ">
        <Input
          className="bg-primary-foreground text-secondary-foreground min-w-64"
          value={code}
          disabled
        />
        <CopyButton
          textToCopy={code}
          defaultTooltipText="Copy Room Code"
          copiedTooltipText="Copied to Clipboard"
        />
      </div>
    </div>
  );
};
