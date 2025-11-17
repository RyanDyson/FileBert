import type { GestureData, GestureCallback } from './types';

export class GestureDetector {
  private video: HTMLVideoElement | null = null;
  private handpose: any = null;
  private isRunning = false;
  private callback?: GestureCallback;
  private ownVideo = false;
  private previousHandX: number | null = null;
  private movementHistory: number[] = [];
  private previousHandState: 'open' | 'closed' | null = null;
  private gestureSequence: string[] = [];
  private lastGestureTime = 0;

  constructor(callback?: GestureCallback, videoElement?: HTMLVideoElement) {
    this.callback = callback;
    if (videoElement) {
      this.video = videoElement;
      this.ownVideo = false;
    }
  }

  async initialize(): Promise<void> {
    try {
      // Create video element for webcam only if not provided
      if (!this.video) {
        this.video = document.createElement('video');
        this.video.style.display = 'none';
        document.body.appendChild(this.video);
        this.ownVideo = true;

        // Get webcam stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
        });
        this.video.srcObject = stream;
        this.video.play();
      }

      // Wait for ml5 to be available
      await this.waitForML5();

      // Initialize handpose model using ml5.js v1.x API
      // @ts-ignore - ml5 will be loaded via script tag
      this.handpose = await ml5.handPose(this.video, { flipped: true });
      
