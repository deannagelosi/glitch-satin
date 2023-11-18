/* 
  Title: Image Mapping
  Description: Takes in a color image and determines its color values. For each color 
               value, a satin will be applied with different min and max values.
               
  The project will
  - Take an image upload in the data folder at the root level
  - Parse the image for its primary 2 colors
  - Map the image onto a grid and identify which cells are which of the two previously identified colors
  - Apply a satin pattern to one color and a tabby to another
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

let img;
let k = 2; // Number of clusters (primary colors) to identify
let centroids = []; // To store the two primary colors
let isImageLoaded = false;
let isClusteringComplete = false;
let isClustering = false;
let maxIterations = 50; // You can adjust this number based on your needs
let mappings = [];
let satinPattern;
let tabbyPattern;

function preload() {
  img = loadImage("data/e71_1_medium.png", img => {
    img.loadPixels();
    isImageLoaded = true;
    initializeCentroids(); // Corrected function name
    KMeans(0);
  });
}

function setup() {
  if (!isImageLoaded) return;
  
  createCanvas(width, height);
  img.loadPixels();
  initializeCentroids(); // Initialize k-means centroids
  KMeans(0); // Start k-means clustering
  
  let satin = new Satin(); // Assuming you have constructor parameters if needed
  let tabby = new Tabby(); // Same as above
  satinPattern = satin.generatePatternArray(wefts, warps);
  tabbyPattern = tabby.generatePatternArray(wefts, warps);

  for (let i = 0; i < wefts; i++) {
    for (let j = 0; j < warps; j++) {
      let pixelIndex = (floor(i * cellSize / img.height * img.width) + floor(j * cellSize / img.width)) * 4;
      let pixelColor = color(img.pixels[pixelIndex], img.pixels[pixelIndex + 1], img.pixels[pixelIndex + 2]);
      
      let closestCentroidIndex = getClosestCentroidIndex(pixelColor);
      if (closestCentroidIndex === 0) {
        // Apply Satin pattern
        if (satinPattern[i][j] === 1) {
          fill(centroids[0]);
        } else {
          noFill();
        }
      } else {
        // Apply Tabby pattern
        if (tabbyPattern[i][j] === 1) {
          fill(centroids[1]);
        } else {
          noFill();
        }
      }
      rect(j * cellSize, i * cellSize, cellSize, cellSize);
    }
  }
}

function draw() {
  if (!isClusteringComplete) {
    console.log("Clustering in progress ...")
    return;
  }

  background(255);
  
  for (let i = 0; i < wefts; i++) {         // Rows
    for (let j = 0; j < warps; j++) {       // Columns
      let colorIndex = getColorIndexForCell(i, j); // You need to define this function
      if (colorIndex === 0) {
        // If the color matches the first centroid, use the satin pattern
        if (satinPattern[i][j] === 1) {
          fill(centroids[0]); // centroids[0] is the first primary color
        } else {
          noFill();
        }
      } else {
        // If the color matches the second centroid, use the tabby pattern
        if (tabbyPattern[i][j] === 1) {
          fill(centroids[1]); // centroids[1] is the second primary color
        } else {
          noFill();
        }
      }
      rect(j * cellSize, i * cellSize, cellSize, cellSize);
    }
  }
}

function getClosestCentroidIndex(color) {
  // Determine which centroid (primary color) is closest to the given color
  let minDist = Infinity;
  let closestIndex = 0;
  for (let i = 0; i < centroids.length; i++) {
    let d = dist(red(color), green(color), blue(color), red(centroids[i]), green(centroids[i]), blue(centroids[i]));
    if (d < minDist) {
      minDist = d;
      closestIndex = i;
    }
  }
  return closestIndex;
}

function KMeans(iteration) {
  isClustering = true;

  if (!isClustering) return; // Stop if clustering is done

  if (iteration >= maxIterations) {
    console.log("Reached maximum iterations");
    noLoop();
    return;
  }

  var updated = false;
  for (var i = 0; i < img.width * img.height; i++) {
    var u = updateAssignment(i);
    if (u) { updated = true; }
  }
  
  if (!updated) {
    console.log("Finished clustering");
    isClusteringComplete = true;
    noLoop();
    draw(); // Trigger the draw function once clustering is complete
    return;
  }

  updateCentroids();

  setTimeout(function() {
    KMeans(iteration + 1);
  }, 0); // Schedule next iteration asynchronously
  
  if (updated) {
    requestAnimationFrame(KMeansIteration); // Schedule next iteration
  } else {
    isClustering = false; // Stop clustering
  }
  
  if (!updated || iteration >= maxIterations) {
    isClustering = false;
  }
}

function initializeCentroids() {
    // Initialize centroids to be existing colors in the image
    for (var i = 0; i < k; i++) {
        var start = int(1.0 * img.width * img.height * i / k);
        centroids.push(getPixel(start));
    }
    console.log("Initialized centroids:", centroids);
}

function getPixel(index) {
    var r = img.pixels[index * 4];
    var g = img.pixels[index * 4 + 1];
    var b = img.pixels[index * 4 + 2];
    var a = img.pixels[index * 4 + 3];
    return color(r, g, b, a);
}

function setupPatterns() {
  let satin = new Satin(); // Assuming you have constructor parameters if needed
  let tabby = new Tabby(); // Same as above
  satinPattern = satin.generatePatternArray(wefts, warps);
  tabbyPattern = tabby.generatePatternArray(wefts, warps);
}

function getColorIndexForCell(i, j) {
  // Calculate the corresponding pixel index in the image
  let imgX = floor(j * cellSize / drawdown_width * img.width);
  let imgY = floor(i * cellSize / drawdown_height * img.height);
  let index = (imgY * img.width + imgX) * 4;

  // Get the color of the pixel
  let pixelColor = getPixelColor(index);

  // Compare the pixel color with the two centroids
  let distToFirstCentroid = colorDistance(pixelColor, centroids[0]);
  let distToSecondCentroid = colorDistance(pixelColor, centroids[1]);

  // Determine which centroid is closer
  if (distToFirstCentroid < distToSecondCentroid) {
    return 0; // First centroid is closer
  } else {
    return 1; // Second centroid is closer
  }
}

function getPixelColor(index) {
  let r = img.pixels[index];
  let g = img.pixels[index + 1];
  let b = img.pixels[index + 2];
  return color(r, g, b);
}

function colorDistance(c1, c2) {
  // Euclidean distance in RGB color space
  let dr = red(c1) - red(c2);
  let dg = green(c1) - green(c2);
  let db = blue(c1) - blue(c2);
  return sqrt(dr * dr + dg * dg + db * db);
}

function updateAssignment(index) {
    let currentPixel = getPixelColor(index); // Assuming getPixelColor gets the color at the pixel index
    let minDistance = Infinity;
    let closestCentroid = 0;
    let hasChanged = false;

    // Loop through each centroid to find the closest one
    for (let i = 0; i < centroids.length; i++) {
        let distance = colorDistance(currentPixel, centroids[i]);
        if (distance < minDistance) {
            minDistance = distance;
            closestCentroid = i;
        }
    }

    // Check if the assignment has changed
    if (mappings[index] !== closestCentroid) {
        mappings[index] = closestCentroid;
        hasChanged = true;
    }

    return hasChanged;
}

function updateCentroids() {
    let sums = Array(centroids.length).fill().map(() => [0, 0, 0]);
    let counts = Array(centroids.length).fill(0);

    // Sum up all colors assigned to each centroid
    for (let i = 0; i < mappings.length; i++) {
        let centroidIndex = mappings[i];
        let pixelColor = getPixelColor(i);
        sums[centroidIndex][0] += red(pixelColor);
        sums[centroidIndex][1] += green(pixelColor);
        sums[centroidIndex][2] += blue(pixelColor);
        counts[centroidIndex]++;
    }

    // Update each centroid with the average color
    for (let i = 0; i < centroids.length; i++) {
        if (counts[i] > 0) {
            let newR = sums[i][0] / counts[i];
            let newG = sums[i][1] / counts[i];
            let newB = sums[i][2] / counts[i];
            centroids[i] = color(newR, newG, newB);
        }
    }
}

function KMeansIteration() {
    let hasChanged = false;
    for (let i = 0; i < img.width * img.height; i++) {
        if (updateAssignment(i)) {
            hasChanged = true;
        }
    }
    updateCentroids();

    if (!hasChanged) {
        // Clustering has converged
        console.log("Clustering completed.");
        // Additional code to handle the end of clustering
    } else {
        // Optionally, schedule the next iteration
        setTimeout(KMeansIteration, 0);
    }
}
