// module aliases
var Engine = Matter.Engine,
Render = Matter.Render,
World = Matter.World,
Composite = Matter.Composite,
Constraint = Matter.Constraint,
Bodies = Matter.Bodies,
Vector = Matter.Vector,
Body = Matter.Body;

var GAME_FPS = 60;
var PLAY = 0,
	BUILD = 1,
	CODE = 2,
	LOSE = 3;

class Game {
	static init() {
		//initialize rendering
		Display.init();
		Builder.init();
		Editor.init();
		Builder.hide();

		Game.wallRadius = 500;

		//create physics engine
		Game.engine = Engine.create();

		Game.reset();

		//start game loop
		var t0 = Date.now();
		requestAnimationFrame(function gameLoop(){
			var delta = (Date.now() - t0);
			if (delta > 1000)
				return;
			Game.update(delta/(1000/GAME_FPS));
			t0 = Date.now();
			requestAnimationFrame(gameLoop);
		});
	}

	static reset() {
		Game.state = PLAY;
		Game.rocket = null;

		World.clear(Game.engine.world);

		Game.black = 0x000000;
		//create physics bodies here
		var ground = Bodies.rectangle(0, 30, 1500, 200, { isStatic: true });
		// Game.leftWall = Bodies.rectangle(-500, 0, 40, 1000, { isStatic: true });
		// Game.rightWall = Bodies.rectangle(500, 0, 40, 1000, { isStatic: true });
		var staticBodyArray = [ground];
		staticBodyArray.forEach(function(body){
			body.color = Game.black;
		});

	    //obstacles
	    Game.obstacles = [];

		//add physics bodies to world
		World.add(Game.engine.world, staticBodyArray);
	}

	static altitude() {
		if (Game.rocket instanceof Rocket)
			return -Game.rocket.mainBody.position.y*0.1;
	}

	static updateObstacles(){
		var playerPos = Game.rocket.mainBody.position;
		Game.obstacles.forEach(function(obj) {
			if(obj.body.position.y - playerPos.y > Display.height || obj.body.position.y + playerPos.y < 5*playerPos.y){
				obj.destroy();
				Game.obstacles.splice(Game.obstacles.indexOf(obj), 1);
			}
		})
		while(Game.obstacles.length < 5){
      //between 100 and 1100
      var tempX = -500 + (Math.random()*1000);
      //between y-500 and y-1500
      var tempY = playerPos.y - 500 - (Math.random()*1000);
      //between 20 and 50
      var tempR = 20+(Math.random()*30);
      var newCircle = new Obstacle(Bodies.circle(tempX,tempY,tempR), Game.white);
      Body.setDensity(newCircle, .002); //set density to 2* default
      Game.obstacles.push(newCircle);
  }
}

	/**
	 * Loads resources and then calls callback.
	 */
	 static loadData(callback) {
	 	Util.load.json("data.json", function success(data){
	 		Object.keys(data).forEach(function(key){
	 			Game[key] = data[key];
	 		});
	 		callback(true);
	 	}, function fail(){
	 		alert("Failed to load data.");
	 		callback(false);
	 	});
	 }

	 static update(timeDelta) {
		//update rocket
		if (Game.rocket instanceof Rocket) {
			Game.rocket.update(timeDelta);
			var aabb = Game.rocket.mainBody.bounds;
			var midX = (aabb.max.x + aabb.min.x) / 2;
			var midY = (aabb.max.y + aabb.min.y) / 2;
			Display.view.x = midX - Display.width / 2;
			Display.view.y = midY - Display.height / 2;
			Game.updateObstacles();
		}
		else {
			Display.view.x = -Display.width/2;
			Display.view.y = -Display.height+50;
		}

		//step physics
		Engine.update(Game.engine);

		//draw
		Display.frame();
	}
}

function createArray(w, h, val) {
	var arr = [];

	for (var x = 0; x<w; x++)
	{
		arr[x] = [];
		for(var y = 0; y<h; y++)
		{
			arr[x][y] = val;
		}
	}
	return arr;
}

//start game when resources have loaded
window.addEventListener("load", function(){
	Game.loadData(function(){
		Game.init();
	});
}, false);
