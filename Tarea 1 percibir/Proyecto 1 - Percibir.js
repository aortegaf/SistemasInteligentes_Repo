var playVector = { x: 637, y: 264};
var down = { x: 93, y: 323}
var up = { x: 93, y: 244}
var rigth = { x: 163, y: 311}
var left = { x: 28, y: 311}

var cellSize = 5;

// 220 ms equivale al movimiento de 25 px
var defaultTimeout = 220;

var TYPES = {
  CAR: 'CAR',
  STREET: 'STREET',
  OWL: 'OWL',
  HOUSE: 'HOUSE',
  OTHER: 'OTHER',
}

// Objeto con todo lo relacionado al canvas. Repreenta los metodos de entrada y salida del programa

var CanvasController = {
  // Objeto Canvas donde esta el juego
  canvas: document.getElementById("canvas"),
  /**
   * Retorna la matriz de pixeles del canvas
   */
  getImage: ()=>{
    var canvasRect = CanvasController.canvas.getBoundingClientRect();
    var canvasImg = CanvasController.canvas.getContext("2d").getImageData(0, 0, canvasRect.width, canvasRect.height);
    var exit = [];
    for(var i = 0; i < canvasRect.height; i++){
      var tmp = [];
      for(var j = 0; j < canvasRect.width; j++) {
        tmp.push({
          r:canvasImg.data[4*(canvasImg.width * i + j)],
          g:canvasImg.data[4*(canvasImg.width * i + j) + 1],
          b:canvasImg.data[4*(canvasImg.width * i + j) + 2],
          t:canvasImg.data[4*(canvasImg.width * i + j) + 3],
        })
      }
      exit.push(tmp)
    }

    return exit;
  },
  /**
   * 
   * @param {*} pos posicion x, y en la cual hacer click dentro del canvas
   * @param {*} steps Cantidad de tiempo para el click
   * 
   * Hace click en una posicion determinada dentro del CanvasController.canvas. Usar con await.
   */
  click: async (pos, steps) => {
    steps = steps || 1;
    var canvasRect = CanvasController.canvas.getBoundingClientRect();
    var e = {preventDefault:function(){}} // Fake "mouse event" to prevent errors
    stage._handlePointerDown(-1, e, pos.x + canvasRect.x, pos.y + canvasRect.y); 
    await new Promise(resolve => {
      setTimeout(()=>{
        stage._handlePointerUp(-1);
        resolve();
      }, steps * defaultTimeout)
    })
  },

  /**
   * 
   * @param {*} img Una matriz de pixeles
   * 
   * Retorna un objeto ImgData que puede ser impreso en un canvas
   */
  imgToImgData: (img) =>{
    var arr = [];
    for(var i = 0; i < img.length; i++) for(var j = 0; j < img[i].length; j++){
      arr.push(img[i][j].r);
      arr.push(img[i][j].g);
      arr.push(img[i][j].b);
      arr.push(img[i][j].t);
    }

    return new ImageData(new Uint8ClampedArray(arr), img[0].length, img.length);
  },

  // Color de las lineas al dibujar la matriz
  lineColor: {
    r: 255,
    g: 255,
    b: 255,
    t: 255,
  },

  /**
   * 
   * @param {*} img Matriz de Pixeles a dibujar.
   * Dibuja en un canvas debajo del juego la matriz de pixeles
   */
  drawImg: (img)=>{
    var tmpEl = document.createElement("canvas");
    tmpEl.setAttribute('width', img[0].length + 4);
    tmpEl.setAttribute('height', img.length + 4);
    document.getElementsByClassName("clearfloat")[0].appendChild(tmpEl);
    tmpEl.getContext("2d").putImageData(CanvasController.imgToImgData(img), 0, 0);
  },

  /**
 * Dibuja el canvas en la parte inferior del canvas junto las celdas.
 */
 drawLinesOfMatrix: ()=>{
  var img = CanvasController.getImage();

  for(var i = 0; cellSize * i < img.length; i++) {
    for(var j = 0; j < img[cellSize * i].length; j++) img[cellSize * i][j] = lineColor;
  }

  for(var i = 0; i < img.length; i++) {
    for(var j = 0; cellSize * j < img[i].length; j++) img[i][cellSize * j] = lineColor;
  }

  CanvasController.drawImg(img);
},

  /**
   * 
   * @param {*} img Matriz de pixeles de todo el canvas
   * @param {*} x Posicion x en la matriz
   * @param {*} y Posicion y en la matriz
   * 
   * Retorna la matriz de pixeles que se encuetra en la posicion especificada
   */
  getImgOfCell: (img, x, y)=>{
    var exit = [];
    for(var i = 0; i < cellSize; i++) {
      var tmp = [];
      for(var j = 0; j < cellSize; j++) {
        if(img[x*cellSize + i] && img[x*cellSize + i][y*cellSize + j]) tmp.push(img[x*cellSize + i][y*cellSize + j]);
        else tmp.push({r: 0, g: 0, b: 0, t: 0});
      }
      
      exit.push(tmp)
    }
    return exit;
  },



  /**
   * 
   * @param {*} x posicion x de la celda 
   * @param {*} y posicion y de la celda
   * 
   * Imprime bajo el canvas una celda especifica
   */
  printCell: (x, y)=>{
    CanvasController.drawImg(CanvasController.getImgOfCell(CanvasController.getImage(), x, y))
  },

  /**
   * 
   * @param {*} p1 Pixel 1
   * @param {*} p2 Pixel 2
   * @param {*} delta maxima cantidad de cambio entre 2 pixeles
   * 
   * Verifica que la duferencia entre las propiedades r, g, b, y t de cada pixel 
   * no sea mayor que delta. usar delta = 0 para comparar valores exactos 
   * 
   */
  equalPixels: (p1, p2, delta)=>{
    delta = delta || 0;

    return Math.abs(p1.r - p2.r) <= delta && 
      Math.abs(p1.g - p2.g) <= delta && 
      Math.abs(p1.b - p2.b) <= delta && 
      Math.abs(p1.t - p2.t) <= delta;
  },

  DrawMatrix: (matrix) => {


    var imgMatrix = [];
    for(var i = 0; i < matrix.length * cellSize; i++){
      var tmp = [];
      for(var j = 0; j < matrix[0].length * cellSize; j++) tmp.push({r: 0, g: 0, b: 0, t: 255});
      imgMatrix.push(tmp);
    }
  
    for(var i = 0; i < matrix.length; i++) {
      var tmp = [];
      for(var j = 0; j < matrix[i].length; j++){
        var toPush;
        switch(matrix[i][j]){
          case TYPES.CAR: toPush = {r: 255, g: 0, b: 0, t: 255}; break;
          case TYPES.HOUSE: toPush = {r: 255, g: 255, b: 0, t: 255}; break;
          case TYPES.OWL: toPush = {r: 0, g: 255, b: 255, t: 255}; break;
          case TYPES.STREET: toPush = {r: 255, g: 0, b: 255, t: 255}; break;
          default: toPush = {r: 0, g: 0, b: 0, t: 255};
        }
  
        for(var k = 0; k < cellSize; k++) for(var l = 0; l < cellSize; l++) {
          imgMatrix[cellSize * i + k][cellSize * j + l] = toPush;
        }
      }
    }
    
    CanvasController.drawImg(imgMatrix);
  }

}

