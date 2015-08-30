//Background 
var gameOptions = {
  height: 450,
  width: 700
}

var axes = {
  x: d3.scale.linear().domain([0,100]).range([0,gameOptions.width]),
  y: d3.scale.linear().domain([0,100]).range([0,gameOptions.height])
};

var randomize = function() {
  return Math.random() * 100;
}

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

d3.select(".container").append("svg:svg")
  .attr("class", "gameBackDrop")
  .attr("width", gameOptions.width)
  .attr("height", gameOptions.height);

var gameBoard = d3.select(".gameBackDrop")

var drag = d3.behavior.drag()
            .origin(function(d) { return d;})
            .on('dragstart', dragstarted)
            .on('drag', dragged);

function dragstarted(d) {
  d3.event.sourceEvent.stopPropagation();
}

function dragged(d) {
  d3.select(this).attr('cx', function(d) {
    if (d3.event.x<0) {
      d.x = 0;
    } else if (d3.event.x>gameOptions.width) {
      d.x = gameOptions.width;
    } else {
      d.x = d3.event.x
    }
    return d.x;
  }).attr('cy',function(d) {
    if (d3.event.y<0) {
      d.y = 0;
    } else if (d3.event.y>gameOptions.height) {
      d.y = gameOptions.height;
    } else {
      d.y = d3.event.y
    }
    return d.y;
  });
}


var colliding = false;
var checkCollision = function(enemyD3) {
  var helper = (enemyD3.attr('class')==='helper');
  // use the D3 object to get the current position at tween call moment
  var enemyX = enemyD3.attr('cx');
  var enemyY = enemyD3.attr('cy');
  // pythogorean distance between centers
  var dx = hero.x - enemyX;
  var dy = hero.y - enemyY;
  var dist = Math.sqrt(dx*dx+dy*dy);
  // hero.size*2 works as long as objects are the same size
  // could use hero.size+enemyD3.attr('r');
  if (!helper && dist < (hero.size + parseInt(enemyD3.attr('r'))) && !colliding) {
    colliding = true;
    gameBoard.select('.chaser').remove();
    gameBoard.select('.helper').remove();
    var high = d3.select('.high').select('span');
    var current = d3.select('.current').select('span');
    var collisions = d3.select('.collisions').select('span');
    collisions.text(parseInt(collisions.text())+1);
    if (parseInt(high.text()) < parseInt(current.text())) {
      high.text(parseInt(current.text()));
    }
    current.text(0);
    d3.select(".gameBackDrop").style("background-color", "red")
    setTimeout( function() {
      colliding = false;
      d3.select(".gameBackDrop").style("background-color", "#94B8FF")
    }, 300);
  }
  if (helper && dist < (hero.size + parseInt(enemyD3.attr('r')))) {
    gameBoard.select('.helper').remove();
    gameBoard.select('.chaser').remove();
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
    .attr('class',function(d) {
      if (d.type==='hero') d3.select(this).call(drag);
      return d.type;
    })
    .attr('r', hero.size);

function update() {
  var current = d3.select('.current').select('span');
  current.text(parseInt(current.text())+1);

  if (parseInt(current.text())%5===0) {
    gameBoard.selectAll('svg')
      .data([new Unit(randomize(),randomize(),'chaser')])
      .enter()
      .append('circle')
      .attr('cx',function(d){ return d.x;})
      .attr('cy',function(d){ return d.y;})
      .attr('class',function(d){ return d.type; })
      .attr('r', function(d){ return d.size; });
  }

  if (parseInt(current.text())%10===0) {
    gameBoard.selectAll('svg')
      .data([new Unit(randomize(),randomize(),'helper')])
      .enter()
      .append('circle')
      .attr('cx',function(d){ return d.x})
      .attr('cy',function(d){ return d.y})
      .attr('class',function(d){ return d.type; })
      .attr('r', function(d){ return d.size*2; });
  }

  gameBoard.selectAll('.enemy')
 //   .data(enemyArray)
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
        // to effectively check collisions we have to check a snapshot,
        // so we manually move the enemy object after the collision check
        enemyD3.attr('cx', oldX+(enemy.x - oldX)*t)
              .attr('cy',oldY+(enemy.y - oldY)*t);
      };
    });

  gameBoard.selectAll('.chaser')
    .transition()
    .duration(1500)
    .tween('chase',function(chaser) {
      var oldX = chaser.x;
      var oldY = chaser.y;
      chaser.x = hero.x;
      chaser.y = hero.y;
      var chaserD3 = d3.select(this);
      return function(t) {
        checkCollision(chaserD3);
        chaserD3.attr('cx', oldX+(chaser.x-oldX)*t)
          .attr('cy',oldY+(chaser.y-oldY)*t)
          .attr('r', function(d) {
            return d.size = d.size * 1.0025;
          })
      };
    });

    gameBoard.selectAll('.helper')
      .transition()
      .duration(1500)
      .tween('helper',function(helper) {
        var helperD3 = d3.select(this);
        return function() { checkCollision(helperD3); };
      });
}

setInterval(update,1500);
