(function(m) {

	// We extend the base renderer component, in renderer.js
	m.Graphics = class Graphics extends rigid.component.Renderer {
		constructor(options) {
			super(options);
			this.graphics = new PIXI.Graphics();
		}
		enable(entity) {
			super.enable(entity);
			this.graphicsAdder = () => {
				this.container.addChild(this.graphics);
			};
			this.graphicsRemover = () => {
				this.container.removeChild(this.graphics);
			};
			entity.events.register("add", this.graphicsAdder);
			entity.events.register("remove", this.graphicsRemover);
			if (entity.exists) {
				this.graphicsAdder();
			}
		}
		disable(entity) {
			super.disable(entity);
			if (entity.exists) {
				this.graphicsRemover();
			}
			entity.events.unregister("add", this.graphicsAdder);
			entity.events.unregister("remove", this.graphicsRemover);
		}
	}

})(rigid.component.render);