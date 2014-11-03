/* jslint node: true, browser: true, sloppy: false */
/* global define: true, requestAnimationFrame: true, cancelAnimationFrame: true */

define(function(require, exports, module) {
	'use strict';

	var video  = document.createElement('video'),
		canvas = document.createElement('canvas'),
		render = document.createElement('canvas'),
		color  = document.createElement('canvas'),
		ctx    = canvas.getContext('2d'),
		renderCtx = render.getContext('2d'),
		colorCtx  = color.getContext('2d'),
		looper    = null,
		flux      = null;
	
	canvas.id = 'rendu';
	
	var checkbox = document.createElement('input'),
		cbLabel  = document.createElement('label');
	
	cbLabel.innerHTML = "Enable webcam";
	cbLabel.for = "webcam";
	
	checkbox.type = "checkbox";
	checkbox.id   = "webcam";
	
	checkbox.addEventListener('change', function(event) {
		if (checkbox.checked) {
			navigator.webkitGetUserMedia({'video': true, 'audio': true}, function(fluxVideo) {
				video.src = window.URL.createObjectURL(fluxVideo);
				video.play();
				
				flux = fluxVideo;

				canvas.width  = render.width  = 550;
				canvas.height = render.height = 400;

				color.width = color.height = 50;

				mainLoop();	
			});
		} else {
			flux.stop();
			cancelAnimationFrame(looper);
			ctx.fillStyle = "red";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		}
	});

	// These values are defined for test only.
	// In futur updates, they will be defined
	// by the current user by clicking in the
	// canvas.
	var R = 255,
		G = 255,
		B = 255;
	
	var mainLoop = function() {
		renderCtx.drawImage(video, 0, 0, canvas.width, canvas.height);

		var frame = renderCtx.getImageData(0, 0, canvas.width, canvas.height);
		var l = frame.data.length;

		for (var i = 0; i < l; i+=4) {
			var r = frame.data[i + 0];
			var g = frame.data[i + 1];
			var b = frame.data[i + 2];
			if (isAllowed(r, g, b, 50))
				frame.data[i + 3] = 0;
		}
		ctx.putImageData(frame, 0, 0);
		
		// Loop through the animation 
		looper = requestAnimationFrame(mainLoop);
	};
	
	function isAllowed(r, g, b, factor) {
		return (r < R+factor && r > R) &&
			   (g < G+factor && g > G) &&
			   (b < B+factor && b > B);
	}
	
	canvas.addEventListener('click', function(event) {
		var x = event.clientX - canvas.offsetLeft,
			y = event.clientY - canvas.offsetTop;
		
		var imageData = ctx.getImageData(x, y, 1, 1),
			data = imageData.data;
		
		R = data[0];
		G = data[1];
		B = data[2];
	});
	
	canvas.addEventListener('mousemove', function(event) {
		var x = event.clientX - canvas.offsetLeft,
			y = event.clientY - canvas.offsetTop;
		
		var imageData = ctx.getImageData(x, y, 1, 1),
			data = imageData.data;
		
		colorCtx.setFillColor('rgb(' + data[0] + ', ' + data[1] + ', ' + data[2] + ')');
		colorCtx.fillRect(0, 0, color.width, color.height);
	});

	
	document.querySelector('#mainContainer').appendChild(canvas);
	document.querySelector('#mainContainer').appendChild(color);
	document.querySelector('#mainContainer').appendChild(cbLabel);
	document.querySelector('#mainContainer').appendChild(checkbox);

	// webcam
	
});