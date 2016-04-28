export default class LeapJS {

	constructor() {
		this.animate = false;
		this.controller;

		this.posX = 0;
		this.posY = 0;
	}
	
	toggleApp() {
		this.beginAnimation();
	}

	beginAnimation() {

		this.controller = Leap.loop({enableGestures: true}, (frame)=>{

			if(frame.pointables[0]) {

				var pointable = frame.pointables[0];
				var interactionBox = frame.interactionBox;
				var normalizedPosition = interactionBox.normalizePoint(pointable.tipPosition, true);

				// Convert the normalized coordinates to span the canvas
				this.posX = window.innerWidth * normalizedPosition[0];
				this.posY = window.innerHeight * (1 - normalizedPosition[1]);

				//console.log(this.posX, this.posY);
			}

			// Gesture stuff that I'm not using yet
			// if(frame.valid && frame.gestures.length > 0){
			//     frame.gestures.forEach(function(gesture){
			//         switch (gesture.type){
			//           case "circle":
			//               console.log("Circle Gesture");
			//               break;
			//           case "keyTap":
			//               console.log("Key Tap Gesture");
			//               break;
			//           case "screenTap":
			//               console.log("Screen Tap Gesture");
			//               break;
			//           case "swipe":
			//               console.log("Swipe Gesture");
			//               break;
			//         }
			//     });
			// }

			
		});
	}
	
}
