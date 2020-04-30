(function(m) {

	m.Rect = class Rect extends m.Graphics {
		constructor({color = 0xFFFFFF, resolution = 64, ...options} = {}) {
			super(options);
			this.graphics.beginFill(color);
			this.graphics.drawRect(-0.5, -0.5, 1, 1);
		}
	}

})(rigid.component.render);