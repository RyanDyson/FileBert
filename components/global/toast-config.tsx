//some testing component for toasts, do not use in prod

import { RoomCreateToast } from "./toasts/room-created";
import { RoomJoinedToast } from "./toasts/room-joined";
import { UserJoinedToast } from "./toasts/user-joined";
import { SendFileToast } from "./toasts/send-file";
import { DownloadFileToast } from "./toasts/receive-file";
import { PingerUserToast } from "./toasts/pinged-user";
import { QuestionAskedToast } from "./toasts/question-asked";
import { QuestionAnsweredToast } from "./toasts/questio-answered";

export enum Actions {
  send = "send",
  receive = "receive",
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
    content: <SendFileToast fileName="example.pdf" isSending={false} />,
  },
  [Actions.receive]: {
    content: <DownloadFileToast fileName="example.pdf" isDownloading={false} />,
  },
  [Actions.pinged]: {
    content: <PingerUserToast />,
  },
  [Actions.room_created]: {
    content: <RoomCreateToast code="123456" />,
  },
  [Actions.room_joined]: {
    content: <RoomJoinedToast code="123456" />,
  },
  [Actions.user_joined]: {
    content: <UserJoinedToast name="John Doe" />,
  },
  [Actions.question_asked]: {
    content: <QuestionAskedToast />,
  },
  [Actions.question_answered_yes]: {
    content: <QuestionAnsweredToast answer={true} />,
  },
  [Actions.question_answered_no]: {
    content: <QuestionAnsweredToast answer={false} />,
  },
};

type ToastProps = {
  isLoading?: boolean;
  fileName?: string;
  code?: string;
};

export const Toast = ({
  action,
  props,
}: {
  action: Actions;
  props: ToastProps;
}) => {
  return <div className="w-full h-full">{toastConfig[action].content}</div>;
};
