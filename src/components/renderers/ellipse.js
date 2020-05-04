(function(m) {

	m.Ellipse = class Ellipse extends m.Graphics {
		constructor({color = 0xFFFFFF, resolution = 64, ...options} = {}) {
			super(options);
			this.graphics.beginFill(color);
			this.graphics.drawEllipse(0, 0, resolution / 2, resolution / 2);
			this.graphics.scale.set(1 / resolution, 1 / resolution);
		}
	}

})(rigid.component.render);