      console.log('✅ Gesture detector initialized');
    } catch (error) {
      console.error('❌ Failed to initialize gesture detector:', error);
      throw error;
    }
  }

  private async waitForML5(): Promise<void> {
    return new Promise((resolve, reject) => {
      const checkML5 = setInterval(() => {
        // @ts-ignore
        if (typeof ml5 !== 'undefined') {
          clearInterval(checkML5);
          resolve();
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkML5);
        reject(new Error('ML5.js failed to load'));
      }, 10000);
    });
  }

  async start(): Promise<void> {
    if (!this.handpose) {
      throw new Error('Detector not initialized. Call initialize() first.');
    }

    this.isRunning = true;
    this.detect();
    console.log('🎯 Gesture detection started');
  }

  private async detect(): Promise<void> {
    if (!this.isRunning || !this.handpose || !this.video) return;

    try {
      const predictions = await this.handpose.detect(this.video);
      
      if (predictions && predictions.length > 0) {
        console.log('Hand detected:', predictions[0]); // Debug
        const gesture = this.analyzeGesture(predictions[0]);
        
        if (gesture && this.callback) {
          this.callback(gesture);
        }
      }
    } catch (error) {
      console.error('Detection error:', error);
    }

    // Throttle detection to ~10 fps to reduce CPU/GPU load
    setTimeout(() => {
      if (this.isRunning) {
        this.detect();
      }
    }, 100);
  }

  private analyzeGesture(hand: any): GestureData | null {
    // Basic gesture analysis - you can expand this
    const keypoints = hand.keypoints;
    
    if (!keypoints || keypoints.length === 0) return null;

    // Calculate hand center (wrist position)
    const wrist = keypoints[0];
    const middleMCP = keypoints[9]; // Middle finger base
    
    // Check if hand is facing sideways
    const isSideways = this.isSidewaysHand(keypoints);
    
    // Track horizontal movement
    const currentX = wrist.x;
    let movement = 'Stationary';
    
    if (this.previousHandX !== null) {
      const deltaX = currentX - this.previousHandX;
      this.movementHistory.push(deltaX);
      
      // Keep last 5 movements for smoothing
      if (this.movementHistory.length > 5) {
        this.movementHistory.shift();
      }
      
      // Average movement to smooth out jitter
      const avgMovement = this.movementHistory.reduce((a, b) => a + b, 0) / this.movementHistory.length;
      
      if (Math.abs(avgMovement) > 3) { // Threshold for movement detection
        movement = avgMovement > 0 ? 'Moving Right' : 'Moving Left';
      }
    }
    
    this.previousHandX = currentX;

    // Get key landmarks
    const thumb = keypoints[4];
    const index = keypoints[8];
    const middle = keypoints[12];
    const ring = keypoints[16];
    const pinky = keypoints[20];
    const wristPos = keypoints[0];
    
    // Calculate average distance from fingertips to wrist
    const distances = [
      this.calculateDistance(thumb, wristPos),
      this.calculateDistance(index, wristPos),
      this.calculateDistance(middle, wristPos),
      this.calculateDistance(ring, wristPos),
      this.calculateDistance(pinky, wristPos)
    ];
    const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
    
    // Determine current state (open/closed/fist)
    let currentState: 'open' | 'closed' | null = null;
    const isFist = avgDistance < 110; // Tight fist
    const isOpen = avgDistance > 140; // Open hand
    
    if (isOpen) {
      currentState = 'open';
    } else if (isFist) {
      currentState = 'closed';
    }
    
    // Detect gesture sequences - PRIORITY: Check this first!
    const now = Date.now();
    let sequenceDetected = false;
    
    if (currentState && currentState !== this.previousHandState) {
      this.gestureSequence.push(currentState);
      
      // Keep only last 2 states
      if (this.gestureSequence.length > 2) {
        this.gestureSequence.shift();
      }
      
      // Check sequences within 2 seconds
      if (this.gestureSequence.length === 2 && now - this.lastGestureTime > 800) {
        // Open -> Closed = "Send file"
        if (this.gestureSequence[0] === 'open' && this.gestureSequence[1] === 'closed') {
          this.lastGestureTime = now;
          this.gestureSequence = []; // Clear sequence after detection
          return { label: 'Send file', confidence: 0.95, keypoints };
        }
        // Closed -> Open = "Receive file"
        if (this.gestureSequence[0] === 'closed' && this.gestureSequence[1] === 'open') {
          this.lastGestureTime = now;
          this.gestureSequence = []; // Clear sequence after detection
          return { label: 'Receive file', confidence: 0.95, keypoints };
        }
      }
      
      this.previousHandState = currentState;
    }
    
    // Show recently detected sequence gestures for 1 second
    if (now - this.lastGestureTime < 1000) {
      // Continue showing the sequence gesture briefly
      sequenceDetected = true;
    }

    // Standard gesture detection - only if NOT in sequence mode or sideways
    let label = 'Neutral';
    let confidence = 0.5;

    // Only detect Yes/No if hand is clearly sideways AND moving significantly
    if (isSideways && movement !== 'Stationary' && !isFist && !isOpen) {
      // Yes = sideways moving right, No = sideways moving left
      if (movement === 'Moving Right') {
        label = 'Yes';
        confidence = 0.9;
      } else if (movement === 'Moving Left') {
        label = 'No';
        confidence = 0.9;
      }
    } else if (isFist && !isSideways) {
      label = 'Close room';
      confidence = 0.85;
    } else if (isOpen && !isSideways) {
      label = 'Open room';
      confidence = 0.85;
    }

    return { label, confidence, keypoints };
  }

  private isSidewaysHand(keypoints: any[]): boolean {
    // Multiple checks for more reliable sideways detection
    const wrist = keypoints[0];
    const thumbCMC = keypoints[1];
    const indexMCP = keypoints[5];
    const middleMCP = keypoints[9];
    const ringMCP = keypoints[13];
    const pinkyMCP = keypoints[17];
    
    // Check 1: Thumb to pinky orientation
    const thumbToPinkyX = Math.abs(thumbCMC.x - pinkyMCP.x);
    const thumbToPinkyY = Math.abs(thumbCMC.y - pinkyMCP.y);
    const ratio1 = thumbToPinkyX / (thumbToPinkyY + 1);
    
    // Check 2: All finger bases should be relatively aligned horizontally
    const fingerBases = [indexMCP, middleMCP, ringMCP, pinkyMCP];
    const avgY = fingerBases.reduce((sum, p) => sum + p.y, 0) / fingerBases.length;
    const yVariance = fingerBases.reduce((sum, p) => sum + Math.abs(p.y - avgY), 0) / fingerBases.length;
    const horizontalAlignment = yVariance < 30; // Fingers should be roughly at same Y
    
    // Check 3: Wrist to middle finger should be more horizontal than vertical
    const wristToMiddleX = Math.abs(middleMCP.x - wrist.x);
    const wristToMiddleY = Math.abs(middleMCP.y - wrist.y);
    const ratio2 = wristToMiddleX / (wristToMiddleY + 1);
    
    // Check 4: Z-depth variation (for 3D hands, fingers should have similar depth)
    const hasDepth = keypoints[0].z !== undefined;
    let depthCheck = true;
    if (hasDepth) {
      const avgZ = fingerBases.reduce((sum, p) => sum + (p.z || 0), 0) / fingerBases.length;
      const zVariance = fingerBases.reduce((sum, p) => sum + Math.abs((p.z || 0) - avgZ), 0) / fingerBases.length;
      depthCheck = zVariance < 0.05; // Low depth variance means hand is sideways
    }
    
    // Combine checks - at least 2 should pass
    const checks = [
      ratio1 > 1.2,  // Thumb-pinky more horizontal
      horizontalAlignment, // Finger bases aligned
      ratio2 > 0.8,  // Wrist-middle more horizontal
      depthCheck     // Consistent depth
    ];
    
    const passedChecks = checks.filter(c => c).length;
    return passedChecks >= 2;
  }

  private calculateDistance(point1: any, point2: any): number {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  stop(): void {
    this.isRunning = false;
    console.log('⏸️ Gesture detection stopped');
  }

  async dispose(): Promise<void> {
    this.stop();

    if (this.video && this.ownVideo) {
      const stream = this.video.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      this.video.remove();
      this.video = null;
    }

    this.handpose = null;
    console.log('🗑️ Gesture detector disposed');
  }
}
