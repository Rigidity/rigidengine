(function(m) {

	const PolyBody = Polygon;
	m.Polygon = class Polygon extends rigid.component.Collider {
		constructor({points = [], ...options} = {}) {
			super(options);
			this.body = new PolyBody(0, 0, points);
		}
	}

})(rigid.component.collide);