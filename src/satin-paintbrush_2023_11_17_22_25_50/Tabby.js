class Tabby {
  generatePatternArray(wefts, warps) {
    let patternArray = [];

    for (let i = 0; i < wefts; i++) {
      patternArray[i] = [];
      for (let j = 0; j < warps; j++) {
        patternArray[i][j] = (i + j) % 2 == 0 ? 1 : 0;
      }
    }
    
    console.log(`Tabby Last Row: ${patternArray[wefts - 1]}`);

    return patternArray;
  }
}

