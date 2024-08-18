const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');
const textOutput = document.getElementById('recognized-text');
const gestureGuide = document.getElementById('gesture-guide');
const gestureImages = gestureGuide.getElementsByClassName('gesture-img');

let model;
let isDetecting = false;
const historyKey = 'gestureHistory'; // Sleutel voor localStorage

// Laad de geschiedenis uit localStorage
function loadHistory() {
    const storedHistory = localStorage.getItem(historyKey);
    return storedHistory ? JSON.parse(storedHistory) : [];
}

const historyOutput = document.getElementById('history-output');

// Bewaar de geschiedenis in localStorage
function saveHistory(history) {
    localStorage.setItem(historyKey, JSON.stringify(history));
}

// Update de geschiedenisweergave
function updateHistory(letter) {
    let gestureHistory = loadHistory();
    gestureHistory.unshift(letter); // Voeg de nieuwe letter toe aan het begin van de geschiedenis
    if (gestureHistory.length > 10) {
        gestureHistory.pop(); // Beperk de geschiedenis tot de laatste 10 items
    }
    saveHistory(gestureHistory); // Bewaar de bijgewerkte geschiedenis
    historyOutput.textContent = gestureHistory.join(' '); // Update de weergave van de geschiedenis
}

// Verberg alle gebarenafbeeldingen
function hideAllGestures() {
    for (const img of gestureImages) {
        img.style.display = 'none';
    }
}

// Toon de afbeelding voor de gedetecteerde letter
function showGestureImage(letter) {
    hideAllGestures();
    const img = document.getElementById(`gesture-${letter}`);
    if (img) {
        img.style.display = 'block';
    }
}

// Verberg de gebaren gids als er geen gebaar wordt herkend
function toggleGestureGuide(show) {
    gestureGuide.classList.toggle('hidden', !show);
}

async function setupCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        video.srcObject = stream;
        return new Promise((resolve) => {
            video.onloadedmetadata = () => {
                video.play();
                video.style.display = 'none'; // Verberg het video element
                resolve(video);
            };
        });
    } catch (error) {
        console.error("Error accessing camera:", error);
    }
}

async function main() {
    status.textContent = 'Loading model...'; // Statusbericht voor model laden
    await setupCamera();
    try {
        model = await handpose.load();
        console.log("Handpose model loaded");
        canvas.style.display = 'block'; // Zorg ervoor dat de canvas zichtbaar is
        status.textContent = 'Model loaded. Please make a gesture.';
        detectHands();
    } catch (error) {
        console.error("Error loading handpose model:", error);
        status.textContent = 'Error loading model.';
    }
}

let lastDetectionTime = 0;
const detectionDelay = 3000; // 3 seconden vertraging in milliseconden

async function detect() {
    if (isDetecting) return;
    isDetecting = true;

    try {
        const now = Date.now();
        if (now - lastDetectionTime < detectionDelay) {
            isDetecting = false;
            requestAnimationFrame(detect);
            return;
        }

        const predictions = await model.estimateHands(video);
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Canvas leegmaken

        if (predictions.length > 0) {
            const landmarks = predictions[0].landmarks;
            let detectedLetter = null;
            if (isAGesture(landmarks)) detectedLetter = 'A';
            else if (isBGesture(landmarks)) detectedLetter = 'B';
            else if (isCGesture(landmarks)) detectedLetter = 'C';
            else if (isDGesture(landmarks)) detectedLetter = 'D';
            else if (isEGesture(landmarks)) detectedLetter = 'E';
            else if (isFGesture(landmarks)) detectedLetter = 'F';
            else if (isGGesture(landmarks)) detectedLetter = 'G';
            else if (isHGesture(landmarks)) detectedLetter = 'H';
            else if (isIGesture(landmarks)) detectedLetter = 'I';
            else if (isJGesture(landmarks)) detectedLetter = 'J';
            else if (isKGesture(landmarks)) detectedLetter = 'K';
            else if (isLGesture(landmarks)) detectedLetter = 'L';
            else if (isMGesture(landmarks)) detectedLetter = 'M';
            else if (isNGesture(landmarks)) detectedLetter = 'N';
            else if (isOGesture(landmarks)) detectedLetter = 'O';
            else if (isPGesture(landmarks)) detectedLetter = 'P';
            else if (isQGesture(landmarks)) detectedLetter = 'Q';
            else if (isRGesture(landmarks)) detectedLetter = 'R';
            else if (isSGesture(landmarks)) detectedLetter = 'S';
            else if (isTGesture(landmarks)) detectedLetter = 'T';
            else if (isUGesture(landmarks)) detectedLetter = 'U';
            else if (isVGesture(landmarks)) detectedLetter = 'V';
            else if (isWGesture(landmarks)) detectedLetter = 'W';
            else if (isXGesture(landmarks)) detectedLetter = 'X';
            else if (isYGesture(landmarks)) detectedLetter = 'Y';
            else if (isZGesture(landmarks)) detectedLetter = 'Z';

            if (detectedLetter) {
                status.textContent = 'Detected gesture: ' + detectedLetter;
                textOutput.textContent = 'Detected Gesture: ' + detectedLetter;
                showGestureImage(detectedLetter);
                updateHistory(detectedLetter);
                showLetterImage(detectedLetter); // Toon de afbeelding van de letter
                lastDetectionTime = now; // Update de laatste detectietijd
                toggleGestureGuide(true); // Toon de gebaren gids
            } else {
                status.textContent = 'No gesture detected';
                textOutput.textContent = 'Detected Gesture: None';
                toggleGestureGuide(false);
                hideLetterImage(); // Verberg de afbeelding van de letter
            }
        } else {
            status.textContent = 'No hand detected';
            textOutput.textContent = 'Detected Gesture: None';
            toggleGestureGuide(false);
        }

        lastDetectionTime = now;
    } catch (error) {
        console.error("Error detecting hands:", error);
        status.textContent = 'Error detecting hands.';
    }

    isDetecting = false;
    requestAnimationFrame(detect);
}

