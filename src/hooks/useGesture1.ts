import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import { useEffect, useState, useRef } from "react";

interface UseGestureOptions {
  cameraRef: React.RefObject<HTMLVideoElement>;
  gesturePair: "send-receive" | "yes-no" | "open-close"; // Added gesturePair parameter
}

interface HandPrediction {
  landmarks: [number, number, number][]; // Array of [x, y, z] coordinates for landmarks
}

const useGesture = ({ cameraRef, gesturePair }: UseGestureOptions) => {
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
			const indexLeft = landmarks[12];
      const ring = landmarks[16];
      const pinky = landmarks[20];
      const thumbMCP = landmarks[2];

      const palmSize = Math.sqrt(
        Math.pow(middle[0] - wrist[0], 2) + Math.pow(middle[1] - wrist[1], 2)
      );

      if (palmSize < 0.05) {
        currentGesture.current = null;
        return;
      }

      const fingerDistances = [index, middle, ring, pinky].map((finger) =>
        Math.sqrt(
          Math.pow(finger[0] - wrist[0], 2) +
            Math.pow(finger[1] - wrist[1], 2)
        )
      );
			console.log(fingerDistances);
			console.log("palmSize: " + palmSize);

      const fingersCurledConfidence =
        fingerDistances.filter((dist) => dist > palmSize * 5).length / 4;
      const fingersExpandedConfidence =
        fingerDistances.filter((dist) => dist < palmSize * 5).length / 4;

      const fingersCurled = fingersCurledConfidence > 0.7;
      const fingersExpanded = fingersExpandedConfidence > 0.7;

      console.log("Fingers Curled Confidence:", fingersCurledConfidence);
      console.log("Fingers Expanded Confidence:", fingersExpandedConfidence);

      if (!fingersCurled && !fingersExpanded) {
        currentGesture.current = null;
        wasHandAbsent.current = true;
        return;
      }

      const isThumbUp = fingersCurled && thumb[1] < thumbMCP[1];
      const isThumbDown =
        fingersCurled && thumb[1] > thumbMCP[1];

      // Clear previous states if hand detection is unstable
      if (!wasHandAbsent.current && !fingersExpanded) {
        // Hand is in an ambiguous state
        currentGesture.current = null;
        return;
      }

      const isCloseGesture = Math.sqrt(Math.pow(index[0] - indexLeft[0], 2) + Math.pow(index[1] - indexLeft[1], 2)) < 0.05;

      // Gesture recognition with state tracking
      if (gesturePair === "send-receive") {
        if (fingersExpanded) {
          currentGesture.current = "Receive File";
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
      } else if (gesturePair === "open-close") {
        console.log("fingerExpanded: " + fingersExpanded);
        if (fingersExpanded) {
          currentGesture.current = "Open Room";
        } else if (isCloseGesture) {
          currentGesture.current = "Close Room";
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

            if (predictions.length > 0) {
              const { landmarks } = predictions[0];
              detectGesture(landmarks);

              setHands(
                predictions.map((prediction) => ({
                  landmarks: prediction.landmarks,
                }))
              );
            } else {
              currentGesture.current = null;
              setHands([]);
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

export default useGesture;