//some testing component for toasts, do not use in prod

import { RoomCreateToast } from "./toasts/room-created";
import { RoomJoinedToast } from "./toasts/room-joined";

export enum Actions {
  send = "send",
  receive = "receive",
  reject = "reject",
  pinged = "pinged",
  room_created = "room_created",
  room_joined = "room_joined", //toast for user, when they join the room
  user_joined = "user_joined", //toast for host, when a user joins the room
  question_asked = "question_asked", //toast for host, when a user asks a question
  question_answered_yes = "question_answered_yes", //toast for user, when their question is answered yes
  question_answered_no = "question_answered_no", //toast for user, when their question is answered no
}

export const toastConfig: Record<
  Actions,
  {
    content: React.ReactNode;
  }
> = {
  [Actions.send]: {
    content: <></>,
  },
  [Actions.receive]: {
    content: <></>,
  },
  [Actions.reject]: {
    content: <></>,
  },
  [Actions.pinged]: {
    content: <></>,
  },
  [Actions.room_created]: {
    content: <RoomCreateToast code="123456" />,
  },
  [Actions.room_joined]: {
    content: <RoomJoinedToast code="123456" />,
  },
  [Actions.user_joined]: {
    content: <></>,
  },
  [Actions.question_asked]: {
    content: <></>,
  },
  [Actions.question_answered_yes]: {
    content: <></>,
  },
  [Actions.question_answered_no]: {
    content: <></>,
  },
};

export const Toast = ({ action }: { action: Actions }) => {
  return <div className="w-full h-full">{toastConfig[action].content}</div>;
};