function detectHands() {
    detect();
}

// Gebarenherkenningsfuncties
function isAGesture(landmarks) {
  const thumbTip = landmarks[4];
  const thumbMCP = landmarks[2];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];

  // Duim moet omhoog staan
  const isThumbUp = thumbTip[1] < thumbMCP[1];

  // Alle andere vingers moeten gebogen zijn
  const areFingersBent = (
      indexTip[1] > landmarks[6][1] &&
      middleTip[1] > landmarks[10][1] &&
      ringTip[1] > landmarks[14][1] &&
      pinkyTip[1] > landmarks[18][1]
  );

  return isThumbUp && areFingersBent;
}

function isBGesture(landmarks) {
    const thumbTip = landmarks[4];
    const thumbMCP = landmarks[2];
    const indexMCP = landmarks[5];
    const middleMCP = landmarks[9];
    const ringMCP = landmarks[13];
    const pinkyMCP = landmarks[17];

    const pinkyTip = landmarks[20];
    const pinkyPIP = landmarks[18];
    const ringTip = landmarks[16];

    const isPinkyStraight = pinkyTip[1] < pinkyPIP[1];

    const isRingTipAbovePinkyTip = ringTip[1] < pinkyTip[1];

    const isThumbBelowAllMCPs = (
        thumbTip[1] > indexMCP[1] &&
        thumbTip[1] > middleMCP[1] &&
        thumbTip[1] > ringMCP[1] &&
        thumbTip[1] > pinkyMCP[1]
    );

    return isPinkyStraight && isRingTipAbovePinkyTip && isThumbBelowAllMCPs;
}

function isCGesture(landmarks) {
    const thumbTip = landmarks[4];
    const thumbMCP = landmarks[2];
    const ringTip = landmarks[16];
    const ringDIP = landmarks[15];
    const pinkyMCP = landmarks[17];
    
    const isRingFingerAbovePinkyMCP = (
        ringDIP[1] < pinkyMCP[1] &&
        ringTip[1] < pinkyMCP[1]
    );

    const isThumbStraight = Math.abs(thumbTip[1] - thumbMCP[1]) < 20;

    return isRingFingerAbovePinkyMCP && isThumbStraight;
}

function isDGesture(landmarks) {
    const thumbTip = landmarks[4];
    const thumbIP = landmarks[3];
    const indexTip = landmarks[8];
    const indexPIP = landmarks[6];
    const ringTip = landmarks[16];
    const ringDIP = landmarks[15];
    const ringPIP = landmarks[14];
    const pinkyTip = landmarks[20];
    const pinkyDIP = landmarks[19];

    const isRingFingerAbovePinkyDIP = (
        ringDIP[1] < pinkyDIP[1] &&
        ringPIP[1] < pinkyDIP[1]
    );

    const isPinkyTipBelowDIP = pinkyTip[1] > pinkyDIP[1];

    const isIndexFingerStraightAndHighest = (
        indexTip[1] < indexPIP[1] &&
        indexTip[1] < Math.min(
            thumbTip[1], ringTip[1], pinkyTip[1]
        )
    );

    return isRingFingerAbovePinkyDIP && isPinkyTipBelowDIP && isIndexFingerStraightAndHighest;
}

