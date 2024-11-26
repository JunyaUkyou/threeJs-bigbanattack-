import { VideoRenderer } from './VideoRenderer';
import { BigBangAttack } from '../effects/BigBangAttack';
import { MajinBuu } from '../effects/MajinBuu';
import { SuperSaiyajin } from '../effects/SuperSaiyajin';
import { Teleportation } from '../effects/Teleportation';
import { NormalizedLandmark } from '@mediapipe/tasks-vision';

export class Main {
  private videoRenderer: VideoRenderer;
  private bigBangAttack: BigBangAttack;
  private superSaiyajin: SuperSaiyajin;
  private majinBuu: MajinBuu;
  private teleportation: Teleportation;

  constructor(video: HTMLVideoElement) {
    this.videoRenderer = new VideoRenderer(video);

    const scene = this.videoRenderer.getScene();
    this.bigBangAttack = new BigBangAttack(scene);
    this.superSaiyajin = new SuperSaiyajin(scene);
    this.majinBuu = new MajinBuu(scene);
    this.teleportation = new Teleportation(scene);

    this.animate();
  }

  runBigBangAttack(x: number, y: number, z: number) {
    this.bigBangAttack.run(x, y, z);
  }

  runSuperSaiyajin(isTest = false) {
    console.log('runSuperSaiyajin', { isTest });
    this.superSaiyajin.run();
  }

  runMajinBuu(x: number, y: number, z: number) {
    console.log('runMajinBuu');
    this.majinBuu.run(x, y, z);
  }

  runTeleportation() {
    console.log('runTeleportation');
    this.teleportation.run();
  }

  updateSuperSaiyajinLandmarks(landmarks: NormalizedLandmark[]) {
    this.superSaiyajin.setLandmarks(landmarks);
  }

  // run(x: number, y: number, z: number) {
  //   console.log('core/Main.ts run ', { x, y, z });
  // }

  captureFrame() {
    this.videoRenderer.captureFrame();
  }

  animate = () => {
    // this.superSaiyajin.update();
    this.videoRenderer.render();
    if (this.superSaiyajin.getIsRun()) {
      this.superSaiyajin.animate();
    }
    if (this.bigBangAttack.getIsRun()) {
      this.bigBangAttack.animate();
    }
    if (this.majinBuu.getIsRun()) {
      this.majinBuu.animate();
    }
    requestAnimationFrame(this.animate);
  };
}
