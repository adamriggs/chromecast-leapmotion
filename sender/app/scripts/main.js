//console.log("main.js");


//imports
import Chromecast from './Chromecast.js';
import LeapJS from './Leap.js';
import Ball from './Ball.js';

//variables
var chromecast;
var myLeap = new LeapJS();
var ball = new Ball();

//functions
window['__onGCastApiAvailable'] = function(loaded, errorInfo) {
	console.log('__onGCastApiAvailable');
	if (loaded) {
		chromecast = new Chromecast();
		chromecast.initializeCastApi();
	} else {
		console.log(errorInfo);
	}
}

function step() {
	ball.setPos(myLeap.posX, myLeap.posY);
	window.requestAnimationFrame(step.bind(this));
}

$('#casticon').on('click', function(event){
	chromecast.toggleApp();
});

$('#leapicon').on('click', function(event) {
	//console.log(myLeap);
	myLeap.toggleApp();
	step();
});