import { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { useHandPoseModel } from "../lib/gesture/useHandPoseModel";

const GestureDetector = ({
  videoElement,
  gesturePair,
}: {
  videoElement: HTMLVideoElement;
  gesturePair: "send-receive" | "yes-no" | "open-close";
}): null => {
  const cameraRef = useRef<HTMLVideoElement>(videoElement);

  const { hands, currentGesture } = useHandPoseModel({
    cameraRef,
    gesturePair,
  });

  useEffect(() => {
    // Send data when it changes
    if (window.electronAPI?.sendGestureData) {
      window.electronAPI.sendGestureData({
        hands,
        currentGesture: currentGesture.current,
      });
    }
  }, [hands, currentGesture]);

  return null;
};

export const GestureWorker = () => {
  const webcamRef = useRef<Webcam>(null);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(
    null
  );
  const [gesturePair, setGesturePair] = useState<
    "send-receive" | "yes-no" | "open-close"
  >("open-close");

  useEffect(() => {
    // Listen for config changes
    if (window.electronAPI?.onGestureConfig) {
      const cleanup = window.electronAPI.onGestureConfig((config) => {
        console.log("Worker received config:", config);
        setGesturePair(
          config.gesturePair as "send-receive" | "yes-no" | "open-close"
        );
      });
      return cleanup;
    }
  }, []);

  const handleUserMedia = () => {
    if (webcamRef.current && webcamRef.current.video) {
      console.log("Webcam ready in worker");
      setVideoElement(webcamRef.current.video);
    }
  };

  return (
    <div style={{ opacity: 0, pointerEvents: "none" }}>
      <h1>Gesture Worker</h1>
      <Webcam
        ref={webcamRef}
        onUserMedia={handleUserMedia}
        onUserMediaError={(e) => console.error("Worker Camera Error", e)}
        width={640}
        height={480}
      />
      {videoElement && (
        <GestureDetector
          videoElement={videoElement}
          gesturePair={gesturePair}
        />
      )}
    </div>
  );
};
