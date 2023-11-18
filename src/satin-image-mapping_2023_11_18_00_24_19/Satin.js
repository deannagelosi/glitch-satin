class Satin {
  constructor(_repeat = 5, _move = 2) {
    this.repeat = _repeat;
    this.move = _move;
  }

  generatePatternArray(wefts, warps) {
    let patternArray = [];

    for (let i = 0; i < wefts; i++) {
      patternArray[i] = []; 
      let fillPosition = (this.repeat - (i * this.move) % this.repeat) % this.repeat;
      for (let j = 0; j < warps; j++) {
        patternArray[i][j] = (j % this.repeat === fillPosition) ? 1 : 0;
      }
    }
    
    console.log(`Satin Last Row: ${patternArray[wefts - 1]}`);

    return patternArray;
  }
}
