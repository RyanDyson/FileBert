import { useState, useEffect, useRef, useCallback } from "react";

export type GestureType =
  | "none"
  | "receive_file"
  | "send_file"
  | "open_room"
  | "close_room"
  | "yes"
  | "no";

interface UseGestureOptions {
  enabled?: boolean;
  onGesture?: (gesture: GestureType) => void;
}

interface UseGestureReturn {
  gesture: GestureType;
  isLoading: boolean;
  error: string | null;
  start: () => void;
  stop: () => void;
}

interface Keypoint {
  x: number;
  y: number;
  z?: number;
  name?: string;
}

interface Hand {
  keypoints: Keypoint[];
  confidence?: number;
}

export function useGesture(options: UseGestureOptions = {}): UseGestureReturn {
  const { enabled = true, onGesture } = options;

  const [gesture, setGesture] = useState<GestureType>("none");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs to persist state across renders without causing re-renders
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const handPoseRef = useRef<any>(null);
  const isRunningRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);

  // Gesture detection state refs (from detector.js logic)
  const isFistRef = useRef(false);
  const fistStartTimeRef = useRef(0);
  const fistHeldFor075SecondRef = useRef(false);
  const wasHandAbsentRef = useRef(true);
  const enteredAsFistRef = useRef(false);
  const handsRef = useRef<Hand[]>([]);
  const lastHandsUpdateRef = useRef<number>(0);

  // Helper: calculate distance between two keypoints
  const dist = useCallback((x1: number, y1: number, x2: number, y2: number) => {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }, []);

  // Main gesture analysis logic (ported from detector.js)
  const analyzeGesture = useCallback((): GestureType => {
    const hands = handsRef.current;
    const now = performance.now();

    if (hands.length > 0) {
      const hand = hands[0];

      const wrist = hand.keypoints[0];
      const thumb = hand.keypoints[4];
      const index = hand.keypoints[8];
      const middle = hand.keypoints[12];
      const ring = hand.keypoints[16];
      const pinky = hand.keypoints[20];
      const middle_mcp = hand.keypoints[9];
      const thumb_mcp = hand.keypoints[2];

      // Calculate palm size (distance from wrist to middle finger knuckle)
      const palmSize = dist(wrist.x, wrist.y, middle_mcp.x, middle_mcp.y);
      const fistThreshold = palmSize * 1.5;

      // Check if fingers are curled
      const fingersCurled =
        dist(wrist.x, wrist.y, index.x, index.y) < fistThreshold &&
        dist(wrist.x, wrist.y, middle.x, middle.y) < fistThreshold &&
        dist(wrist.x, wrist.y, ring.x, ring.y) < fistThreshold &&
        dist(wrist.x, wrist.y, pinky.x, pinky.y) < fistThreshold;

      // Check if fingers are expanded
      const fingersExpanded =
        dist(wrist.x, wrist.y, index.x, index.y) > fistThreshold &&
        dist(wrist.x, wrist.y, middle.x, middle.y) > fistThreshold &&
        dist(wrist.x, wrist.y, ring.x, ring.y) > fistThreshold &&
        dist(wrist.x, wrist.y, pinky.x, pinky.y) > fistThreshold;

      // Check thumbs up or down
      let isThumbUp = false;
      let isThumbDown = false;

      if (fingersCurled) {
        if (thumb.y < thumb_mcp.y - palmSize * 0.75) {
          isThumbUp = true;
        } else if (thumb.y > thumb_mcp.y + palmSize * 0.75) {
          isThumbDown = true;
        }
      }

      // Fist detection
      let isFistCurrent = false;
      if (fingersCurled && !isThumbUp && !isThumbDown) {
        isFistCurrent = true;
      }

      // Check if hand just entered the frame as a fist
      if (wasHandAbsentRef.current && isFistCurrent) {
        enteredAsFistRef.current = true;
      }

      // Receive file detection: hand entered as fist and now fingers are expanded
      if (enteredAsFistRef.current && fingersExpanded) {
        enteredAsFistRef.current = false;
        return "receive_file";
      }

      // Two hand detection: both index fingers close together -> close room
      if (hands.length > 1) {
        const left_hand = hands[1];
        const right_index = index;
        const left_index = left_hand.keypoints[8];

        if (dist(left_index.x, left_index.y, right_index.x, right_index.y) < 50) {
          return "close_room";
        }
      }

      // Track fist timing
      if (isFistCurrent && !isFistRef.current) {
        // Fist just started (not from entering the frame)
        if (!wasHandAbsentRef.current) {
          fistStartTimeRef.current = now;
          fistHeldFor075SecondRef.current = false;
        }
      } else if (isFistCurrent && isFistRef.current) {
        // Holding fist
        const fistDuration = now - fistStartTimeRef.current;
        if (fistDuration >= 750 && !fistHeldFor075SecondRef.current) {
          fistHeldFor075SecondRef.current = true;
          // Signal: "release to open room" - we return open_room when released
        }
      } else if (
        !isFistCurrent &&
        isFistRef.current &&
        !fistHeldFor075SecondRef.current &&
        !enteredAsFistRef.current
      ) {
        // Fist released before 0.75 seconds -> open room
        isFistRef.current = isFistCurrent;
        wasHandAbsentRef.current = false;
        return "open_room";
      }

      isFistRef.current = isFistCurrent;
      wasHandAbsentRef.current = false;

      // Thumbs up/down detection
      if (isThumbUp) {
        fistHeldFor075SecondRef.current = false;
        enteredAsFistRef.current = false;
        return "yes";
      } else if (isThumbDown) {
        fistHeldFor075SecondRef.current = false;
        enteredAsFistRef.current = false;
        return "no";
      }
    } else {
      // No hand detected
      if (isFistRef.current && fistHeldFor075SecondRef.current) {
        // Fist held >= 0.75s then hand disappeared -> send file
        fistHeldFor075SecondRef.current = false;
        isFistRef.current = false;
        fistStartTimeRef.current = 0;
        wasHandAbsentRef.current = true;
        enteredAsFistRef.current = false;
        return "send_file";
      }

      // Reset states
      isFistRef.current = false;
      fistStartTimeRef.current = 0;
      wasHandAbsentRef.current = true;
      enteredAsFistRef.current = false;
    }

    return "none";
  }, [dist]);

  // Detection callback from ml5 handPose
  const gotHands = useCallback((results: Hand[]) => {
    handsRef.current = results;
    lastHandsUpdateRef.current = performance.now();
    
    // Analyze gesture immediately when new hand data arrives
    if (isRunningRef.current) {
      const detectedGesture = analyzeGesture();
      
      if (detectedGesture !== "none") {
        setGesture(detectedGesture);
        onGesture?.(detectedGesture);
        
        // Reset gesture after a short delay
        setTimeout(() => {
          setGesture("none");
        }, 500);
      }
    }
  }, [analyzeGesture, onGesture]);

  // Detection loop (removed - now handled directly in gotHands callback)

  // Initialize video and ml5 handPose
  const initialize = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Create hidden video element
      const video = document.createElement("video");
      video.setAttribute("autoplay", "");
      video.setAttribute("playsinline", "");
      video.style.display = "none";
      document.body.appendChild(video);
      videoRef.current = video;

      // Get webcam stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      video.srcObject = stream;
      await video.play();

      // Wait for ml5 to be available (loaded via script tag)
      const ml5 = await waitForML5();

      // Initialize handPose model
      handPoseRef.current = ml5.handPose({ flipped: true });

      // Start detection
      handPoseRef.current.detectStart(video, gotHands);

      setIsLoading(false);
      console.log("✅ useGesture initialized");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to initialize gesture detection";
      setError(message);
      setIsLoading(false);
      console.error("❌ useGesture initialization error:", err);
    }
  }, [gotHands]);

  // Start detection loop
  const start = useCallback(() => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;
    console.log("🎯 Gesture detection started");
  }, []);

  // Stop detection loop
  const stop = useCallback(() => {
    isRunningRef.current = false;
    console.log("⏸️ Gesture detection stopped");
  }, []);

  // Cleanup
  const cleanup = useCallback(() => {
    stop();

    if (handPoseRef.current?.detectStop) {
      handPoseRef.current.detectStop();
    }

    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream | null;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      videoRef.current.remove();
      videoRef.current = null;
    }

    handPoseRef.current = null;
    console.log("🗑️ useGesture cleaned up");
  }, [stop]);

  // Effect: initialize on mount if enabled
  useEffect(() => {
    if (!enabled) return;

    initialize().then(() => {
      start();
    });

    return () => {
      cleanup();
    };
  }, [enabled, initialize, start, cleanup]);

  return {
    gesture,
    isLoading,
    error,
    start,
    stop,
  };
}

// Helper: wait for ml5 to be available on window
function waitForML5(): Promise<any> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if ((window as any).ml5) {
      resolve((window as any).ml5);
      return;
    }

    const checkInterval = setInterval(() => {
      if ((window as any).ml5) {
        clearInterval(checkInterval);
        resolve((window as any).ml5);
      }
    }, 100);

    // Timeout after 10 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
      reject(new Error("ml5.js failed to load. Make sure it is included in your HTML."));
    }, 10000);
  });
}

export default useGesture;
