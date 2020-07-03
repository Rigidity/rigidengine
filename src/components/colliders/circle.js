(function(m) {

	const CircBody = Circle;
	m.Circle = class Circle extends rigid.component.Collider {
		constructor({...options} = {}) {
			super(options);
			this.body = new CircBody(0, 0, 0.5);
		}
	}

})(rigid.component.collide);