(function(m) {

	m.Ellipse = class Ellipse extends m.Graphics {
		constructor({color = 0xFFFFFF, ...options} = {}) {
			super({...options, callback: (ctx, width, height) => {
				ctx.beginFill(this.color);
				ctx.drawEllipse(0, 0, width / 2, height / 2);
			}});
			this.color = color;
		}
	}

})(rigid.component.render);