//"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --allow-file-access-from-files

var slide_url  = image_data['patient'][0]['images']
var mask_url = image_data['mask'][0]

// bootstrap-tour tutorial
var tour = new Tour({
	smartPlacement: true,
	steps: [
		{
			element: "#patient_button",
			title: "Patient Menu",
			content: "Expand to select Patient of interest"
		},
  		{
    		element: ".upper-canvas",
    		title: "Display of Wholeslide Images",
    		content: "This section is the Wholeslide Viewer. The Images are displayed in the middle. At top left corner, there are tools to control the viewer. Toogle to the buttons to see the functions. At top right corner, there is a navigator to help you locate your current position when zooming in. If there are multiple slides associate with current patient, there will be a horizontal scrolling image Reference Strip at the bottom for you to choose different slides. You can also use the 'previous page' and 'next page' button at the end of the tools section to browse the slides sequentially."
  		},
  		{
  			element: "#drawing-mode",
  			title: "Drawing mode",
  			content: "There is a simple drawing tool for you to annotate. Further function is developing"
  		},
  		{
  			element: "#clear-canvas",
  			title: "Clear drawing",
  			placement:"left",
  			content: "Delete current drawing"
  		},
  		{
  			element: "#toggle-overlay",
  			title: "Display Prediction Mask",
  			placement:"left",
  			content: "If there is a prediction overlay associate with current slide, if you click this button, the overlay should apply to current slide. Otherwise it will display a 'no prediction mask' sign"
  		}
	]
});

