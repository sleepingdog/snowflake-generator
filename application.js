// JavaScript Document to draw snowflakes in SVG.
// Global variables
var snowflakes; // container for snowflakes
var snowfield; // the SVG drawing root within the page
var canvas; // dimensions of snowfield viewbox
var svgNameSpace = "http://www.w3.org/2000/svg";
var xlinkNameSpace = "http://www.w3.org/1999/xlink";
var snowflakeNameSpace = "http://www.sleepingdog.org.uk/svg/nature/snowflake"; // custom namespace for this application, so variables can be stored in new attributes in SVG elements
var flakeCount = 4; // number of flakes on screen at same time
var flakeRadius = 120; // length of flake arm
var floatSize = 0.5; // maximum amount of randomness in snowflake up/down movement;
var driftSize = 0.2; // maximum amount of randomness in snowflake sideways movement;
var floatUpper = 0.7; // probability of downward float
var floatLower = 0.3; // probability of upward float
var driftUpper = 0.9; // probability of leftward drift
var driftLower = 0.1; // probability of rightward drift
var growthChance = 0.001; // probability of crystal growth
var period = 60000; // the length of the sinusoidal movement cycle
function viewBox (coordstring) {
	// represents svg/@viewbox value; for example, coords could be "0 0 800 460"
	var coords = coordstring.split(" ", 4)
	this.x1 = Number(coords[0]);
	this.y1 = Number(coords[1]);
	this.x2 = Number(coords[2]);
	this.y2 = Number(coords[3]);
}
// Main draw function:
function draw() {	 
	// Initialize objects
	snowfield = document.getElementById("snowysky"); // the SVG drawing root within the page
	canvas = new viewBox(snowfield.getAttribute("viewBox")); // get SVG dimensions
	snowflakes = new blizzard(); // creates container for snowflakes
	// Draw sky
	animate();
}
// Main animation function
function animate() {
	snowflakes.drawFlake();
	requestAnimFrame(animate);
}
function blizzard () {
	var flakes = []; // an array holding the snowflake g elements
	var kernels = []; // a matching array holding the core shape
	var arms = []; // a matching array holding each master snowflake arm
	var armCopies = []; // an array of arms copying the master arm with SVG use elements
	var xOffset = 0;
	var yOffset = 0;
	// Draw flakes
	for (i = 0; i < flakeCount; i++) {
		// create a SVG g element to contain each flake
		flakes[i] = document.createElementNS(svgNameSpace, "g");
		flakes[i].setAttribute("id", "flake" + i);
		flakes[i].setAttribute("class", "snow");
		flakes[i].setAttributeNS(snowflakeNameSpace, "age", 0);
		// create attributes to hold sinusoidal movement data
		var flakePeriod = period + (Math.random() * period / 2); // variable period
		flakes[i].setAttributeNS(snowflakeNameSpace, "flakePeriod", flakePeriod);
		//var cycleMin;
		//var cycleMax;
		var cyclePoint = Math.floor(Math.random() * period);
		flakes[i].setAttributeNS(snowflakeNameSpace, "cyclePoint", cyclePoint);
		// distribute flakes horizontally over canvas
		xOffset = ((canvas.x2 - canvas.x1 - flakeRadius * 1.1) / flakeCount * i) + flakeRadius * 1.1;
		var sineWavePoint = Math.sin(cyclePoint / flakePeriod * 360);
		yOffset = ((canvas.y2 - canvas.y1) * .8 * (sineWavePoint + 1) / 2) + ((canvas.y2 - canvas.y1) * .1); +
		flakes[i].setAttributeNS(snowflakeNameSpace, "x", xOffset);
		flakes[i].setAttributeNS(snowflakeNameSpace, "y", yOffset);
		flakes[i].setAttribute("transform", "translate(" + xOffset + ", " + yOffset + ")");
		snowfield.appendChild(flakes[i]);
		kernels[i] = document.createElementNS(svgNameSpace, "use");
		kernels[i].setAttributeNS(xlinkNameSpace, "href", "#hexagon");
		document.getElementById("flake" + i).appendChild(kernels[i]);
		// draw main arm
		arms[i] = document.createElementNS(svgNameSpace, "g");
		arms[i].setAttribute("id", "flake" + i + "arm" + i);
		//arms[i].setAttributeNS(xlinkNameSpace, "href", "#arm");
		document.getElementById("flake" + i).appendChild(arms[i]);
		for (j = 1; j < 6; j++) { 
			armCopies[j] = document.createElementNS(svgNameSpace, "use");
			//armCopies[j].setAttribute("id", "flake" + i + "arm" + j);
			armCopies[j].setAttributeNS(xlinkNameSpace, "href", "#" + "flake" + i + "arm" + i);
			armCopies[j].setAttribute("transform", "rotate(" + (j * 60) + ", 0, 0)");
			document.getElementById("flake" + i).appendChild(armCopies[j]);
		}
	}
	this.drawFlake = function() {
		for (s = 0; s < flakes.length; s++) { //flakes.length
			// get current coordinates for flake
			var oldX = Number(flakes[s].getAttributeNS(snowflakeNameSpace, "x"));
			var oldY = Number(flakes[s].getAttributeNS(snowflakeNameSpace, "y"));
			// Flakes floats upwards, downwards or hover
			var float = 0;
			var drift = 0;
			//var period = 0;
			if (oldY > flakeRadius / 2 && Math.random() < floatLower) {
				float = floatSize;
			} else if (oldY < flakeRadius / 2 && Math.random() > floatUpper) {
				float = -1 * floatSize;
			}
			if (Math.random() < driftLower) {
				drift = driftSize;
			} else if (Math.random() > driftUpper) {
				drift = -1 * driftSize;
			}
			var cyclePoint = Number(flakes[s].getAttributeNS(snowflakeNameSpace, "cyclePoint"));
			var flakePeriod = Number(flakes[s].getAttributeNS(snowflakeNameSpace, "flakePeriod"));
			if (cyclePoint > flakePeriod) {
				// if the flake's cycle point has reached the end of the period, reset to zero
				flakes[s].setAttributeNS(snowflakeNameSpace, "cyclePoint", 0);
			} else {
				flakes[s].setAttributeNS(snowflakeNameSpace, "cyclePoint", cyclePoint + 1);
			}
			var sineWavePoint = Math.sin(cyclePoint / flakePeriod * 360);
			var waveY = ((canvas.y2 - canvas.y1) * .8 * (sineWavePoint + 1) / 2) + ((canvas.y2 - canvas.y1) * .1);
			// calculate new coordinates for flake
			var newX = oldX - drift;
			var newY = waveY - float;
			// set new coordinates for flake
			flakes[s].setAttributeNS(snowflakeNameSpace, "x", newX);
			flakes[s].setAttributeNS(snowflakeNameSpace, "y", newY);
			flakes[s].setAttribute("transform", "translate(" + newX + ", " + newY + ")");
			// growth
			if (Math.random() < growthChance) {
				var age = Number(flakes[s].getAttributeNS(snowflakeNameSpace, "age"));
				
				// TODO: add new arm component
				// then check if age is max and start fall sequence
				if (age < 11) {
					flakes[s].setAttributeNS(snowflakeNameSpace, "age", age + 1);
					var arm = document.getElementById("flake" + s + "arm" + s);
					var newComponent;
					var newComponentNumber = Math.ceil(Math.random() * (10 - age) + age);
					//newComponent = document.getElementById("shape" + newComponentNumber);
					// shape4
					var newUse = document.createElementNS(svgNameSpace, "use");
					newUse.setAttributeNS(xlinkNameSpace, "href", "#shape" + newComponentNumber);
					var growthOffset = (age + 1) * 10;
					newUse.setAttribute("transform", "translate(0, " + growthOffset + ")");
					arm.appendChild(newUse);
				}
			}
		}
	}
}

// requestAnim shim layer by Paul Irish   
window.requestAnimFrame = (function(){   
	return window.requestAnimationFrame  ||    
	window.webkitRequestAnimationFrame ||    
	window.mozRequestAnimationFrame ||    
	window.oRequestAnimationFrame  ||    
	window.msRequestAnimationFrame  ||    
	function(/* function */ callback, /* DOMElement */ element){   
	window.setTimeout(callback, 1000 / 60);   
 };   
})();
  