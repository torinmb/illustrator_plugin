// Create a raster item using the image tag with id='mona'
var values = {
	sampleSize: 4,
	channel: 'RGB',
	invert: false,
	crossHatchSize: 3,
	rasterize: 'Rasterize',
	sensitivity: 0.1
};

var raster = new Raster('isaac');

// Hide the raster:
raster.visible = false;

// As the web is asynchronous, we need to wait for the raster to load
// before we can perform any operation on its pixels.
raster.on('load', function() {
	var size = values.sampleSize;
	var sampleSize = new Size(size, size);
	var rasterWidth = raster.bounds.width;
	var rasterHeight = raster.bounds.height;
	var offset = raster.bounds.topLeft;
	var columns = Math.round(rasterWidth / size);
	var rows = Math.round(rasterHeight / size);

	for(var y = 0; y < rows; y++){
		for(var x = 1; x < columns-1; x++){
			

			var topLeft = offset + new Point(x, y) * sampleSize;
			var nextTopLeft = offset + new Point(x+1, y) * sampleSize;
			var rectangle = new Rectangle(topLeft, sampleSize);
			var col = raster.getAverageColor(rectangle);

			var nextRectangle = new Rectangle(nextTopLeft, sampleSize);
			var col2 = raster.getAverageColor(nextRectangle);
			
			var diff = Math.pow(Math.pow(col.red - col2.red, 2) + Math.pow(col.green - col2.green, 2) + Math.pow(col.blue - col2.blue, 2), 1/3.0);
			var color = raster.getAverageColor(rectangle);
			if((diff < values.sensitivity)) {
				color = raster.getAverageColor(rectangle);
				
			} else {
				
				color = raster.getAverageColor(nextRectangle);
			}
			crossHatch(x, y, sampleSize, color, values.channel, values.invert, values.crossHatchSize, diff);
			
		}
	}
	// Move the active layer to the center of the view, so all 
	// the created paths in it appear centered.
	project.activeLayer.position = view.center;
});

function crossHatch(x, y, size, color, channel, inverted, strokeSize, diff) {
	var r = (channel == 'Red') ? color.red : 0;
	var g = (channel == 'Green') ? color.green : 0;
	var b = (channel == 'Blue') ? color.blue : 0;

	if(inverted) {
		color.red = 1 - color.red;
		color.green = 1 - color.green;
		color.blue = 1 - color.blue;
	}
	var pixel = new Path([
			new Point(x + 0.5, y) * size,
			new Point(x + 0.5, y + 1) * size
		]);
	pixel.strokeWidth =  size.width / strokeSize;
	pixel.strokeColor = color;
	pixel.fillColor = color;
	if((diff > values.sensitivity)) {
		pixel.rotate(Math.round(diff * 180));
	} else {
		pixel.rotate(Math.round(Math.random() * 4) * 90);
	}
}