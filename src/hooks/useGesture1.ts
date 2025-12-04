import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import { useEffect, useState, useRef } from "react";

interface UseGestureOptions {
  cameraRef: React.RefObject<HTMLVideoElement>;
}

interface HandPrediction {
  landmarks: [number, number, number][]; // Array of [x, y, z] coordinates for landmarks
}

const useGesture = ({ cameraRef }: UseGestureOptions) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hands, setHands] = useState<HandPrediction[]>([]);
  const currentGesture = useRef<string | null>(null);
  const fistStartTime = useRef<number | null>(null);
  const fistHeldFor075Second = useRef(false);
  const wasHandAbsent = useRef(true);
  const enteredAsFist = useRef(false);

  useEffect(() => {
    let model: handpose.HandPose | null = null;
    let detectionInterval: NodeJS.Timeout | null = null;

    const detectGesture = (landmarks: [number, number, number][]) => {
      const wrist = landmarks[0];
      const thumb = landmarks[4];
      const index = landmarks[8];
      const middle = landmarks[12];
      const ring = landmarks[16];
      const pinky = landmarks[20];
      const middleMCP = landmarks[9];
      const thumbMCP = landmarks[2];

      const palmSize = Math.sqrt(
        Math.pow(middle[0] - wrist[0], 2) +
          Math.pow(middle[1] - wrist[1], 2)
      );

      const fistThreshold = palmSize * 1.5;

      const fingersCurled =
        Math.sqrt(
          Math.pow(index[0] - wrist[0], 2) +
            Math.pow(index[1] - wrist[1], 2)
        ) < fistThreshold &&
        Math.sqrt(
          Math.pow(middle[0] - wrist[0], 2) +
            Math.pow(middle[1] - wrist[1], 2)
        ) < fistThreshold &&
        Math.sqrt(
          Math.pow(ring[0] - wrist[0], 2) +
            Math.pow(ring[1] - wrist[1], 2)
        ) < fistThreshold &&
        Math.sqrt(
          Math.pow(pinky[0] - wrist[0], 2) +
            Math.pow(pinky[1] - wrist[1], 2)
        ) < fistThreshold;

      const fingersExpanded =
        Math.sqrt(
          Math.pow(index[0] - wrist[0], 2) +
            Math.pow(index[1] - wrist[1], 2)
        ) > fistThreshold &&
        Math.sqrt(
          Math.pow(middle[0] - wrist[0], 2) +
            Math.pow(middle[1] - wrist[1], 2)
        ) > fistThreshold &&
        Math.sqrt(
          Math.pow(ring[0] - wrist[0], 2) +
            Math.pow(ring[1] - wrist[1], 2)
        ) > fistThreshold &&
        Math.sqrt(
          Math.pow(pinky[0] - wrist[0], 2) +
            Math.pow(pinky[1] - wrist[1], 2)
        ) > fistThreshold;

      const isThumbUp = fingersCurled && thumb[1] < thumbMCP[1] - palmSize * 0.75;
      const isThumbDown =
        fingersCurled && thumb[1] > thumbMCP[1] + palmSize * 0.75;

      const isFistCurrent = fingersCurled && !isThumbUp && !isThumbDown;

      if (wasHandAbsent.current && isFistCurrent) {
        enteredAsFist.current = true;
      }

      if (enteredAsFist.current && fingersExpanded) {
        currentGesture.current = "Receive File";
        enteredAsFist.current = false;
      } else if (isFistCurrent && !fistHeldFor075Second.current) {
        if (!wasHandAbsent.current && fistStartTime.current === null) {
          fistStartTime.current = performance.now();
        } else if (
          fistStartTime.current !== null &&
          performance.now() - fistStartTime.current >= 750
        ) {
          fistHeldFor075Second.current = true;
          currentGesture.current = "Release to Open Room";
        }
      } else if (!isFistCurrent && fistHeldFor075Second.current) {
        currentGesture.current = "Open Room";
        fistHeldFor075Second.current = false;
        fistStartTime.current = null;
      } else if (isThumbUp) {
        currentGesture.current = "Yes";
      } else if (isThumbDown) {
        currentGesture.current = "No";
      } else {
        currentGesture.current = "Open Hand";
      }

      wasHandAbsent.current = !isFistCurrent && !fingersExpanded;
    };

    const initializeGestureDetection = async () => {
      if (!cameraRef.current) {
        setError("Camera reference is not available.");
        setIsLoading(false);
        return;
      }

      try {
        await tf.ready();
        await tf.setBackend("webgl");

        // Load the Handpose model
        model = await handpose.load();
        console.log("Handpose model loaded");

        const detect = async () => {
          if (cameraRef.current) {
            const predictions = await model!.estimateHands(cameraRef.current);

            if (predictions.length > 0) {
              const { landmarks } = predictions[0];
              detectGesture(landmarks);

              setHands(
                predictions.map((prediction) => ({
                  landmarks: prediction.landmarks,
                }))
              );
							console.log(currentGesture)
            } else {
              currentGesture.current = null; // Reset gesture if no hand is detected
              setHands([]); // Clear hands state
            }
          }
        };

        detectionInterval = setInterval(() => {
          detect();
        }, 200);

        setIsLoading(false);
      } catch (err) {
        console.error("Failed to initialize Handpose model:", err);
        setError("Failed to initialize Handpose model");
        setIsLoading(false);
      }
    };

    initializeGestureDetection();

    return () => {
      if (detectionInterval) {
        clearInterval(detectionInterval);
      }
      if (model) {
        model = null;
      }
    };
  }, [cameraRef]);

  return { isLoading, error, hands, currentGesture };
};

export default useGesture;