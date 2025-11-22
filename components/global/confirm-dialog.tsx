import { Button } from "@/components/ui/button";

export const ConfirmDialog = ({
  onConfirm,
  onCancel,
  title,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
}) => {
  return (
    <div className="w-full h-full fixed z-50 inset-0 bg-primary/50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-card border border-border p-6 rounded-lg shadow-lg flex flex-col gap-4 min-w-[400px]">
        <span className="text-sm font-normal text-foreground">{title}</span>
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Confirm</Button>
        </div>
      </div>
    </div>
  );
};
