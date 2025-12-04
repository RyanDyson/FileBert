import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    let model: handpose.HandPose | null = null;
    let detectionInterval: NodeJS.Timeout | null = null;

    const initializeGestureDetection = async () => {
      if (!cameraRef.current) {
        setError("Camera reference is not available.");
        setIsLoading(false);
        return;
      }

      try {
        await tf.ready();
        await tf.setBackend("webgl"); // req webql

        // Load the Handpose model
        model = await handpose.load();
        console.log("Handpose model loaded");

        const detect = async () => {
          if (cameraRef.current) {
            const predictions = await model!.estimateHands(cameraRef.current);
            console.log("Predictions:", predictions);

            predictions.forEach((prediction) => {
              const { landmarks } = prediction;

              const wrist = landmarks[0];
              const thumb = landmarks[4];
              const index = landmarks[8];
              const middle = landmarks[12];
              const ring = landmarks[16];
              const pinky = landmarks[20];
							

              setHands(
                predictions.map((prediction) => ({
                  landmarks: prediction.landmarks,
                }))
              );
            });
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

  return { isLoading, error, hands };
};

export default useGesture;