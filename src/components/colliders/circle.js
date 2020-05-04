(function(m) {

	const CircBody = Circle;
	m.Circle = class Circle extends rigid.component.Collider {
		constructor({...options} = {}) {
			super(options);
			this.body = new CircBody(0, 0, 0.5);
		}
		enable(entity) {
			this.bodyUpdater = () => {
				if (!entity.components.has(rigid.component.Transform)) return;
				this.body.x = entity.x + this.x;
				this.body.y = entity.y + this.y;
				this.body.scale = entity.w * this.w;
			}
			super.enable(entity);
		}
	}

})(rigid.component.collide);