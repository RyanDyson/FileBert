import { User } from "lucide-react";

export const UserJoinedToast = ({ name }: { name: string }) => {
  return (
    <div className="w-full h-full flex flex-col gap-2 bg-card items-center justify-center">
      <User className="w-8 h-8" />
      <span className="text-sm font-medium w-full text-center pb-1">
        {name} joined the room
      </span>
    </div>
  );
};
