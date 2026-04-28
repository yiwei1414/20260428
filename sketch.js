// Hand Pose Detection - 骨架連線版
let video;
let handPose;
let hands = [];
let dw, dh, dx, dy;

let statusMessage = "正在初始化...";
let isModelLoaded = false;
let webGLSupported = false;

function preload() {
  let canvas = document.createElement('canvas');
  webGLSupported = !!(window.WebGLRenderingContext && 
    (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));

  if (webGLSupported) {
    statusMessage = "正在載入 AI 模型...";
    handPose = ml5.handPose({ flipped: true }, modelReady);
  } else {
    statusMessage = "錯誤：您的手機不支援 WebGL";
  }
}

function modelReady() {
  isModelLoaded = true;
  statusMessage = "模型載入成功";
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  updateLayout();

  video = createCapture(VIDEO, { flipped: true });
  video.size(640, 480);
  video.hide();

  if (webGLSupported) {
    handPose.detectStart(video, gotHands);
  }
}

function gotHands(results) {
  hands = results;
}

function draw() {
  background('#e7c6ff');

  if (!webGLSupported || !isModelLoaded) {
    fill(80);
    textAlign(CENTER, CENTER);
    textSize(20);
    text(statusMessage, width / 2, height / 2);
    return;
  }

  image(video, dx, dy, dw, dh);

  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        drawSkeleton(hand); // 繪製骨架連線
      }
    }
  }
}

// 繪製骨架連線的函式
function drawSkeleton(hand) {
  // 設定線條樣式
  strokeWeight(3);
  if (hand.handedness == "Left") {
    stroke(255, 0, 255); // 左手紫色線
    fill(255, 0, 255);
  } else {
    stroke(255, 255, 0); // 右手黃色線
    fill(255, 255, 0);
  }

  // 定義要連線的群組
  let fingerParts = [
    [0, 1, 2, 3, 4],     // 大拇指
    [5, 6, 7, 8],        // 食指
    [9, 10, 11, 12],     // 中指
    [13, 14, 15, 16],    // 無名指
    [17, 18, 19, 20]     // 小指
  ];

  // 遍歷每一根手指的編號群組
  for (let part of fingerParts) {
    for (let i = 0; i < part.length - 1; i++) {
      let pt1 = hand.keypoints[part[i]];
      let pt2 = hand.keypoints[part[i + 1]];

      // 座標轉換映射
      let x1 = map(pt1.x, 0, video.width, dx, dx + dw);
      let y1 = map(pt1.y, 0, video.height, dy, dy + dh);
      let x2 = map(pt2.x, 0, video.width, dx, dx + dw);
      let y2 = map(pt2.y, 0, video.height, dy, dy + dh);

      line(x1, y1, x2, y2); // 畫線
    }
  }

  // 畫出所有關節點點
  noStroke();
  for (let kp of hand.keypoints) {
    let x = map(kp.x, 0, video.width, dx, dx + dw);
    let y = map(kp.y, 0, video.height, dy, dy + dh);
    circle(x, y, 8);
  }
}

function updateLayout() {
  dw = width * 0.5;
  dh = height * 0.5;
  dx = (width - dw) / 2;
  dy = (height - dh) / 2;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateLayout();
}
