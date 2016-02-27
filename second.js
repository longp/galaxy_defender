var game = new Game();
function init() {
	if(game.init()) {
			game.start()
	}
}

function Drawable() {
	this.init = function (x, y, width, height) {
		//default vars
		this.x = x;
		this.y = y;
		this.width = width;
		this. height = height;
	}
	this.speed = 0;
	this.canvasWidth = 0;
	this.canvasHeight = 0;

	//define abstract fx to be implemented in child obj
	this.draw = function () {};
	this.move = function () {};
}

var imageRepository = new function () {
	//define imgs
	this.background = new Image();
	this.spaceship = new Image();
	this.bullet = new Image();
	//ensure all imgs have loaded before starting game
	var numImages = 3;
	var numLoaded =0;
	function imageLoaded() {
		numLoaded++;
		if (numLoaded === numImages) {
			window.init();
		}
	}
	this.background.onload = function () {
		imageLoaded();
	}
	this.spaceship.onload = function () {
		imageLoaded();
	}
	this.bullet.onload = function () {
		imageLoaded();
	}

	//setting imgs src
	this.background.src= "imgs/bg.png"
	this.spaceship.src= "imgs/ship.png"
	this.bullet.src = "imgs/bullet.png"
}


function Background() {
	this.speed =1;
	// implement abstract fx
	this.draw = function () {
	this.y += this.speed;
	this.context.drawImage(imageRepository.background, this.x, this.y);
	// draw another img at the top edge of first img
	this.context.drawImage(imageRepository.background, this.x, this.y-this.canvasHeight);

	//if the img is scrolled off screen reset it
	if(this.y >= this.canvasHeight) 
		this.y = 0;
	};
}
Background.prototype = new Drawable ();

// custom pool obj. holds bullet obj to be managed to prevent garbage collection

function Pool(maxSize) {
	var size = maxSize //max bullets allowed in pool
	var pool = [];
	//populats pool array with bullet obj
	this.init = function () {
		for (var i=0; i< size; i++) {
			//init the bullet obj
			var bullet = new Bullet();
			bullet.init(0,0, imageRepository.bullet.width, imageRepository.bullet.height);
			pool[i]=bullet;
		}
	};
	//grabs last item in list and inits it and pushes it to fornt of array
	this.get = function (x, y, speed) {
		if(!pool[size-1].alive) {
			pool[size-1].spawn(x, y, speed);
			pool.unshift(pool.pop());
		}
	};
	//used for ship to be able to get 2 bullets at once if only the get() fx is used twice,
	// ship is able to fire and only ahve 1 bullet spawn insted of two

	this.getTwo = function (x1, y1, speed1, x2, y2, speed2) {
		if(!pool[size-1].alive && !pool[size-2].alive) {
			this.get(x1, y1, speed1);
			this.get(x2, y2, speed2);
		}
	};
	//draws any in use bullets. if a bullet goes off screen,
	// clears it and pushes it to front of arrray
	this.animate = function () {
		for (var i=0; i<size; i++) {
			//only draw until we find a bullet taht is not allive
			if (pool[i].alive) {
				if (pool[i].draw()) {
					pool[i].clear();
					pool.push((pool.splice(i,1))[0]);
				}
			}
			else 
				break;
		}
	};
}
// Create Bullet obj wich ship fires. the bullets are drwan on main canvas

function Bullet () {
	this.alive = false; // is true if bullet is currently in use
	// sets bullet values

	this.spawn = function (x, y , speed) {
		this.x = x;
		this.y = y;
		this.speed = speed;
		this.alive = true;
	};
	// use dirty rectangle to erase bullet and moves it. returns true if bullet moved off screen
	// indicating the bullet is ready to be cleared by pool, otherwise draws bullet
	this.draw = function () {
		this.context.clearRect(this.x, this.y, this.width, this.height);
		this.y -= this.speed;
		if (this.y <= 0 - this.height) {
			return true;
		}
		else {
			this.context.drawImage(imageRepository.bullet, this.x, this.y);
		}
	};
	// resets the bullet values
	this.clear = function () {
		this.x = 0;
		this.y = 0;
		this.speed = 0;
		this.alive =false;
	};
}
Bullet.prototype = new Drawable ();


// Create ship obj that the palyer controls. the ship is drawn on ship canvas
// and uses dirty rectangles to move aroudn screen

