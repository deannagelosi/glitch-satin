/* 
  Title: Tabby to Satin Transformation - Paintbrush
  Description: A cursor-responsive environment that fills negative spaces 
               with satin and positive spaces (cursor-effected) with tabby 

  -How To Use-
  1. Click the grid to add tabby
  2. Hold the cursor to increase the size of the circle
  
  Note: Adjust the sensitivity of the transformation
*/

// canvas setup
let width = 500; 
let height = 500;
let drawdown_width = 500;
let drawdown_height = 500;
let cellSize = 10;
let drawdown = [];

// draft setup
let wefts = Math.floor(drawdown_height / cellSize); // Rows
let warps = Math.floor(drawdown_width / cellSize);  // Columns

// interaction setup
let mousePressedTime;

// weave structure setup
let tabbyArray, satinArray;

function setup() {
  createCanvas(width, height);
  
  let satin = new Satin(5, 2);
  satinArray = satin.generatePatternArray(wefts, warps);
  
  let tabby = new Tabby();
  tabbyArray = tabby.generatePatternArray(wefts, warps);

  for (let i = 0; i < wefts; i++) {  // Rows
    drawdown[i] = [];
    for (let j = 0; j < warps; j++) {   // Columns
      drawdown[i][j] = tabbyArray[i][j];
    }
  }
}

function draw() {
  background(255);
  
  if (mouseIsPressed) {
    let duration = millis() - mousePressedTime;
    let radius = calculateRadius(duration);
    updatePattern(mouseX, mouseY, radius);
  }
  
  for (let i = 0; i < wefts; i++) {         // Rows
    for (let j = 0; j < warps; j++) {       // Columns
      if (drawdown[i][j] == 1) {
        fill(0, 0, 0);
      } else {
        noFill();
      }
      rect(j * cellSize, i * cellSize, cellSize, cellSize);
    }
  }
}

function mousePressed() {
  mousePressedTime = millis(); // Store the time when the mouse was pressed
  updatePattern(mouseX, mouseY, 0); // Initial update for the cell under the mouse
}

function mouseDragged() {
  let duration = millis() - mousePressedTime;
  let radius = calculateRadius(duration);
  updatePattern(mouseX, mouseY, radius);
}

function mouseReleased() {
  mousePressedTime = null;
}

function calculateRadius(duration) {
  return Math.floor(duration / 1000); // Change sensitivity by adjusting the denominator
}

function updatePattern(x, y, radius) {
  let gridX = Math.floor(x / cellSize);  // Column
  let gridY = Math.floor(y / cellSize);  // Row
  
  console.log(`Mouse X: ${x}, Mouse Y: ${y}`);
  console.log(`Grid X: ${gridX}, Grid Y: ${gridY}`);

  // Check if the click is within the grid bounds
  if (gridX < 0 || gridX >= wefts || gridY < 0 || gridY >= warps) {
    console.log("Click is outside grid bounds");
    return; // Exit the function if the click is out of bounds
  }

  console.log(`Grid X: ${gridX}, Grid Y: ${gridY}, Radius: ${radius}`);
  
  for (let i = -radius; i <= radius; i++) {
    for (let j = -radius; j <= radius; j++) {
      let cellX = gridX + j;  // Column
      let cellY = gridY + i;  // Row

      // Ensure the cell is within the radius and within the grid bounds
      if (Math.sqrt(j * j + i * i) <= radius && cellX >= 0 && cellX < wefts && cellY >= 0 && cellY < warps) {
        console.log(`Updating cell at X: ${cellX}, Y: ${cellY}`);

        // Update the drawdown array with satin pattern
        drawdown[cellY][cellX] = satinArray[cellY][cellX];
      }
    }
  }

  redraw();
}