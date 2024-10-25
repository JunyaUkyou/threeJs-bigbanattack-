import './style.scss';
import { Main } from './bigbanattack/Main';
import * as knnClassifier from '@tensorflow-models/knn-classifier';
import {
  GestureRecognizer,
  NormalizedLandmark,
  PoseLandmarker,
} from '@mediapipe/tasks-vision';
import { getRecognizer, getLandmarkerResult } from './models/landmarker';

import {
  loadKNNModel,
  predictLandmarks,
  KNNModelPredictResult,
} from './models/classifier';

import {
  MEDIA_CONSTRAINTS,
  RENDERING_SIZE,
  LABELS,
  EFFECT_DISPLAY_MILLISECOND,
  PREDICTION_INTERVAL,
  REQUIRED_DETECTIONS,
} from './config/constants';

const MIDDLE_FINGER_MCP = 20;
const isPose = true;

// グローバル変数管理用オブジェクト
const state = {
  mainInstance: null as Main | null,
  video: null as HTMLVideoElement | null,
  classifier: null as knnClassifier.KNNClassifier | null,
  recognizer: null as GestureRecognizer | PoseLandmarker | null,
  isEffectActive: false,
  isPoseDetection: false,
};

// 現在のステータス
const statusMessageElement = document.getElementById('current-status-message');

// ポーズの検出回数を追跡
const detectionCount: { [key: string]: number } = {
  [LABELS.BIGBANG_ATTACK]: 0,
};

console.log('こんにちは!!!!');

function setupEventListeners() {
  // ポーズ認識開始
  document.getElementById('pose')?.addEventListener('click', () => {
    state.isPoseDetection = !state.isPoseDetection;
    console.log('state.isPoseDetection', state.isPoseDetection);

    statusMessageElement!.textContent = state.isPoseDetection
      ? 'ポーズ検出中'
      : 'ポーズ検出を開始してください';
  });
  // ボタンリクック
  document.getElementById('aaaaaaaaaaaa')?.addEventListener('click', () => {
    state.mainInstance?.run(0, 0, 0);
  });
}

// 初期処理
async function init() {
  try {
    // 推論に使用するモデル取得
    const { classifier, gestureRecognizer } = await initializeModels();
    state.classifier = classifier;
    state.recognizer = gestureRecognizer;

    // カメラ映像を取得
    state.video = await setupVideoStream();
    state.mainInstance = new Main(state.video);

    console.log('初期化完了！ジェスチャー認識を開始します...');
    renderFrame();
    setInterval(predictGesture, PREDICTION_INTERVAL);
  } catch (error) {
    console.error('初期化中にエラーが発生しました:', error);
  }
}

async function initializeModels() {
  const classifier = await loadKNNModel();
  const gestureRecognizer = await getRecognizer(isPose);
  return { classifier, gestureRecognizer };
}

// **カメラ映像の取得**
async function setupVideoStream() {
  const constraints = {
    video: {
      width: { ideal: MEDIA_CONSTRAINTS.width },
      height: { ideal: MEDIA_CONSTRAINTS.height },
    },
  };
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  const videoElement = document.createElement('video');
  videoElement.srcObject = stream;
  await videoElement.play(); // 映像の再生を強制
  return videoElement;
}

function renderFrame() {
  window.requestAnimationFrame(renderFrame);
}

async function predictGesture() {
  // エフェクトがアクティブな場合、ポーズ検出無効の場合、次のフレームへ移行
  if (state.isEffectActive || !state.isPoseDetection) {
    // window.requestAnimationFrame(predictGesture);
    return;
  }

  const { recognizer, mainInstance, classifier } = state;

  // ジェスチャー取得
  const startTimeMs = performance.now();
  const results = await getLandmarkerResult(
    mainInstance!.getVideoElement(),
    recognizer!,
    startTimeMs
  );

  if (
    results.landmarks.length > 0
    //&& results.gestures[0][0].categoryName == 'None'
  ) {
    const predictResult: KNNModelPredictResult = await predictLandmarks(
      classifier!,
      results
    );

    // 同じラベルの検出回数をカウント
    const label = predictResult.label;
    if (detectionCount[label] !== undefined) {
      detectionCount[label] += 1;
    }

    if (label === LABELS.BIGBANG_ATTACK) {
      if (detectionCount[label] === 1) {
        statusMessageElement!.textContent = 'どこからか気を感じる';
      } else {
        statusMessageElement!.textContent = '気が強くなってきた！！';
      }
    }

    // 同じポーズが続けて検出
    // ビッグバンアタックのみエフェクト表示
    if (
      detectionCount[label] >= REQUIRED_DETECTIONS &&
      label === LABELS.BIGBANG_ATTACK
    ) {
      statusMessageElement!.textContent = 'ビッグバンアタックだ！！！';
      showBigBangAttackEffect(results.landmarks); // エフェクト表示
      resetDetectionCounts(); // カウントをリセット
    }
  } else {
    resetDetectionCounts(); // カウントをリセット
    statusMessageElement!.textContent = 'ポーズ検出中';
  }

  // window.requestAnimationFrame(predictGesture);
}

// カウントをリセットする関数
function resetDetectionCounts() {
  for (const key in detectionCount) {
    detectionCount[key] = 0;
  }
}

// エフェクトを表示する関数
function showBigBangAttackEffect(landmarks: NormalizedLandmark[][]) {
  state.isEffectActive = true; // エフェクト開始
  console.log('ビッグバンアタック！！！！', { landmarks });
  const middleFingerMcp = landmarks[0][MIDDLE_FINGER_MCP];
  // Three.jsの座標系に合わせた座標変換
  const landmarkX =
    middleFingerMcp.x * RENDERING_SIZE.width - RENDERING_SIZE.width / 2; // X: -300〜300
  const landmarkY = -(
    middleFingerMcp.y * RENDERING_SIZE.height -
    RENDERING_SIZE.height / 2
  ); // Y: 200〜-200 (上下反転)
  // Z座標は負の値の場合は0にする
  const landmarkZ = Math.max(0, middleFingerMcp.z * 100);
  console.log({ landmarkX, landmarkY, landmarkZ, middleFingerMcp });
  state.mainInstance!.run(landmarkX, landmarkY, landmarkZ);

  // エフェクト終了後にジェスチャー取得を再開
  setTimeout(() => {
    state.isEffectActive = false; // エフェクト終了
  }, EFFECT_DISPLAY_MILLISECOND); // 8秒間エフェクトを表示する想定
}

setupEventListeners();
init();
