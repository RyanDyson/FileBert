export const WindowWrapper = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="w-full h-full bg-card flex flex-col">
      <div
        className="flex items-center pl-28 justify-end px-6 py-3 border-b border-border"
        style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
      >
        <span className="text-sm text-muted-foreground">{title}</span>
      </div>
      <div className="flex-1 w-full h-full">{children}</div>
    </div>
  );
};