function isEGesture(landmarks) {
    const thumbTip = landmarks[4];
    const thumbMCP = landmarks[2];
    const indexMCP = landmarks[5];
    const middleMCP = landmarks[9];
    const ringMCP = landmarks[13];
    const pinkyMCP = landmarks[17];
    const indexTip = landmarks[8];
    const indexDIP = landmarks[7];
    const middleTip = landmarks[12];
    const middleDIP = landmarks[11];
    const ringTip = landmarks[16];
    const ringDIP = landmarks[15];
    const pinkyTip = landmarks[20];
    const pinkyDIP = landmarks[19];

    const isThumbBelowMCPs = (
        thumbTip[1] > Math.min(indexMCP[1], middleMCP[1], ringMCP[1], pinkyMCP[1])
    );

    const areTipsBelowDIPs = (
        indexTip[1] > indexDIP[1] &&
        middleTip[1] > middleDIP[1] &&
        ringTip[1] > ringDIP[1] &&
        pinkyTip[1] > pinkyDIP[1]
    );

    const isRingDIPAbovePinkyDIP = ringDIP[1] < pinkyDIP[1];

    return isThumbBelowMCPs && areTipsBelowDIPs && isRingDIPAbovePinkyDIP;
}

function isFGesture(landmarks) {
    const thumbTip = landmarks[4];
    const thumbIP = landmarks[3];
    const indexTip = landmarks[8];
    const indexDIP = landmarks[7];
    const pinkyTip = landmarks[20];
    const ringTip = landmarks[16];
    const pinkyPIP = landmarks[18];  // Nodig om de stand van de pink te bepalen

    // Controleer of de pink recht omhoog staat
    const isPinkyStraight = pinkyTip[1] < pinkyPIP[1];

    // Controleer of de ringvinger tip boven de pink tip staat
    const isRingTipAbovePinkyTip = ringTip[1] < pinkyTip[1];

    // Controleer of de duim rechtop staat (duimtip en duim IP bijna op dezelfde hoogte)
    const isThumbStraight = Math.abs(thumbTip[1] - thumbIP[1]) < 20; // Tolerantie van 20 pixels voor verticale afwijking

    // Controleer of de duim tip niet boven de wijsvinger tip komt
    const isThumbTipBelowIndexTip = thumbTip[1] > indexTip[1];

    // Controleer of de wijsvinger DIP en tip horizontaal staan
    const isIndexFingerHorizontal = Math.abs(indexTip[1] - indexDIP[1]) < 20; // Tolerantie van 20 pixels voor horizontale afwijking

    return isPinkyStraight && isRingTipAbovePinkyTip && isThumbStraight && isThumbTipBelowIndexTip && isIndexFingerHorizontal;
}

function isGGesture(landmarks) {
  const thumbTip = landmarks[4];
  const thumbMCP = landmarks[2];
  const indexTip = landmarks[8];
  const indexDIP = landmarks[7];
  const ringDIP = landmarks[15];
  const pinkyTip = landmarks[20];
  const pinkyDIP = landmarks[19];

  // Duim moet horizontaal staan
  const isThumbHorizontal = Math.abs(thumbTip[1] - thumbMCP[1]) < 20;

  // Pink en ringvinger moeten gebogen zijn
  const isPinkyBent = pinkyTip[1] > pinkyDIP[1];
  const isRingBent = ringDIP[1] > landmarks[13][1]; // Ring knokkel hoogte

  // Wijsvinger moet recht blijven
  const isIndexStraight = indexTip[1] < indexDIP[1];

  return isThumbHorizontal && isPinkyBent && isRingBent && isIndexStraight;
}

function isHGesture(landmarks) {
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];

  return (
      indexTip[1] < middleTip[1] && 
      middleTip[1] > ringTip[1] && 
      ringTip[1] > pinkyTip[1]
  );
}

function isIGesture(landmarks) {
  const thumbTip = landmarks[4];
  const pinkyTip = landmarks[20];

  return (
      thumbTip[1] < pinkyTip[1] && 
      thumbTip[1] < landmarks[2][1] && 
      pinkyTip[1] < landmarks[18][1]
  );
}

function isJGesture(landmarks) {
  const indexTip = landmarks[8];
  const pinkyTip = landmarks[20];

  // Index finger points up, pinky curls down
  return (
      indexTip[1] < landmarks[6][1] && 
      pinkyTip[1] > landmarks[18][1]
  );
}

function isKGesture(landmarks) {
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];

  return (
      thumbTip[0] < landmarks[3][0] && 
      indexTip[1] < landmarks[6][1] && 
      middleTip[1] < landmarks[10][1]
  );
}

function isLGesture(landmarks) {
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];

  return (
      thumbTip[1] < landmarks[3][1] && 
      indexTip[1] < landmarks[6][1] && 
      Math.abs(thumbTip[1] - indexTip[1]) < 20
  );
}