App = {
	init:function(){



		// openSeadragon object;
		var viewer = new OpenSeadragon({
		    id:  "view",
		    tileSources: [slide_url],
		    prefixUrl: "static/images/",
		    sequenceMode: true,
			showReferenceStrip: true,
		    showNavigator: true,
		    showRotationControl: true,
			animationTime: 0.5,
			blendTime: 0.1,
			constrainDuringPan: true,
			maxZoomPixelRatio: 2,
			minZoomLevel: 1,
			visibilityRatio: 1,
			zoomPerScroll: 2,
		    //debugMode: true,
		    timeout: 120000,
		});


		// To improve load times, ignore the lowest-resolution Deep Zoom
		// levels.  This is a hack: we can't configure the minLevel via
		// OpenSeadragon configuration options when the viewer is created
		// from DZI XML.
		viewer.addHandler("open", function() {
			viewer.source.minLevel = 8;
		});


		viewer.scalebar({
			xOffset: 10,
			yOffset: 10,
			barThickness: 3,
			color: '#555555',
			fontColor: '#333333',
			backgroundColor: 'rgba(255, 255, 255, 0.5)',
		});


		// screenshot function;
	    // viewer will be your OpenSeaDragon viewer object;
		viewer.screenshot({
			showOptions: true, // Default is false
			keyboardShortcut: 'p', // Default is null
			showScreenshotControl: true // Default is true	
		});


		var options = {
			scale: 1000
	    }


	    //initialize selection
	    var selection = viewer.selection(options);

	    // initialize drawing overlay
	    var drawing_overlay = viewer.fabricjsOverlay(options);

	    var canvas = drawing_overlay.fabricCanvas('c',{
	    	isDrawingMode:true
	    });

	  	fabric.Object.prototype.transparentCorners = false;
	  	
	  	var drawingModeEl = $('#drawing-mode'),
	      	drawingOptionsEl = $('#drawing-mode-options'),
	      	drawingColorEl = $('#drawing-color'),
	      	drawingShadowColorEl = $('#drawing-shadow-color'),
	      	drawingLineWidthEl = $('#drawing-line-width'),
	      	drawingShadowWidth = $('#drawing-shadow-width'),
	      	drawingShadowOffset = $('#drawing-shadow-offset'),
	      	clearEl = $('#clear-canvas');

	  	clearEl.click(function() { canvas.clear() });

	  	drawingModeEl.click(function() {

	    	canvas.isDrawingMode = !canvas.isDrawingMode;
	    	if (canvas.isDrawingMode) {
	    	canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
	    	viewer.setMouseNavEnabled(false);
	    	viewer.outerTracker.setTracking(false);
	      	drawingModeEl.text('Cancel drawing mode');
	      	drawingOptionsEl.show();
	    	}
	    	else {
	    	viewer.setMouseNavEnabled(true);
	    	viewer.outerTracker.setTracking(true);
	      	drawingModeEl.text('Enter drawing mode');
	      	drawingOptionsEl.hide();

	    	}
	  	});
	                            
	  	if (fabric.PatternBrush) {
	    	var vLinePatternBrush = new fabric.PatternBrush(canvas);
	    	vLinePatternBrush.getPatternSrc = function() {

		      	var patternCanvas = fabric.document.createElement('canvas');
		      	patternCanvas.width = patternCanvas.height = 10;
		      	var ctx = patternCanvas.getContext('2d');

		      	ctx.strokeStyle = this.color;
		      	ctx.lineWidth = 5;
		      	ctx.beginPath();
		      	ctx.moveTo(0, 5);
		      	ctx.lineTo(10, 5);
		      	ctx.closePath();
		      	ctx.stroke();

		      	return patternCanvas;
	    	};

	    	var hLinePatternBrush = new fabric.PatternBrush(canvas);
	    	hLinePatternBrush.getPatternSrc = function() {

		      	var patternCanvas = fabric.document.createElement('canvas');
		      	patternCanvas.width = patternCanvas.height = 10;
		      	var ctx = patternCanvas.getContext('2d');

		      	ctx.strokeStyle = this.color;
		      	ctx.lineWidth = 5;
		      	ctx.beginPath();
		      	ctx.moveTo(5, 0);
		      	ctx.lineTo(5, 10);
		      	ctx.closePath();
		      	ctx.stroke();

		      	return patternCanvas;
	    	};

		    var squarePatternBrush = new fabric.PatternBrush(canvas);
		    squarePatternBrush.getPatternSrc = function() {

		      	var squareWidth = 10, squareDistance = 2;

		      	var patternCanvas = fabric.document.createElement('canvas');
		      	patternCanvas.width = patternCanvas.height = squareWidth + squareDistance;
		      	var ctx = patternCanvas.getContext('2d');

		      	ctx.fillStyle = this.color;
		      	ctx.fillRect(0, 0, squareWidth, squareWidth);

		      	return patternCanvas;
		    };

		    var diamondPatternBrush = new fabric.PatternBrush(canvas);
		    diamondPatternBrush.getPatternSrc = function() {

		      	var squareWidth = 10, squareDistance = 5;
		      	var patternCanvas = fabric.document.createElement('canvas');
		      	var rect = new fabric.Rect({
		        	width: squareWidth,
		        	height: squareWidth,
		        	angle: 45,
		        	fill: this.color
		      	});

		      	var canvasWidth = rect.getBoundingRect().width;

		      	patternCanvas.width = patternCanvas.height = canvasWidth + squareDistance;
		      	rect.set({ left: canvasWidth / 2, top: canvasWidth / 2 });

		      	var ctx = patternCanvas.getContext('2d');
		      	rect.render(ctx);

		      	return patternCanvas;
		    };

		    var img = new Image();
		    img.src = 'static/asset/honey_im_subtle.png';

		    var texturePatternBrush = new fabric.PatternBrush(canvas);
		    texturePatternBrush.source = img;
	  	}

	  	$('#drawing-mode-selector').change(function() {

		    if (this.value === 'hline') {
		      canvas.freeDrawingBrush = vLinePatternBrush;
		    }
		    else if (this.value === 'vline') {
		      canvas.freeDrawingBrush = hLinePatternBrush;
		    }
		    else if (this.value === 'square') {
		      canvas.freeDrawingBrush = squarePatternBrush;
		    }
		    else if (this.value === 'diamond') {
		      canvas.freeDrawingBrush = diamondPatternBrush;
		    }
		    else if (this.value === 'texture') {
		      canvas.freeDrawingBrush = texturePatternBrush;
		    }
		    else if (this.value === 'Pencil'){
		      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
		    }

		    if (canvas.freeDrawingBrush) {
		      	canvas.freeDrawingBrush.color = drawingColorEl.value;
		      	canvas.freeDrawingBrush.width = parseInt(drawingLineWidthEl.value, 10) || 1;
		      	canvas.freeDrawingBrush.shadow = new fabric.Shadow({
			        blur: parseInt(drawingShadowWidth.value, 10) || 0,
			        offsetX: 0,
			        offsetY: 0,
			        affectStroke: true,
			        color: drawingShadowColorEl.value,
		      	});
		    }
	  	});

	  	drawingColorEl.change(function() {
	    	canvas.freeDrawingBrush.color = this.value;
	  	});

	  	drawingShadowColorEl.change(function() {
	    	canvas.freeDrawingBrush.shadow.color = this.value;
	  	});

	  	drawingLineWidthEl.change(function() {
	    	canvas.freeDrawingBrush.width = parseInt(this.value, 10) || 1;
	    	this.previousSibling.innerHTML = this.value;
	  	});

	  	drawingShadowWidth.change(function() {
	    	canvas.freeDrawingBrush.shadow.blur = parseInt(this.value, 10) || 0;
	    	this.previousSibling.innerHTML = this.value;
	  	});

	  	drawingShadowOffset.change(function() {
	    	canvas.freeDrawingBrush.shadow.offsetX = parseInt(this.value, 10) || 0;
	    	canvas.freeDrawingBrush.shadow.offsetY = parseInt(this.value, 10) || 0;
	    	this.previousSibling.innerHTML = this.value;
	  	});

	  	if (canvas.freeDrawingBrush) {
	    	canvas.freeDrawingBrush.color = drawingColorEl.value;
	    	canvas.freeDrawingBrush.width = parseInt(drawingLineWidthEl.value, 10) || 1;
	    	canvas.freeDrawingBrush.shadow = new fabric.Shadow({
		      	blur: parseInt(drawingShadowWidth.value, 10) || 0,
		      	offsetX: 0,
		      	offsetY: 0,
		      	affectStroke: true,
		      	color: drawingShadowColorEl.value,
	    	});
	  	}

	  	$(window).resize(function(){
	  		drawing_overlay.resize();
	  		drawing_overlay.resizecanvas();
	  	})


		$('#toggle-overlay').click(function(){
			var current_slide;
			var slide_string = viewer.tileCache._tilesLoaded[0].tile.url.split("/")[2];
			current_slide = slide_string.substring(0,slide_string.indexOf("svs")-1);
			mask_url = "image_data/prediction_mask/prediction_dzi/" + current_slide + "_pred.dzi";


			if ($('#toggle-overlay').html()=="Display Prediction Mask") {
				if(Object.values(image_data['mask']).indexOf(mask_url) > -1){
					$('#toggle-overlay').html('Close Prediction Mask');
					$('#toggle-overlay').removeClass('uk-button-danger');
					$('#toggle-overlay').addClass('uk-button-primary');
					viewer.addTiledImage({
						tileSource: mask_url,
						x: 0,
						y: 0,
						opacity: 0.5,
						index: 1
					})
				}
				else{
					$('#toggle-overlay').html('There is no Prediction Mask');
					$('#toggle-overlay').removeClass('uk-button-danger');
					$('#toggle-overlay').addClass('uk-button-secondary');
				}							
			}else{
				viewer.world.removeItem(viewer.world.getItemAt(1));;
				$('#toggle-overlay').html('Display Prediction Mask');
				$('#toggle-overlay').removeClass('uk-button-primary');
				$('#toggle-overlay').removeClass('uk-button-secondary');
				$('#toggle-overlay').addClass('uk-button-danger');
			}


		})

		// change patient tile sources when selecting in patient menu
		function update_tileSources(){
			viewer.close();
			viewer.open(slide_url);
		}

		function createCallback( i ){
	  		return function(){
	    		$('.patient_menu li.uk-active').removeClass('uk-active');
		    	$('#patient_'+i).addClass('uk-active');
		    	slide_url = image_data['patient'][(i-1)]['images']
		    	update_tileSources();
	  		}
		}

		for(var i=1;i<=33;i++){
		    $('#patient_'+i).click(createCallback(i));
		}
	
		
	}

}



$(document).ready(function() {
	tour.init();
    App.init();
    $('#tutorial_button').click(function(){
		tour.restart();
	})

});