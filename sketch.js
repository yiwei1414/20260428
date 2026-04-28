let video;
let handPose;
let hands = [];
let dw, dh, dx, dy;

// 水泡陣列與狀態管理
let bubbles = [];
let isModelLoaded = false;

function preload() {
  // 初始化模型
  handPose = ml5.handPose({ flipped: true }, () => {
    isModelLoaded = true;
  });
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  updateLayout();

  video = createCapture(VIDEO, { flipped: true });
  video.size(640, 480);
  video.hide();

  handPose.detectStart(video, gotHands);
}

function gotHands(results) {
  hands = results;
}

function draw() {
  background('#e7c6ff');

  // --- 1. 文字改成置中、中間上方 ---
  fill(0); 
  noStroke();
  textSize(32);
  textAlign(CENTER, TOP); // 設定水平置中，垂直對齊頂部
  // 放在寬度的一半，垂直距離頂部 20 像素
  text("411136541江奕葳", width / 2, 20);

  if (!isModelLoaded) {
    textAlign(CENTER, CENTER);
    text("模型載入中...", width / 2, height / 2);
    return;
  }

  // 顯示 50% 影像
  image(video, dx, dy, dw, dh);

  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        drawSkeleton(hand); // 繪製骨架與圓圈
        
        // 2. 指尖產生水泡 (4, 8, 12, 16, 20)
        let tips = [4, 8, 12, 16, 20];
        for (let index of tips) {
          let kp = hand.keypoints[index];
          let x = map(kp.x, 0, video.width, dx, dx + dw);
          let y = map(kp.y, 0, video.height, dy, dy + dh);
          
          // 控制產生頻率
          if (random(1) > 0.9) {
            bubbles.push(new Bubble(x, y));
          }
        }
      }
    }
  }

  // 3. 更新並顯示所有水泡
  for (let i = bubbles.length - 1; i >= 0; i--) {
    bubbles[i].update();
    bubbles[i].display();
    if (bubbles[i].isFinished()) {
      bubbles.splice(i, 1);
    }
  }
}

// 骨架連線與關節點（維持原本邏輯）
function drawSkeleton(hand) {
  strokeWeight(2);
  let fingerParts = [[0,1,2,3,4], [5,6,7,8], [9,10,11,12], [13,14,15,16], [17,18,19,20]];
  
  hand.handedness == "Left" ? stroke(255, 0, 255) : stroke(255, 255, 0);

  for (let part of fingerParts) {
    for (let i = 0; i < part.length - 1; i++) {
      let pt1 = hand.keypoints[part[i]];
      let pt2 = hand.keypoints[part[i + 1]];
      line(
        map(pt1.x, 0, video.width, dx, dx + dw),
        map(pt1.y, 0, video.height, dy, dy + dh),
        map(pt2.x, 0, video.width, dx, dx + dw),
        map(pt2.y, 0, video.height, dy, dy + dh)
      );
    }
  }

  noStroke();
  for (let kp of hand.keypoints) {
    fill(hand.handedness == "Left" ? [255, 0, 255] : [255, 255, 0]);
    circle(map(kp.x, 0, video.width, dx, dx + dw), map(kp.y, 0, video.height, dy, dy + dh), 8);
  }
}

// 水泡類別
class Bubble {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.r = random(8, 20);
    this.speed = random(1.5, 4);
    this.alpha = 200;
  }
  update() {
    this.y -= this.speed;
    this.alpha -= 1.5; // 往上飛的過程中逐漸變透明（模擬破掉）
  }
  display() {
    stroke(255, this.alpha);
    fill(255, this.alpha * 0.2);
    circle(this.x, this.y, this.r * 2);
    // 反光效果
    noStroke();
    fill(255, this.alpha * 0.6);
    circle(this.x - this.r * 0.3, this.y - this.r * 0.3, this.r * 0.4);
  }
  isFinished() {
    return this.alpha < 0 || this.y < -50;
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
