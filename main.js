const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');

// Load the handpose model
async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true
  });
  video.srcObject = stream;

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

async function main() {
  await setupCamera();
  video.play();

  const model = await handpose.load();
  status.innerText = 'Model loaded. Waiting for gesture...';

  detectHands(model);
}

async function detectHands(model) {
  const predictions = await model.estimateHands(video);

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  if (predictions.length > 0) {
    const landmarks = predictions[0].landmarks;

    // Draw points on each predicted hand
    for (let i = 0; i < landmarks.length; i++) {
      const [x, y] = landmarks[i];
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'red';
      ctx.fill();
    }

    const thumbUp = isThumbUp(landmarks);

    if (thumbUp) {
      status.innerText = 'Duim Omhoog gedetecteerd!';
      window.location.href = '/Verhaalscherm/verhaal.html';
    }
  }

  requestAnimationFrame(() => detectHands(model));
}

function isThumbUp(landmarks) {
  // Simple thumb up detection logic based on landmark positions
  const thumbTip = landmarks[4];
  const thumbMcp = landmarks[2];
  const indexTip = landmarks[8];

  return (thumbTip[1] < thumbMcp[1]) && (thumbTip[1] < indexTip[1]);
}

main();