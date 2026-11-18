const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');
let displayWidth = canvas.getBoundingClientRect().width;
let displayHeight = canvas.getBoundingClientRect().height;
canvas.width = displayWidth;
canvas.height = displayHeight;
let displayShortestSide = Math.min(displayWidth, displayHeight);
const scaleUnit = displayShortestSide / 200;
let center = { x: (displayWidth / 2), y: (displayHeight / 2) };
let mouseX = null;
let mouseY = null;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function DrawLineFromPointToPoint(originPoint, point, scaleOriginPoint = false) {
    ctx.clearRect(0, 0, displayWidth, displayHeight);
    ctx.beginPath();
    let x = scaleOriginPoint ? originPoint.x * scaleUnit : originPoint.x;
    let y = scaleOriginPoint ? originPoint.y * scaleUnit : originPoint.y;
    ctx.moveTo(x, y);
    ctx.lineTo(point.x, point.y);
    ctx.closePath();
    ctx.strokeStyle = "#FFFFFF";
    ctx.stroke();
}
function RotatePointFromOriginPoint(originPoint, point, degrees, scaleOriginPoint = false) {
    let x = scaleOriginPoint ? originPoint.x * scaleUnit : originPoint.x;
    let y = scaleOriginPoint ? originPoint.y * scaleUnit : originPoint.y;
    let radians = degrees * (Math.PI / 180);
    let pointX = (point.x - x) * Math.cos(radians) - (point.y - y) * Math.sin(radians);
    let pointY = (point.x - x) * Math.sin(radians) + (point.y - y) * Math.cos(radians);
    return {
        x: pointX + x,
        y: pointY + y
    };
}

document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

async function Loop() {
    let lastDegree = 0;
    let startPoint = {x: center.x + 0 * scaleUnit, y: center.y + 50 * scaleUnit};
    while (true) {
        if (lastDegree >= 360) lastDegree = 0;
        let rotatedPoint = RotatePointFromOriginPoint(center, startPoint, lastDegree);
        DrawLineFromPointToPoint(center, rotatedPoint, false);
        await sleep(10);
        lastDegree += 1;
    }
}

Loop();

//DrawLineFromPointToPoint(center, {x: 3, y: -23}, false);