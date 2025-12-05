//some testing component for toasts, do not use in prod

import { RoomCreateToast } from "./toasts/room-created";
import { RoomJoinedToast } from "./toasts/room-joined";
import { UserJoinedToast } from "./toasts/user-joined";
import { SendFileToast } from "./toasts/send-file";
import { DownloadFileToast } from "./toasts/receive-file";
import { PingerUserToast } from "./toasts/pinged-user";
import { QuestionAskedToast } from "./toasts/question-asked";
import { QuestionAnsweredToast } from "./toasts/questio-answered";
import { QuestionTimeoutToast } from "./toasts/question-timeout";
import React from "react";

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
  question_timeout = "question_timeout", //toast for user, when their question times out
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
  [Actions.question_timeout]: {
    content: <QuestionTimeoutToast />,
  },
};

type ToastProps = {
  isLoading?: boolean;
  fileName?: string;
  code?: string;
  question?: string; // Added question prop
};

export const Toast = ({
  action,
  props,
}: {
  action: Actions;
  props: ToastProps;
}) => {
  // Clone element to pass additional props like question
  const content = toastConfig[action].content;
  if (React.isValidElement(content)) {
    return (
      <div className="w-full h-full">
        {React.cloneElement(content as React.ReactElement, { ...props })}
      </div>
    );
  }
  return <div className="w-full h-full">{content}</div>;
};
