var maze = [
    // "XXXXXXXXXXXXXXXXXXXXXXXXXXX",
    // "XX          XXXXXXXXXXXXXXX",
    // "XX   C                  XXX",
    // "XXXXXXXX    XXXXXXXXXX XXXX",
    // "XXX         XXXXXXXXXXXXXXX",
    // "XXXXXXXXX             F   X",
    // "XXXXXXXXXX  XXXXXXXXXXXXXXX",
    // "XXXXXXXXXX  XXXXXXXXXXXXXXX",
    // "XXXXXXXXXXXXXXXXXXXXXXXXXXX",

    // "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    // "X                                  X",
    // "X                                  X",
    // "X                                  X",
    // "X   C                  XXXXXXXXXXXXX",
    // "X                      XF          X",
    // "X                      X           X",
    // "X                      X           X",
    // "X                      XXXXXXXXXX  X",
    // "X                                  X",
    // "X                                  X",
    // "X                                  X",
    // "X                                  X",
    // "X                                  X",
    // "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",

    "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "X  C   XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "XXXX     XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "XXXXX      XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "XXXXXXX                            XXXXXXXXXXXXXXXX",
    "XXXXXXX   XXXXXXXXXXXXX       XXX  XXXXXXXXXXXXXXXX",
    "XXXXXXX   XXXXXXXXXXXXX       XXX   XXXXXXXXXXXXXXX",
    "XXXXXX    XXXXXXXXX      XXXXXXXX   XXXXXXXXXXXXXXX",
    "XXXXXXX   XX       XXXXXXXXXXXXXX   XXXXXXXXXXXXXXX",
    "XXXXXXXX     XXXXXXXXF              XXXXXXXXXXXXXXX",
    "XXXXXXXXX   XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
]


//var movements = [[-1, 0], [0, -1], [1, 0], [0, 1]]

/*
LEFT -> 0
UP -> 1
RIGHT -> 2
DOWN -> 3
*/

function FindStart(maze) {

    var start = [0, 0]

    for(i = 0; i < maze.length; i++){
        for(j = 0; j < maze[0].length; j++){
            if(maze[i][j] == "C"){
                start[0] = j
                start[1] = i
            }
        }
    }

    return start
}

function FindEnd(maze) {

    var end = [maze.length, maze[0].length]

    for(i = 0; i < maze.length; i++){
        for(j = 0; j < maze[0].length; j++){
            if(maze[i][j] == "F"){
                end[0] = j
                end[1] = i
            }
        }
    }

    return end
}

function PossibleMoves(maze, pos){

    var movements = [[-1, 0], [0, -1], [1, 0], [0, 1]]
    var possible = []

    for(var k in movements){

        var newx = pos[1]+movements[k][1]
        var newy = pos[0]+movements[k][0]

        if(newx < 0 || newx >= maze.length || newy < 0 || newy >= maze[newx].length) continue

        if(maze[newx][newy] == " " || maze[newx][newy] == "F"){
          possible.push([newy, newx])
        }
    } 

    return possible
}

function PriorityMoves(start, end){
    var priority = []

    if(start[0] < end[0]){
        priority.push(2)
    }else{
        priority.push(0)
    }

    if(start[1] < end[1]){
        priority.push(3)
    }else{
        priority.push(1)
    }

    return priority
}

function addPriority(list, prio, data, father, dist){
  
  if(list == null || prio <= list.prio) return {
    prio: prio, 
    data: data,
    next: list,
    father: father,
    dist: dist,
  }

  var current = list;
  while(current.next && current.next.prio < prio) current = current.next;
  var tmp = current.next;
  current.next = {
    prio: prio, 
    data: data,
    next: tmp,
    father: father,
    dist: dist,
  }

  return list;
}

function distance(p1, p2){
  return Math.abs(p1[0] - p2[0]) + Math.abs(p1[1] - p2[1])
}

function printPrioQueue(list){
  var current = list
  var arr = []
  while(current){
    arr.push(current)
    current = current.next;
  }
  console.log(arr);

  return arr;
}

function FindPath(maze){
    var start = FindStart(maze)
    var end = FindEnd(maze)
    
    var prioQueue = {
      prio: distance(start, end),
      data: start,
      next: null,
      father: null,
      dist: 0,
    }

    var next;

    var used = [start];

    while(prioQueue){
      next = prioQueue;
      prioQueue = prioQueue.next;

      if(maze[next.data[1]][next.data[0]] == "F") break;

      var possibles = PossibleMoves(maze, next.data)
      
      for (const pos of possibles) {
        if(!used.find((el) => el[0] == pos[0] && el[1] == pos[1])){
          prioQueue = addPriority(prioQueue, next.dist + 1 + distance(pos, end), pos, next, next.dist + 1);
          used.push(pos)
        }
      }

      
    }

    console.log("Finished");

    var mtrx = [];
    for (const mazeEl of maze) {
      tmp = []
      for (const ch of mazeEl) {
        tmp.push(ch)
      }
      mtrx.push(tmp)
    }


    var cLoc = next;
    while(cLoc){
      mtrx[cLoc.data[1]][cLoc.data[0]] = "."
      cLoc = cLoc.father
    }

    console.log("Elemento final:");
    console.log(next);

    for (const el of mtrx) {
      console.log(el.join(""));
    }
    
}

FindPath(maze)
