var imageRepository = new function () {
	//define images use object contructor image
	this.empty = null;
	this.background = new Image();

	//set images src
	this.background.src = "imgs/bg.png"
}


// Create Drawable object wich will be base class 4 all drawable objects throught game. 
// set up default vars and fx that all child objects will inherit

function Drawable() {
	this.init = function (x, y) {
		//default var
		this.x = x;
		this.y = y;
	}
	this.speed= 0;
	this.canvasWidth = 0;
	this.canvasHeight = 0;

	// define abstract fx to be implemented in child objects
	this.draw = function() {

	};
}


// Background objec will become child of Drawable. background is drawn on bacgorund canvas
// creates illusion  of moving by pannin imgs

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

//Set Background to inherit properties from Drawable 
Background.prototype = new Drawable();

// Game obj will hold all obj and data for game
function Game () {
// Gets canvas info and context and sets up all game obj
// returns tru if the vancas is supported and False otherwise
//this is to stop animation script from running on older browsers

this.init = function () {
	//get canvas element
	this.bgCanvas = document.getElementById("background");
	//test if canvas is supported
	if (this.bgCanvas.getContext) {
		this.bgContext = this.bgCanvas.getContext('2d');
		// init objects to contain their context and canvas info
		Background.prototype.context = this.bgContext;
		Background.prototype.canvasWidth = this.bgCanvas.width;
		Background.prototype.canvasHeight = this.bgCanvas.height;
		//init backgroudn obj

		this.background = new Background();
		this.background.init(0,0);
		return true;
		}
		else {
			return false;
		}
	};
	// start animation loop
	this.start = function () {
		animate();
	};
}

// animation loop. calls the requestAnimeFrame shim to optimize game loop and draws all
// game obj. this fx must be a globale fx and cannot be within object
function animate () {
	requestAnimFrame( animate );
	game.background.draw();
}

// requestanim shim layer finds first api taht works to optimize animation loop,
// otherwise defautls to setTimeout();

window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame   ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			window.oRequestAnimationFrame      ||
			window.msRequestAnimationFrame     ||
			function(/* function */ callback, /* DOMElement */ element){
				window.setTimeout(callback, 1000 / 60);
			};
})();

var game = new Game ();

function init() {
	if(game.init()) 
	game.start();
}