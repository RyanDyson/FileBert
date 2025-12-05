import { useState, useEffect, useRef } from "react";
import { HandPrediction } from "./useHandPoseModel";

export interface UseGestureOptions {
  gesturePair: "send-receive" | "yes-no" | "open-close";
  enabled?: boolean;
}

export const useGesture = ({
  gesturePair,
  enabled = true,
}: UseGestureOptions) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hands, setHands] = useState<HandPrediction[]>([]);
  const currentGesture = useRef<string | null>(null);

  useEffect(() => {
    console.log(`useGesture: pair=${gesturePair}, enabled=${enabled}`);
    if (!enabled) {
      setHands([]);
      currentGesture.current = null;
      return;
    }

    if (window.electronAPI?.setGestureConfig) {
      window.electronAPI.setGestureConfig({ gesturePair });
      setIsLoading(false);

      // Listen for updates
      const cleanup = window.electronAPI.onGestureData(
        (data: { hands: HandPrediction[]; currentGesture: string | null }) => {
          if (data.hands) setHands(data.hands);
          if (data.currentGesture !== undefined) {
            currentGesture.current = data.currentGesture;
          }
        }
      );

      return () => {
        cleanup();
      };
    } else {
      setError("Electron API not available");
      setIsLoading(false);
    }
  }, [gesturePair]);

  return { isLoading, error, hands, currentGesture };
};
