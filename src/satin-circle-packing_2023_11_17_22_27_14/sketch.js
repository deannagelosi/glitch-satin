/* 
  Title: Circle Packing
  Description: Uses a Circle Packing Algorithm to generate interlacements at the center of   
               circles
               
  How to Use:
    1. Setup the following (search uppercase letters):
          *MAXR - maximum radius
          *CIR - number of proposed circles per iteration
          *MAXC - maximum number of circles
    2. Press play
    
    Note: show circles by setting showCircleOutlines = true
  
  Reference:
  https://github.com/CodeAsCreativeMedium/exercises/tree/main/15_simulation/08_circle_packing
*/

// canvas setup
let width = 5000; 
let height = 1000;
let drawdown_width = 5000;
let drawdown_height = 1000;
let cellSize = 10;
let drawdown = [];

// draft setup
let wefts = Math.floor(drawdown_height / cellSize); // Rows
let warps = Math.floor(drawdown_width / cellSize);  // Columns

// circle packing setup
var nProposals = 10;     // *CIR - number of "proposals" for each iteration:
                         // pick the "best" circle among this number
                         // of candidates
var maxRadius = 200;     // *MAXR - maximum radius for each circle
var circles = [];        // array for holding all the circles
let showCircleOutlines = false; // Set to false to hide outlines by default

function setup() {
  createCanvas(width, height);

  for (let i = 0; i < wefts; i++) {
    drawdown[i] = [];
    for (let j = 0; j < warps; j++) {
      drawdown[i][j] = 0; // Initialize with zeros
    }
  }
}

function draw() {
  background(255);
  
  // Draw the grid
  for (let i = 0; i < wefts; i++) {
    for (let j = 0; j < warps; j++) {
      if (drawdown[i][j] == 1) {
        fill(0, 0, 0);
      } else {
        noFill();
      }
      rect(j * cellSize, i * cellSize, cellSize, cellSize);
    }
  }

  // Add a limited number of circles each frame
  for (let i = 0; i < 5; i++) {
    if (addCircle() < 1) break; // Adjust the threshold as needed
  }

  // Draw circle outlines if the toggle is true
  if (showCircleOutlines) {
    for (let circle of circles) {
      stroke(0); // Set outline color
      noFill();
      ellipse(circle.x, circle.y, circle.r * 2); // Draw circle outline
    }
  }

  // *MAXC - Stop the loop if maximum number of circles is reached
  if (circles.length > 500) { // Set a limit to the number of circles
    noLoop();
  }
}

function addCircle(){
  var proposals = [];
  for (var i = 0; i < nProposals; i++){
    proposals.push(propose());
  }
  proposals.sort((a,b) => b.r - a.r); // sort in descending order by radius

  var bestCircle = proposals[0];
  circles.push(bestCircle);

  // Find the closest grid cell to the circle's center
  var gridX = Math.floor(bestCircle.x / cellSize);
  var gridY = Math.floor(bestCircle.y / cellSize);

  // Update the drawdown array to fill this cell
  if(gridX >= 0 && gridX < warps && gridY >= 0 && gridY < wefts){
    drawdown[gridY][gridX] = 1;
  }

  return bestCircle.r;
}

// make a "proposal" for circle placement
function propose(){
  var x, y, r;
  
  // repeat until we have a circle with positive radius,
  // i.e. one that is not overlapping with anything
  do {
    x = random(width);
    y = random(height);
    // first, bound the radius with canvas borders
    r = min(maxRadius,min(min(x,width-x),min(y,height-y)));
    // then, bound the radius by computing distance to every other circle
    for (var i = 0; i < circles.length; i++){
      var d = dist(x,y,circles[i].x,circles[i].y);
      r = min(r,d-circles[i].r);
      if (r<=0) break; // already invalid, give up early
    }
  } while (r <= 0);
  return {x,y,r};
}