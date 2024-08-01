const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const statusDiv = document.getElementById('status');

async function setupCamera() {
  video.width = 640;
  video.height = 480;

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
  console.log('Handpose model loaded');

  let isStarted = false;

  async function detect() {
    const predictions = await model.estimateHands(video);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (predictions.length > 0) {
      const landmarks = predictions[0].landmarks;
      drawHand(landmarks);

      if (!isStarted) {
        if (isThumbsUp(landmarks)) {
          statusDiv.textContent = 'Gesture recognized: Thumbs Up';
          setTimeout(() => {
            isStarted = true;
            statusDiv.textContent = 'System Started';
          }, 1000);
        } else if (isOpenHand(landmarks)) {
          statusDiv.textContent = 'Gesture recognized: Open Hand (Stop)';
          setTimeout(() => {
            isStarted = false;
            statusDiv.textContent = 'System Stopped';
          }, 1000);
        }
      } else {
        if (isOpenHand(landmarks)) {
          statusDiv.textContent = 'Gesture recognized: Open Hand (Stop)';
          setTimeout(() => {
            isStarted = false;
            statusDiv.textContent = 'System Stopped';
          }, 1000);
        }
      }
    } else {
      statusDiv.textContent = 'Waiting for gesture...';
    }

    requestAnimationFrame(detect);
  }

  detect();
}

function drawHand(landmarks) {
  for (let i = 0; i < landmarks.length; i++) {
    const [x, y] = landmarks[i];
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fill();
  }
}

function isThumbsUp(landmarks) {
  const [thumbTip, thumbIP, thumbMP, thumbCMC] = [4, 3, 2, 1].map(i => landmarks[i]);
  const [indexTip, indexDIP] = [8, 7].map(i => landmarks[i]);

  return (thumbTip[1] < thumbIP[1] && thumbIP[1] < thumbMP[1] && thumbMP[1] < thumbCMC[1]) && // Thumb is up
         (indexTip[1] > indexDIP[1]); // Index finger is down
}

function isOpenHand(landmarks) {
  const fingers = [8, 12, 16, 20].map(i => landmarks[i]);
  const palm = landmarks[0];
  
  return fingers.every(finger => finger[1] < palm[1]); // All fingers up
}

main();