export interface GestureData {
  label: string;
  confidence: number;
  keypoints?: Keypoint[];
}

export interface HandPose {
  keypoints: Keypoint[];
  confidence: number;
}

export interface Keypoint {
  x: number;
  y: number;
  z?: number;
  name?: string;
}

export type GestureCallback = (gesture: GestureData) => void;
