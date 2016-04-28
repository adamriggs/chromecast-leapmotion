export default class Ball {

	constructor() {
		this.x = 0;
		this.y = 0;

		this.element = $('#ball_img');
		this.initCSS();
	}

	initCSS() {
		//console.log(this.element);
		this.element.css({
			position: 'absolute'
		})
	}

	setPos(X, Y) {
		this.x = X;
		this.y = Y;

		this.element.css({
			left: this.x,
			top: this.y
		});
	}
	
}