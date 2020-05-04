(function(m) {

	m.Rect = class Rect extends m.Polygon {
		constructor({...options} = {}) {
			super({
				points: [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]],
				...options
			});
		}
	}

})(rigid.component.collide);