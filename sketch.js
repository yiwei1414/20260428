// Hand Pose Detection with ml5.js - 置中 50% 比例版
let video;
let handPose;
let hands = [];

// 用於計算置中的變數
let dw, dh, dx, dy;

function preload() {
  // 初始化模型
  handPose = ml5.handPose({ flipped: true });
}

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 初始化計算影像位置與尺寸
  updateLayout();

  // 設定攝影機擷取
  video = createCapture(VIDEO, { flipped: true });
  video.size(640, 480);
  video.hide();

  // 開始偵測手勢
  handPose.detectStart(video, gotHands);
}

function gotHands(results) {
  hands = results;
}

function draw() {
  // 背景設定為 e7c6ff
  background('#e7c6ff');

  // 繪製影像：寬高為畫布 50%，置中顯示
  image(video, dx, dy, dw, dh);

  // 處理手部偵測點位
  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        for (let i = 0; i < hand.keypoints.length; i++) {
          let keypoint = hand.keypoints[i];

          // 核心轉換：將 640x480 的偵測座標映射到目前畫面上 50% 的顯示區域
          let x = map(keypoint.x, 0, video.width, dx, dx + dw);
          let y = map(keypoint.y, 0, video.height, dy, dy + dh);

          // 區分左右手顏色
          if (hand.handedness == "Left") {
            fill(255, 0, 255);
          } else {
            fill(255, 255, 0);
          }

          noStroke();
          circle(x, y, 12); // 調整點點大小以符合 50% 的比例
        }
      }
    }
  }
}

// 當視窗大小改變時，重新計算畫布與影像位置
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  updateLayout();
}

// 計算佈局的自定義函式
function updateLayout() {
  dw = width * 0.5;   // 影像寬度 = 畫布 50%
  dh = height * 0.5;  // 影像高度 = 畫布 50%
  dx = (width - dw) / 2;  // 起始 X 座標（置中）
  dy = (height - dh) / 2; // 起始 Y 座標（置中）
}