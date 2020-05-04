(function(m) {

	const PolyBody = Polygon;
	m.Polygon = class Polygon extends rigid.component.Collider {
		constructor({points = [], ...options} = {}) {
			super(options);
			this.body = new PolyBody(0, 0, points);
		}
		enable(entity) {
			this.bodyUpdater = () => {
				if (!entity.components.has(rigid.component.Transform)) return;
				this.body.x = entity.x + this.x;
				this.body.y = entity.y + this.y;
				this.body.scale_x = entity.w * this.w;
				this.body.scale_y = entity.h * this.h;
				this.body.angle = rigid.math.radians(entity.angle + this.angle);
			}
			super.enable(entity);
		}
	}

})(rigid.component.collide);