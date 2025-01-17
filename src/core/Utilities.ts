import { RENDERING_SIZE } from "./constants";
import { NormalizedLandmark } from "@mediapipe/tasks-vision";

export function convertThreejsPosition(
  landmark: NormalizedLandmark
): NormalizedLandmark {
  const { x, y, z, visibility } = landmark;
  const convertedX = x * RENDERING_SIZE.width - RENDERING_SIZE.width / 2; // X: -300〜300
  const convertedY = -(y * RENDERING_SIZE.height - RENDERING_SIZE.height / 2); // Y: 200〜-200 (上下反転)
  // const convertedZ = Math.max(0, z * 100);
  const convertedZ = z;

  return {
    x: convertedX,
    y: convertedY,
    z: convertedZ,
    visibility,
  };
}

export async function playSoundEffect(audioUrl: string) {
  const audio = new Audio(audioUrl);
  audio.play();
}

export function getDelta(lastTime: number) {
  const now = performance.now();
  return (now - lastTime) / 1000;
}
