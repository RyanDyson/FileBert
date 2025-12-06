import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import { useEffect, useState, useRef } from "react";

export interface UseHandPoseModelOptions {
  cameraRef: React.RefObject<HTMLVideoElement>;
  gesturePair: "send-receive" | "yes-no" | "open-close"; // Added gesturePair parameter
}

export interface HandPrediction {
  landmarks: [number, number, number][]; // Array of [x, y, z] coordinates for landmarks
}

export const useHandPoseModel = ({
  cameraRef,
  gesturePair,
}: UseHandPoseModelOptions) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hands, setHands] = useState<HandPrediction[]>([]);
  const currentGesture = useRef<string | null>(null);
  const wasHandAbsent = useRef(true);
  const modelRef = useRef<handpose.HandPose | null>(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.ready();
        await tf.setBackend("webgl");

        if (!modelRef.current) {
          modelRef.current = await handpose.load();
          console.log("Handpose model loaded");
        }
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to load Handpose model:", err);
        setError("Failed to load Handpose model");
      }
    };

    loadModel();

    return () => {
      modelRef.current = null;
    };
  }, []);

  useEffect(() => {
    const detectGesture = (landmarks: [number, number, number][]) => {
      if (!landmarks || landmarks.length < 21) {
        currentGesture.current = null;
        return;
      }

      const wrist = landmarks[0];
      const thumb = landmarks[4];
      const index = landmarks[8];
      const middle = landmarks[12];
      const ring = landmarks[16];
      const pinky = landmarks[20];
      const thumbMCP = landmarks[2];
      const middleMCP = landmarks[9];

      const palmSize = Math.sqrt(
        Math.pow(middleMCP[0] - wrist[0], 2) +
          Math.pow(middleMCP[1] - wrist[1], 2) -
          100 // Subtracting 100 to adjust sensitivity
      );

      if (palmSize < 0.05) {
        currentGesture.current = null;
        return;
      }

      const fingerDistances = [index, middle, ring, pinky].map((finger) =>
        Math.sqrt(
          Math.pow(finger[0] - wrist[0], 2) + Math.pow(finger[1] - wrist[1], 2)
        )
      );
      const indexDistance = Math.sqrt(
        Math.pow(index[0] - wrist[0], 2) + Math.pow(index[1] - wrist[1], 2)
      );

      console.log("index distance:", indexDistance);
      console.log("palmSize:", palmSize);

      const fistThreshold = palmSize * 1; // Adjusted threshold for better separation

      const fingersCurled = fingerDistances.map(
        (distance) => distance < fistThreshold
      );
      const fingersExpanded = fingerDistances.map(
        (distance) => distance > fistThreshold
      );

      const fingersCurledConfidence =
        fingersCurled
          .map((c: boolean) => (c ? 1 : 0))
          .reduce((a, b) => a + b, 0) / fingerDistances.length;
      const fingersExpandedConfidence =
        fingersExpanded
          .map((c: boolean) => (c ? 1 : 0))
          .reduce((a, b) => a + b, 0) / fingerDistances.length;

      console.log("Fingers Curled Confidence:", fingersCurledConfidence);
      console.log("Fingers Expanded Confidence:", fingersExpandedConfidence);

      if (!fingersCurled && !fingersExpanded) {
        currentGesture.current = null;
        wasHandAbsent.current = true;
        return;
      }

      const isThumbUp = fingersCurled && thumb[1] < thumbMCP[1];
      const isThumbDown = fingersCurled && thumb[1] > thumbMCP[1];

      //open: index + thumb ,close: thumb touch pinkiy
      // open
      const dist_thumb_index = Math.sqrt(
        Math.pow(thumb[0] - index[0], 2) + Math.pow(thumb[1] - index[1], 2)
      );

      const dist_thumb_pinky = Math.sqrt(
        Math.pow(thumb[0] - pinky[0], 2) + Math.pow(thumb[1] - pinky[1], 2)
      );

      if (!wasHandAbsent.current && !fingersExpanded) {
        currentGesture.current = null;
        return;
      }

      // Gesture recognition with state tracking
      if (gesturePair === "open-close") {
        if (dist_thumb_index < 15) {
          currentGesture.current = "Open Room";
        }
        else if (dist_thumb_pinky < 15) {
          currentGesture.current = "Close Room";
        } else {
          currentGesture.current = null;
        }
      } else if (gesturePair === "yes-no") {
        if (isThumbUp) {
          currentGesture.current = "Yes";
        } else if (isThumbDown) {
          currentGesture.current = "No";
        } else {
          currentGesture.current = null;
        }
      } else if (gesturePair === "send-receive") {
        if (fingersExpandedConfidence > 0.8) {
          currentGesture.current = "Send File";
        } else if (fingersCurledConfidence > 0.8) {
          currentGesture.current = "Receive File";
        } else {
          currentGesture.current = null;
        }
      }

      console.log(currentGesture.current);
      wasHandAbsent.current = !fingersExpanded;
    };

    const initializeGestureDetection = async () => {
      if (!cameraRef.current) {
        setError("Camera reference is not available.");
        setIsLoading(false);
        return;
      }

      try {
        const detect = async () => {
          if (cameraRef.current && modelRef.current) {
            const predictions = await modelRef.current.estimateHands(
              cameraRef.current
            );

            // Update hands state first
            const newHands = predictions.map((prediction) => ({
              landmarks: prediction.landmarks,
            }));
            setHands(newHands);

            if (predictions.length > 0) {
              const { landmarks } = predictions[0];
              detectGesture(landmarks);

              // Check for close gesture (two hands with index fingers close)
              if (predictions.length > 1 && gesturePair === "open-close") {
                console.log("2 hadn detected");
                const index1 = predictions[0].landmarks[8];
                const index2 = predictions[1].landmarks[8];
                const distance = Math.sqrt(
                  Math.pow(index1[0] - index2[0], 2) +
                    Math.pow(index1[1] - index2[1], 2)
                );

                if (distance < 0.05) {
                  currentGesture.current = "Close Room";
                }
              }

              console.log("Current Gesture: " + currentGesture.current);
            } else {
              currentGesture.current = null;
            }
          }
        };

        const detectionInterval = setInterval(() => {
          detect();
        }, 200);

        setIsLoading(false);

        return () => {
          clearInterval(detectionInterval);
        };
      } catch (err) {
        console.error("Failed to initialize Handpose model:", err);
        setError("Failed to initialize Handpose model");
        setIsLoading(false);
      }
    };

    initializeGestureDetection();
  }, [cameraRef, gesturePair]);

  return { isLoading, error, hands, currentGesture };
};
