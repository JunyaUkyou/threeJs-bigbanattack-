import * as THREE from 'three';
import { Sphere } from './Sphere';
import { SparkEmitter } from './SparkEmitter';

export class Main {
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly texture: THREE.Texture;
  private readonly sphere: Sphere;
  private readonly sparkEmitter: SparkEmitter;
  private video: HTMLVideoElement;

  private renderWidth: number;
  private isRun: boolean = false;

  // スケール拡大用の係数
  private scaleIncrement: number = 0.1;

  constructor(video: HTMLVideoElement) {
    console.log('Main');
    this.video = video; // ビデオ要素を保存

    // テクスチャー
    this.texture = new THREE.TextureLoader().load('/texture/3658520_s.jpg');

    this.scene = new THREE.Scene();

    // カメラを追加
    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 300);

    // レンダラーを追加
    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    // const renderWidth = window.innerWidth;
    // const renderHeight = window.innerHeight;
    this.renderWidth = 600;
    const renderHeight = 400;
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setSize(this.renderWidth, renderHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    document.body.appendChild(this.renderer.domElement);

    // ビデオテクスチャを作成
    const videoTexture = new THREE.VideoTexture(this.video);
    const videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });

    // カメラ映像を平面として表示
    const planeGeometry = new THREE.PlaneGeometry(600, 400);
    const videoPlane = new THREE.Mesh(planeGeometry, videoMaterial);
    videoPlane.position.z = -1; // 球体の背面に配置
    this.scene.add(videoPlane);

    // エネルギー弾の球体を作成しシーンに追加
    const spherePositionX = 0;
    const spherePositionY = 40;
    const spherePositionZ = 20;

    this.sphere = new Sphere(this.texture);
    this.sphere.mesh.position.set(
      spherePositionX,
      spherePositionY,
      spherePositionZ
    );

    // SparkEmitter の追加
    //const spherePositionZ = 20;
    this.sparkEmitter = new SparkEmitter(spherePositionX, spherePositionY);

    // アニメーション開始
    this.animate();
  }

  // VideoElementを取得するメソッド
  getVideoElement(): HTMLVideoElement {
    return this.video;
  }

  run() {
    this.isRun = true;
    this.scene.add(this.sphere.mesh); // 球体をシーンに追加
    this.scene.add(this.sparkEmitter); // スパークをシーンに追加
  }

  private updateSphere() {
    // 球体のスケールを徐々に拡大
    //console.log(this.sphere.mesh.scale.x);
    this.sphere.mesh.scale.x += this.scaleIncrement;
    this.sphere.mesh.scale.y += this.scaleIncrement;
    this.sphere.mesh.scale.z += this.scaleIncrement;

    if (this.sphere.mesh.scale.x > 4) {
      this.scaleIncrement = 0;
      setTimeout(() => {
        this.scene.remove(this.sparkEmitter); //スパーク削除
        this.startMovingSphere(); // 球体の移動を開始
      }, 4000); // 4秒後に移動開始
    }
  }

  private startMovingSphere() {
    const moveInterval = setInterval(() => {
      this.sphere.mesh.position.x -= 2.0;

      if (this.sphere.mesh.position.x < (this.renderWidth / 2) * -1) {
        console.log('移動停止');
        this.scene.remove(this.sphere.mesh);
        clearInterval(moveInterval);
        this.isRun = false; // エフェクト終了
      }
    }, 16); // 約60FPSで更新
  }

  animate = () => {
    if (this.isRun) this.updateSphere();
    this.renderer.render(this.scene, this.camera);
    const id = requestAnimationFrame(this.animate);

    // 描画をやめる
    const cancel = document.getElementById('cancel');
    cancel?.addEventListener('click', () => cancelAnimationFrame(id));
  };
}