var MyAgent = {
  /**
   * 
   * @param {*} img Fragmento de imagen de la matriz
   * @param {*} x posicion x del fragmento en la matriz
   * @param {*} y posicion y del fragmento en la matriz
   * 
   * la funcion retorna TRUE si es del elemento dicho o false en otro caso
   */

  StreetColor: {
    r: 102,
    g: 102,
    b: 102,
    t: 255,
  },

  CarColor: {
    r: 136,
    g: 1,
    b: 46,
    t: 255,
  },

  OwlColor: {
    r: 54,
    g: 74,
    b: 81,
    t: 255,
  },

  
  OwlColor2: {
    r: 52,
    g: 58,
    b: 60,
    t: 255,
  },

  HouseColor1: {
    r: 220,
    g: 190,
    b: 0,
    t: 255,
  },

  HouseColor2: {
    r: 102,
    g: 0,
    b: 0,
    t: 255,
  },

  HouseColor3: {
    r: 237,
    g: 248,
    b: 1,
    t: 255,
  },

  HouseColor4: {
    r: 108,
    g: 175,
    b: 17,
    t: 255,
  },

  isStreet: (cell, x, y) => {
    var bool = true;
    var temp = true;

    for(var i = 0; i < cell.length; i++){
      for(var j = 0; j < cell[i].length; j++){
        if(MyAgent.canvasController.equalPixels(cell[i][j], MyAgent.StreetColor, 15)){
          temp = true;
        }else{
          temp = false;
        }
        bool = bool && temp;
      }
    }
    return bool
  },

  isCar: (cell, x, y) => {
    var bool = false;

    for(var i = 0; i < cell.length; i++){
      for(var j = 0; j < cell[i].length; j++){
        if(MyAgent.canvasController.equalPixels(cell[i][j], MyAgent.CarColor, 0)){
          bool = true;
        }
      }
    }
    return bool
  }, 

  isHouse: (cell, x, y) => {
    var bool = false;

    for(var i = 0; i < cell.length; i++){
      for(var j = 0; j < cell[i].length; j++){
        if(MyAgent.canvasController.equalPixels(cell[i][j], MyAgent.HouseColor1, 25) || MyAgent.canvasController.equalPixels(cell[i][j], MyAgent.HouseColor2, 0) || MyAgent.canvasController.equalPixels(cell[i][j], MyAgent.HouseColor3, 0) || MyAgent.canvasController.equalPixels(cell[i][j], MyAgent.HouseColor4, 10)){
          bool = true;
        }
      }
    }
    return bool
  },

  isOwl: (cell, x, y) => {
    var bool = false;

    for(var i = 0; i < cell.length; i++){
      for(var j = 0; j < cell[i].length; j++){
        if(MyAgent.canvasController.equalPixels(cell[i][j], MyAgent.OwlColor, 15) || MyAgent.canvasController.equalPixels(cell[i][j], MyAgent.OwlColor, 15)){
          bool = true;
        }
      }
    }
    return bool
  },

  /**
   * Retorna una matriz odonde cada celda tiene un tipo especificado en el objeto de TYPES
   */
  getMatrix: ()=>{
    canvasRect = canvas.getBoundingClientRect();

    var matrix = [];
    for(var i = 0; i < MyAgent.pixelMatrix.length/cellSize; i++) {
      var tmp = []
      for(var j = 0; j < MyAgent.pixelMatrix[i * cellSize].length/cellSize; j++) {
        var subImg = MyAgent.canvasController.getImgOfCell(MyAgent.pixelMatrix, i, j);
        
        if(MyAgent.isCar(subImg, j, i)) tmp.push(TYPES.CAR);
        else if(MyAgent.isHouse(subImg, j, i)) tmp.push(TYPES.HOUSE);
        else if(MyAgent.isOwl(subImg, j, i)) tmp.push(TYPES.OWL);
        else if(MyAgent.isStreet(subImg, j, i)) tmp.push(TYPES.STREET);
        else tmp.push(TYPES.OTHER);
      }
      matrix.push(tmp);
    }

    return matrix;

  },

  canvasController: CanvasController,
  pixelMatrix: null,
  matrix: null,
  debug: false,

  gameState: 'Begin',
  
  iniciar: async () => {
    await MyAgent.canvasController.click(playVector);
    gameState = 'Level 1';
    // Wait 200 ms
    await new Promise((resolve) => setTimeout(() => resolve(), 200)).then();
  },

  sensar: async ()=>{
    switch(gameState){
      case 'Begin': return;
      case 'Level 1': 
        MyAgent.pixelMatrix = MyAgent.canvasController.getImage();
        MyAgent.matrix = MyAgent.getMatrix();
        break;
    }
  },

  pensar: async()=>{
    
  },

  actuar: async()=>{
    MyAgent.canvasController.DrawMatrix(MyAgent.matrix);
  },

  main: async ()=>{

    await MyAgent.iniciar();

    await MyAgent.sensar();
    await MyAgent.pensar();
    await MyAgent.actuar();
  },
}

MyAgent.main();