import React, { useEffect, useRef, useState } from 'react';
import { GestureDetector } from '../lib/gesture/detector';
import type { GestureData } from '../lib/gesture/types';

interface GestureHistoryItem {
  gesture: GestureData;
  timestamp: Date;
}

export function GestureCanvas() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectorRef = useRef<GestureDetector | null>(null);
  const [currentGesture, setCurrentGesture] = useState<GestureData | null>(null);
  const [gestureHistory, setGestureHistory] = useState<GestureHistoryItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastGestureRef = useRef<string | null>(null);

  useEffect(() => {
    let detector: GestureDetector;

    const init = async () => {
      try {
        // Get webcam stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // Wait a bit for video to be ready
        await new Promise(resolve => setTimeout(resolve, 500));

        // Initialize detector with callback and pass the video element
        detector = new GestureDetector((gesture) => {
          setCurrentGesture(gesture);
          
          // Add to history only if gesture changed
          if (lastGestureRef.current !== gesture.label) {
            lastGestureRef.current = gesture.label;
            setGestureHistory(prev => [
              { gesture, timestamp: new Date() },
              ...prev.slice(0, 9) // Keep last 10 gestures
            ]);
          }
        }, videoRef.current!);

        await detector.initialize();
        await detector.start();
        
        detectorRef.current = detector;
        setIsInitialized(true);

        // Start drawing loop
        drawLoop();
      } catch (error) {
        console.error('Failed to initialize:', error);
      }
    };

    const drawLoop = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (!video || !canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear and draw video frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Draw hand landmarks
      const gesture = currentGesture;
      if (gesture && gesture.keypoints && gesture.keypoints.length > 0) {
        console.log('Drawing', gesture.keypoints.length, 'keypoints'); // Debug
        
        // Draw keypoints
        gesture.keypoints.forEach((point: any, index: number) => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(0, 255, 0, 0.9)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          // Draw point number
          ctx.fillStyle = 'rgba(255, 255, 255, 1)';
          ctx.font = 'bold 12px Arial';
          ctx.fillText(index.toString(), point.x + 10, point.y + 5);
        });

        // Draw connections between keypoints (hand skeleton)
        const connections = [
          // Thumb
          [0, 1], [1, 2], [2, 3], [3, 4],
          // Index finger
          [0, 5], [5, 6], [6, 7], [7, 8],
          // Middle finger
          [0, 9], [9, 10], [10, 11], [11, 12],
          // Ring finger
          [0, 13], [13, 14], [14, 15], [15, 16],
          // Pinky
          [0, 17], [17, 18], [18, 19], [19, 20],
          // Palm
          [5, 9], [9, 13], [13, 17]
        ];

        ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
        ctx.lineWidth = 2;
        connections.forEach(([start, end]) => {
          if (gesture.keypoints![start] && gesture.keypoints![end]) {
            ctx.beginPath();
            ctx.moveTo(gesture.keypoints![start].x, gesture.keypoints![start].y);
            ctx.lineTo(gesture.keypoints![end].x, gesture.keypoints![end].y);
            ctx.stroke();
          }
        });
      }

      // Draw gesture label overlay
      if (gesture) {
        ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
        ctx.font = 'bold 24px Arial';
        ctx.fillText(
          `${gesture.label} (${(gesture.confidence * 100).toFixed(0)}%)`,
          10,
          30
        );
      }

      animationFrameRef.current = requestAnimationFrame(drawLoop);
    };

    init();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (detectorRef.current) {
        detectorRef.current.dispose();
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <h2 className="text-2xl font-bold text-white">Gesture Detection</h2>
      
      <div className="relative">
        <video
          ref={videoRef}
          width={640}
          height={480}
          className="hidden"
          autoPlay
          playsInline
          muted
        />
        
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="border-2 border-gray-600 rounded-lg"
        />
      </div>

      <div className="text-white text-center">
        {!isInitialized && <p>Initializing camera and model...</p>}
        {isInitialized && !currentGesture && <p>Show your hand to detect gestures</p>}
        {currentGesture && (
          <div className="text-xl">
            <span className="text-green-400 font-bold">{currentGesture.label}</span>
            <span className="text-gray-400 ml-2">
              ({(currentGesture.confidence * 100).toFixed(1)}% confidence)
            </span>
          </div>
        )}
      </div>

      {gestureHistory.length > 0 && (
        <div className="w-full max-w-2xl">
          <h3 className="text-white text-lg font-semibold mb-2">Gesture History</h3>
          <div className="bg-gray-800 rounded-lg p-4 max-h-64 overflow-y-auto">
            {gestureHistory.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-2 px-3 mb-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
              >
                <span className="text-white font-medium">{item.gesture.label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-green-400 text-sm">
                    {(item.gesture.confidence * 100).toFixed(1)}%
                  </span>
                  <span className="text-gray-400 text-sm">
                    {item.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