function isMGesture(landmarks) {
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];

  return (
      indexTip[1] > landmarks[6][1] && 
      middleTip[1] > landmarks[10][1] && 
      ringTip[1] > landmarks[14][1] &&
      indexTip[0] < middleTip[0] &&
      middleTip[0] < ringTip[0]
  );
}

function isNGesture(landmarks) {
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];

  return (
      indexTip[1] > landmarks[6][1] && 
      middleTip[1] > landmarks[10][1] && 
      ringTip[1] > landmarks[14][1] &&
      indexTip[0] < middleTip[0] &&
      middleTip[0] > ringTip[0]
  );
}

function isOGesture(landmarks) {
  const thumbTip = landmarks[4];
  const thumbIP = landmarks[3];
  const indexTip = landmarks[8];
  const indexPIP = landmarks[6];
  const middleTip = landmarks[12];
  const middlePIP = landmarks[10];

  return (
      thumbTip[0] < thumbIP[0] && 
      indexTip[1] > indexPIP[1] &&
      middleTip[1] > middlePIP[1] &&
      thumbTip[1] > landmarks[2][1]
  );
}

function isPGesture(landmarks) {
  const thumbTip = landmarks[4];
  const thumbMCP = landmarks[2];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];

  return (
      thumbTip[0] > thumbMCP[0] &&
      indexTip[1] < middleTip[1] && 
      thumbTip[1] > middleTip[1]
  );
}

function isQGesture(landmarks) {
  const thumbTip = landmarks[4];
  const thumbIP = landmarks[3];
  const indexTip = landmarks[8];
  const indexDIP = landmarks[7];
  const middleTip = landmarks[12];

  return (
      thumbTip[0] > thumbIP[0] && 
      indexTip[1] < indexDIP[1] &&
      middleTip[1] > landmarks[10][1]
  );
}

function isRGesture(landmarks) {
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];

  return (
      indexTip[1] < middleTip[1] &&
      middleTip[1] < ringTip[1]
  );
}

function isSGesture(landmarks) {
  const thumbTip = landmarks[4];
  const thumbIP = landmarks[3];
  const indexTip = landmarks[8];
  const indexMCP = landmarks[5];
  const middleTip = landmarks[12];
  const middleMCP = landmarks[9];

  return (
      thumbTip[0] > thumbIP[0] && 
      indexTip[1] > indexMCP[1] &&
      middleTip[1] > middleMCP[1]
  );
}

function isTGesture(landmarks) {
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];

  return (
      thumbTip[0] < landmarks[3][0] &&
      indexTip[1] > landmarks[6][1] &&
      middleTip[1] > landmarks[10][1]
  );
}

function isUGesture(landmarks) {
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];

  return (
      indexTip[1] < landmarks[6][1] &&
      middleTip[1] < landmarks[10][1] &&
      ringTip[1] > landmarks[14][1]
  );
}

function isVGesture(landmarks) {
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];

  return (
      indexTip[1] < landmarks[6][1] &&
      middleTip[1] < landmarks[10][1] &&
      ringTip[1] > landmarks[14][1]
  );
}

function isWGesture(landmarks) {
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];

  return (
      indexTip[1] < landmarks[6][1] &&
      middleTip[1] < landmarks[10][1] &&
      ringTip[1] < landmarks[14][1]
  );
}

function isXGesture(landmarks) {
  const indexTip = landmarks[8];
  const indexPIP = landmarks[6];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];

  return (
      indexTip[0] > indexPIP[0] &&
      middleTip[1] > landmarks[10][1] &&
      ringTip[1] > landmarks[14][1] &&
      pinkyTip[1] > landmarks[18][1]
  );
}

function isYGesture(landmarks) {
  const thumbTip = landmarks[4];
  const pinkyTip = landmarks[20];

  return (
      thumbTip[1] < landmarks[2][1] && 
      pinkyTip[1] < landmarks[18][1] && 
      Math.abs(thumbTip[0] - pinkyTip[0]) > 20
  );
}

function isZGesture(landmarks) {
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];

  // Alleen de wijsvinger en middelvinger moeten omhoog staan
  const areIndexAndMiddleUp = (
      indexTip[1] < landmarks[6][1] &&
      middleTip[1] < landmarks[10][1]
  );

  // Duim, ringvinger en pinky moeten naar beneden wijzen
  const areThumbRingAndPinkyDown = (
      thumbTip[1] > landmarks[2][1] &&
      ringTip[1] > landmarks[14][1] &&
      pinkyTip[1] > landmarks[18][1]
  );

  return areIndexAndMiddleUp && areThumbRingAndPinkyDown;
}

main();