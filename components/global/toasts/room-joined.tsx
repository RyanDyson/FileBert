import { Input } from "@/components/ui/input";
import { CopyButton } from "../copy-button";

export const RoomJoinedToast = ({ code }: { code: string }) => {
  return (
    <div className="w-full h-full flex flex-col divide-y divide-border bg-card items-center justify-center">
      <span>Joined room successfully</span>
      <div>
        <Input value={code} disabled />
        <CopyButton
          textToCopy={code}
          defaultTooltipText="Copy Room Code"
          copiedTooltipText="Copied to Clipboard"
        />
      </div>
    </div>
  );
};
