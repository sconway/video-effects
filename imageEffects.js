var video,
    copy,
	copycanvas,
	draw,
	explosion = false,
	mouseX = 0,
	winWidth = window.innerWidth,
	winHeight = window.innerHeight;

var TILE_WIDTH = 100; //32 don't delete this 
var TILE_HEIGHT = 60; //24 don't delete this 
var TILE_CENTER_WIDTH = 50; // 16
var TILE_CENTER_HEIGHT = 30; // 12
var SOURCERECT = {x:0, y:0, width:0, height:0};
var PAINTRECT = {x:0, y:0, width:winWidth, height:winHeight};
	

/**
 * Initializes the elements involved in the video effects. Sets up the
 * main video canvas and the canvas that the video is copied to, and
 * then copies the video information frame-by-frame.
 */
function init(){
	$(".canvas").attr({width: winWidth + "px", height: winHeight + "px"});
	video = document.getElementById('sourcevid');
	copycanvas = document.getElementById('sourcecopy');
	copy = copycanvas.getContext('2d');
	var outputcanvas = document.getElementById('output');
	draw = outputcanvas.getContext('2d');
	setInterval("processFrame()", 33);
}


/**
 * Creates tiles out of the video by grouping segments into rectangles
 * or a pre-defined size. Goes from left to right, top to bottom, adding
 * rectangles to the array of tiles.
 */
function createTiles(){
	var offsetX = 0; //TILE_CENTER_WIDTH  + (PAINTRECT.width  - SOURCERECT.width)  / 2;
	var offsetY = 0; //TILE_CENTER_HEIGHT + (PAINTRECT.height - SOURCERECT.height) / 2;

	for (var i=0; i<SOURCERECT.height; i+=TILE_HEIGHT) {
		for (var j=0; j<SOURCERECT.width; j+=TILE_WIDTH) {
			var tile = new Tile();
			tile.videoX = j;
			tile.videoY = i;
			tile.originX = offsetX + j; // starting X coordinate of the tile
			tile.originY = offsetY + i; // starting Y coordinate of the tile
			tile.currentX = tile.originX; 
			tile.currentY = tile.originY;
			tiles.push(tile);
		}
	}
}


var RAD = Math.PI/180;
var randomJump = false;
var tiles = [];
var debug = false;

function processFrame(){
	// Make sure the video exists and then
	if(!isNaN(video.duration)){
		// Sets up the boundaries and creates the tiles
		if(SOURCERECT.width == 0){
			SOURCERECT = {x:0, y:0, width:winWidth, height:winHeight};
			createTiles();
		}
		//this is to keep my sanity while developing
		// if(randomJump){
		// 	randomJump = false;
		// 	video.currentTime = Math.random()*video.duration;
		// }
		//loop
		// if(video.currentTime == video.duration){
		// 	video.currentTime = 0;
		// }
	}
	var debugStr = "";
	//copy tiles
	copy.drawImage(video, 0, 0, winWidth, winHeight);
	draw.clearRect(PAINTRECT.x, PAINTRECT.y,PAINTRECT.width,PAINTRECT.height);
	
	if (explosion) {
		processExplosion()
	}
	else {
		for(var i=0; i<tiles.length; i++){
			var tile = tiles[i];

				tile.currentY += tile.moveY;

			drawImage(tile);
		}
	}

}


/**
 * Helper function to update the position of tiles on the canvas
 * after the 'explosion' has been set.
 */
