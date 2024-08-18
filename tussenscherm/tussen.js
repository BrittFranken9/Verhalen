const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');
const instructions = document.getElementById('instructions');
const gestures = document.getElementById('gestures');

let model;


async function setupCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    return new Promise((resolve) => {
      video.onloadedmetadata = () => {
        resolve(video);
      };
    });
  } catch (error) {
    console.error("Error accessing camera:", error);
  }
}

async function main() {
  status.classList.add('hidden');
  instructions.classList.add('hidden');
  gestures.classList.add('hidden');

  await setupCamera();
  video.play();

  try {
    model = await handpose.load();
    console.log("Handpose model loaded");

    setTimeout(() => {
      detectHands();
    }, 3500);

  } catch (error) {
    console.error("Error loading handpose model:", error);
  }
}

async function detectHands() {
  let gestureDetected = false;

  async function detect() {
    try {
      const predictions = await model.estimateHands(video);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (predictions.length > 0) {
        const landmarks = predictions[0].landmarks;

        for (let i = 0; i < landmarks.length; i++) {
          const [x, y] = landmarks[i];
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, 2 * Math.PI);
          ctx.fillStyle = 'red';
          ctx.fill();
        }

        const thumbUp = isThumbUp(landmarks);

        if (thumbUp && !gestureDetected) {
          gestureDetected = true;

          document.querySelector('h1').classList.add('hidden');
          document.querySelector('p').classList.add('hidden');
          status.classList.add('hidden');
          gestures.classList.add('hidden'); 

          setTimeout(() => {
            window.location.href = '/Verhaalscherm/verhaal.html';
          }, 7000);
        }
      }

      requestAnimationFrame(detect);
    } catch (error) {
      console.error("Error detecting hands:", error);
    }
  }

  detect();
}

function isThumbUp(landmarks) {
  const thumbTip = landmarks[4];
  const thumbMcp = landmarks[2];
  const indexTip = landmarks[8];

  return (thumbTip[1] < thumbMcp[1]) && (thumbTip[1] < indexTip[1]);
}

main();