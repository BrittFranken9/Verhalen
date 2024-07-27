import './style.css'
const video = document.getElementById('video');
const canvas = document.getElementById('overlay');
const drawingCanvas = document.getElementById('drawing');
const context = canvas.getContext('2d');
const drawingContext = drawingCanvas.getContext('2d');
const storyText = document.getElementById('storyText');

const modelParams = {
    flipHorizontal: true,
    maxNumBoxes: 1,
    iouThreshold: 0.5,
    scoreThreshold: 0.6,
};

handTrack.startVideo(video).then(status => {
    if (status) {
        navigator.getUserMedia({ video: {} }, stream => {
            video.srcObject = stream;
            runDetection();
        },
        err => console.log(err)
        );
    }
});

function runDetection() {
    model.detect(video).then(predictions => {
        model.renderPredictions(predictions, canvas, context, video);
        if (predictions.length > 0) {
            const hand = predictions[0];
            handleGesture(hand);
        }
        requestAnimationFrame(runDetection);
    });
}

function handleGesture(hand) {
    const bbox = hand.bbox;
    if (bbox[0] < canvas.width / 3) {
        generateStoryAndDrawing("left");
    } else if (bbox[0] > canvas.width * 2 / 3) {
        generateStoryAndDrawing("right");
    } else {
        generateStoryAndDrawing("center");
    }
}

function generateStoryAndDrawing(gesture) {
    fetch('http://localhost:5000/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ gesture: gesture })
    })
    .then(response => response.json())
    .then(data => {
        storyText.innerText = data.story;
        drawVisual(data.drawing);
    });
}

function drawVisual(drawing) {
    drawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    drawingContext.fillStyle = drawing.color;
    drawingContext.fillRect(50, 50, 200, 100); // Example drawing
}

handTrack.load(modelParams).then(lmodel => {
    model = lmodel;
});
