// Please note: dragging and dropping images only works for
// certain browsers when serving this script online:
var path, position, max;
var count = 0;
var start = false;
var image = "cool-bg.jpg",
	gridSize = 10, 
	spacing = 1,
	iterations = 0,
	winHeight = window.innerHeight,
	winWidth  = window.innerWidth;

var raster = new Raster({
	source: image,
	position: view.center
});


/**
 * Helper function that returns a random number between the two supplied
 * numbers. 
 */
function rando(min, max) {
  return Math.random() * (max - min) + min;
}


// As the web is asynchronous, we need to wait for the raster to
// load before we can perform any operation on its pixels.
raster.on('load', function() {
	raster.size = new Size(winWidth/gridSize, winHeight/gridSize);
	var width  = raster.width,
		height = raster.height;

	// console.log(height);
	// console.log(width);


	for (var i=0; i<height; i++) {
		for (var j=0; j<width; j++) {
			var color = raster.getPixel(j, i);

			var path = new Path.Circle({
				center: new Point(j, i) * gridSize,
				radius: gridSize / 2 / spacing
			});

			path.fillColor = color;
		}
	}

	raster.remove();
	// console.log(raster.getAverageColor(new Point(100, 100)));
	// console.log(width);
});


function onMouseDown(event) {
	start = true;
	

}

// function onMouseMove(event) {
// 	// var color = raster.getAverageColor(event.point);
// 	raster.setPixel(event.point, "#ff0000");
// }

function onFrame(event) {
	if (start) {
		var numChildren = project.activeLayer.children.length;
		if (iterations < 10) {
			for (var i=0; i<numChildren; i++) {
				project.activeLayer.children[i].position.y += rando(10, 30);
			}
		} else {
			start = false;
		}
	}
}

// function growSpiral() {
// 	count++;
// 	var vector = new Point({
// 		angle: count * 5,
// 		length: count / 100
// 	});
// 	var rot = vector.rotate(90);
// 	var color = raster.getAverageColor(position + vector / 2);
// 	var value = color ? (1 - color.gray) * 3.7 : 0;
// 	rot.length = Math.max(value, 0.2);
// 	path.add(position + vector - rot);
// 	path.insert(0, position + vector + rot);
// 	position += vector;
// }

// function resetSpiral() {
// 	grow = true;

// 	// Transform the raster, so it fills the view:
// 	raster.fitBounds(view.bounds);

// 	if (path)
// 		path.remove();

// 	count = 0;
// 	path = new Path({
// 		fillColor: 'black',
// 		closed: true
// 	});

// 	console.log("view bounds", view.bounds);
// 	console.log("raster bounds", raster.bounds);
// 	console.log("raster bounds width", raster.bounds.width);
// 	console.log("raster bounds height", raster.bounds.height);

// 	position = view.center;
// 	max = Math.min(raster.bounds.width, raster.bounds.height) * 0.5;
// }


// function onKeyDown(event) {
// 	if (event.key == 'space') {
// 		path.selected = !path.selected;
// 	}
// }
