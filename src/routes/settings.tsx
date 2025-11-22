import { WindowWrapper } from "@/components/global/window-wrapper";
import { Actions } from "@/components/global/toast-config";
import { Button } from "@/components/ui/button";

export const Settings = () => {
  const handleSetAction = async (action: Actions) => {
    if (window.electronAPI?.setToastAction) {
      await window.electronAPI.setToastAction(action);
    }
  };

  return (
    <WindowWrapper title="FileBert - Settings">
      {/* Main Content */}
      <div className="text-sm font-medium text-muted-foreground px-6 py-2">
        Dev settings
      </div>
      <div className="flex-1 flex flex-col items-start gap-2 justify-center px-6 py-8">
        {Object.values(Actions).map((action) => (
          <Button key={action} onClick={() => handleSetAction(action)}>
            {action}
          </Button>
        ))}
      </div>
    </WindowWrapper>
  );
};
