//Background 
var gameOptions = {
  height: 450,
  width: 700
}

var axes = {
  x: d3.scale.linear().domain([0,100]).range([0,gameOptions.width]),
  y: d3.scale.linear().domain([0,100]).range([0,gameOptions.height])
};

d3.select(".container").append("svg:svg")
  .attr("class", "gameBackDrop")
  .attr("width", gameOptions.width)
  .attr("height", gameOptions.height)

var gameBoard = d3.select(".gameBackDrop")

var Unit = function(x, y, type) {
  this.x = axes.x(x);
  this.y = axes.y(y);
  this.type = type || "enemy"; 
}
Unit.prototype.size = 12;
Unit.prototype.newPosition = function() {
  this.x = axes.x(randomize());
  this.y = axes.y(randomize());
}

var randomize = function() {
  return Math.random() * 100;
}

var checkCollision = function(enemyD3) {
  // use the D3 object to get the current position at tween call moment
  var enemyX = enemyD3.attr('cx');
  var enemyY = enemyD3.attr('cy');
  // pythogorean distance between centers
  var dx = hero.x - enemyX;
  var dy = hero.y - enemyY;
  var dist = Math.sqrt(dx*dx+dy*dy);
  // hero.size*2 works as long as objects are the same size
  // could use hero.size+enemyD3.attr('r');
  if ( dist < (hero.size * 2) ) {
    console.log('collision');
  }
};

var hero = new Unit(50,50,'hero');

var enemyArray = [];
for(var i = 0; i < 10; i++){
  enemyArray.push( new Unit(randomize(), randomize()) );
}

var startingBoard = enemyArray.slice();
startingBoard.push(hero);

gameBoard.selectAll("svg")
  .data(startingBoard)
  .enter()
    .append("circle")
    .attr('cx',function(d){ return d.x;})
    .attr('cy',function(d){return d.y;})
    .attr('fill',function(d) {
      if (d.type==='hero') {
        return '#f00';
      } else {
        return '#000';
      }
    })
    .attr('r', hero.size);

function update() {
  gameBoard.selectAll('circle')
    .data(enemyArray)
    .transition()
    .duration(1500)
    .tween('collisions',function(enemy) {
      // original positions needed for manual movement
      var oldX = enemy.x;
      var oldY = enemy.y;
      enemy.newPosition();
      // we need the d3 object to get the enemies in-transit position
      var enemyD3 = d3.select(this);
      return function(t) {
        checkCollision(enemyD3);
        // to effectively check colllsions we have to check a snapshot,
        // so we manually move the enemy object after the collision check
        enemyD3.attr('cx', oldX+(enemy.x - oldX)*t)
              .attr('cy',oldY+(enemy.y - oldY)*t);
      };
    });/*
    .attr("cx", function(d) {
      d.newPosition();
      return d.x;
    })
    .attr('cy', function(d) {
      return d.y;
    });*/
}

setInterval(update,1500);