function Ship() {
	this.speed = 3;
	this.bulletPool = new Pool(30);
	this.bulletPool.init();
	var fireRate = 15;
	var counter =0;
	this.draw = function () {
		this.context.drawImage(imageRepository.spaceship, this.x, this.y);
	};
	this.move = function () {
		counter++;
		//Determine if the actions is move action
		if  (KEY_STATUS.left || KEY_STATUS.right || KEY_STATUS.down || KEY_STATUS.up) {
			//the ship moved, so erase its current image so it can be redrawn in its new location
			this.context.clearRect(this.x, this.y, this.width, this.height);
			//update x and y according to direction to move and redraw ship.
			// change the else if to if statems to have diag movement.
			if (KEY_STATUS.left) {
				this.x -= this.speed
				if (this.x <= 0) //keep player within screen
					this.x = 0;
			} else if (KEY_STATUS.right) {
				this.x += this.speed
				if (this.x >= this.canvasWidth - this.width) {
					this.x =this.canvasWidth - this.width;
				}
			}else if (KEY_STATUS.up) {
				this.y -= this.speed
				if (this.y <= this.canvasHeight/4*3) {
					this.y =this.canvasHeight/4*3;
				}
			}else if (KEY_STATUS.down) {
				this.y += this.speed
				if (this.y >=this.canvasHeight - this.height) {
					this.y= this.canvasHeight - this.height;
				}
			}
			//redraw ship
			this.draw();
		}
		if (KEY_STATUS.space && counter >= fireRate) {
			this.fire();
			counter = 0;
		}
	};
	//fire two bullets
	this.fire = function () {
		this.bulletPool.getTwo(this.x+6, this.y, 3,
													 this.x+33, this.y, 3);
	};
}
Ship.prototype = new Drawable();

//keycodes will be mappeed when a suer presses a button
KEY_CODES = {
  32: 'space',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
}
// creates array to hold KEY_CODES and sets all their values to false
// checking true/false is the queickest way to check status of key press and wich once
//was pressd when determining when to move and wich direciton

KEY_STATUS = {};
for (code in KEY_CODES) {
	KEY_STATUS[ KEY_CODES[ code ]] =false;
}

// sets up document to listen to onkeydown events fired when any key on 
// keyboard is pressed down. when a key is pressed, it sets the appropriate direciton to true
// to let us know wich key it was

document.onkeydown = function (e) {
//firefox adnopera use charCode insead of keyCode
var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
if (KEY_CODES[keyCode]) {
	e.preventDefault();
	KEY_STATUS[KEY_CODES[keyCode]] = true;
	}
}

// sets up document to lsiten to ownkeyup evnets (fired when any key on keyboard is released)
// when a key is realeased it sets the appropriate direction to false to let us know wich key it was

document.onkeyup = function(e) {
  var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
  if (KEY_CODES[keyCode]) {
    e.preventDefault();
    KEY_STATUS[KEY_CODES[keyCode]] = false;
  }
}

// create game obj wich will hold all obj and data

function Game() {
	this.init =  function () {
		this.bgCanvas = document.getElementById("background");
		this.shipCanvas = document.getElementById('ship');
		this.mainCanvas = document.getElementById('main');
		
		if (this.bgCanvas.getContext) {
			this.bgContext = this.bgCanvas.getContext('2d');
			this.shipContext =this.shipCanvas.getContext('2d');
			this.mainContext = this.mainCanvas.getContext('2d');

			Background.prototype.context = this.bgContext;
			Background.prototype.canvasWidth = this.bgCanvas.width;
			Background.prototype.canvasHeight = this.bgCanvas.height;

			Ship.prototype.context = this.shipContext;
			Ship.prototype.canvasWidth = this.shipCanvas.width;
			Ship.prototype.canvasHeight = this.shipCanvas.height;

			Bullet.prototype.context = this.mainContext;
			Bullet.prototype.canvasWidth = this.mainCanvas.width;
			Bullet.prototype.canvasHeight = this.mainCanvas.height;
			//init background objs
			this.background = new Background();
			this.background.init(0,0);
			//sets draw point to 0,0
			//init the ship obj
			this.ship = new Ship();
			var shipStartX = this.shipCanvas.width/2 - imageRepository.spaceship.width;
			var shipStartY = this.shipCanvas.height/4*3 + imageRepository.spaceship.height*2;
			this.ship.init(shipStartX, shipStartY, imageRepository.spaceship.width, imageRepository.spaceship.height);

			return true;
		} else {
			return false;
		}
	};
	this.start = function () {
		this.ship.draw();
		animate();
	};
}

function animate () {
	requestAnimFrame( animate );
	game.background.draw();
	game.ship.move();
	game.ship.bulletPool.animate();
}

window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       || 
			window.webkitRequestAnimationFrame || 
			window.mozRequestAnimationFrame    || 
			window.oRequestAnimationFrame      || 
			window.msRequestAnimationFrame     || 
			function(/* function */ callback, /* DOMElement */ element){
				window.setTimeout(callback, 1000 / 60);
			};
})();