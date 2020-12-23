// Create a pattern, offscreen
const patternCanvas = document.createElement('canvas');
const patternContext = patternCanvas.getContext('2d');

// Give the pattern a width and height of 50
patternCanvas.width = 50;
patternCanvas.height = 50;

// Give the pattern a background color and draw an arc
patternContext.fillStyle = 'black';
patternContext.fillRect(0, 0, patternCanvas.width, patternCanvas.height);
patternContext.strokeStyle = 'green'
patternContext.arc(0, 0, 50, 0, .5 * Math.PI);
patternContext.stroke();

// Create our primary canvas and fill it with the pattern
const canvas = document.createElement('canvas');
var ctx = canvas.getContext("2d");

canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style = "position: absolute;top: 0;z-index:-1;"

const pattern = ctx.createPattern(patternCanvas, 'repeat');
ctx.fillStyle = pattern;
ctx.fillRect(0, 0, canvas.width, canvas.height);



// Add our primary canvas to the webpage
document.body.appendChild(canvas);


// Create gradient
//var grd = ctx.createLinearGradient(0, 0, 200, 0);
//grd.addColorStop(0, "red");
//grd.addColorStop(1, "white");

// Fill with gradient
// ctx.fillStyle = grd;
// ctx.fillRect(10, 10, 150, 80);