function processExplosion() {
	for(var i=0; i<tiles.length; i++){
		var tile = tiles[i];
		if(tile.force > 0.0001){
			//expand
			tile.moveX *= tile.force;
			tile.moveY *= tile.force;
			tile.moveRotation *= tile.force;
			tile.currentX += tile.moveX;
			tile.currentY += tile.moveY;
			tile.rotation += tile.moveRotation;
			tile.rotation %= 360;
			tile.force *= 0.9;
			if(tile.currentX <= 0 || tile.currentX >= PAINTRECT.width){
				tile.moveX *= -1;
			}
			if(tile.currentY <= 0 || tile.currentY >= PAINTRECT.height){
				tile.moveY *= -1;
			}
		}else if(tile.rotation != 0 || tile.currentX != tile.originX || tile.currentY != tile.originY){
			//contract
			var diffx = (tile.originX-tile.currentX)*0.2;
			var diffy = (tile.originY-tile.currentY)*0.2;
			var diffRot = (0-tile.rotation)*0.2;
			
			if(Math.abs(diffx) < 0.5){
				tile.currentX = tile.originX;
			}else{
				tile.currentX += diffx;
			}
			if(Math.abs(diffy) < 0.5){
				tile.currentY = tile.originY;
			}else{
				tile.currentY += diffy;
			}
			if(Math.abs(diffRot) < 0.5){
				tile.rotation = 0;
			}else{
				tile.rotation += diffRot;
			}
		}else{
			tile.force = 0;
			
		}

		drawImage(tile);
	}
}


/*
 * Draws each portion of the video onto to duplicate canvas. Needed
 * To map the correct portion of the video to the corresponding tile.
 */
function drawImage(tile) {
	// Save the context's state on the stack so we don't have to reverse it
	draw.save();

	// moves the drawn tile to its location, so all tiles are not
	// placed in the top left corner of the screen
	draw.translate(tile.currentX + TILE_CENTER_WIDTH, tile.currentY + TILE_CENTER_HEIGHT);
	draw.rotate(tile.rotation*RAD);
	draw.drawImage(copycanvas, tile.videoX, tile.videoY, TILE_WIDTH, TILE_HEIGHT, -TILE_CENTER_WIDTH, -TILE_CENTER_HEIGHT, TILE_WIDTH, TILE_HEIGHT);

	// Pop the old state off the stack, to bring us back to previous state
	draw.restore();
}


function explode(x, y){
	for(var i=0; i<tiles.length; i++){
		var tile = tiles[i];
		
		var xdiff = tile.currentX-x;
		var ydiff = tile.currentY-y;
		var dist = Math.sqrt(xdiff*xdiff + ydiff*ydiff);
		
		var randRange = 220+(Math.random()*30);
		var range = randRange-dist;
		var force = 3*(range/randRange);
		if(force > tile.force){
			tile.force = force;
			var radians = Math.atan2(ydiff, xdiff);
			tile.moveX = Math.cos(radians);
			tile.moveY = Math.sin(radians);
			tile.moveRotation = 0.5-Math.random();
		}
	}
	tiles.sort(zindexSort);
	processFrame();
}


function shiftTiles(x, y) {
	for(var i=0; i<tiles.length; i++){
		var tile = tiles[i];
		if ((x > tile.originX && x < tile.originX + TILE_WIDTH) &&
			(y > tile.originY && y < tile.originY + TILE_HEIGHT)) {
			console.log("hit");
			tile.moveY = 5;
		}
	}
	tiles.sort(zindexSort);
	processFrame();
}



function zindexSort(a, b){
	return (a.force-b.force);
}

function dropBomb(evt, obj){
	var posx = 0;
	var posy = 0;
	var e = evt || window.event;
	if (e.pageX || e.pageY){
		posx = e.pageX;
		posy = e.pageY;
	}else if (e.clientX || e.clientY) {
		posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}
	var canvasX = posx-obj.offsetLeft;
	var canvasY = posy-obj.offsetTop;
	// explode(canvasX, canvasY);
	// console.log("Canvas X: ", canvasX);
	// console.log("Canvas Y: ", canvasY);
	shiftTiles(canvasX, canvasY);
}

function Tile(){
	this.originX = 0;
	this.originY = 0;
	this.currentX = 0;
	this.currentY = 0;
	this.rotation = 0;
	this.force = 0;
	this.z = 0;
	this.moveX= 0;
	this.moveY= 0;
	this.moveRotation = 0;
	
	this.videoX = 0;
	this.videoY = 0;
}

init();


$("#output").on("mousedown", function(event) {
	mouseX = event.clientX;
});

$("#output").on("mouseup", function(event) {
	if (event.clientX !== mouseX) {
		explosion = true;
		explode(event.clientX, event.clientY);
	} else {
		explosion = false;
		shiftTiles(event.clientX, event.clientY);
	}
});



