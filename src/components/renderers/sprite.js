(function(m) {

	// We extend the base renderer component, in renderer.js
	m.Sprite = class Sprite extends rigid.component.Renderer {
		constructor({sprite, ...options} = {}) {
			super(options);
			this.sprite = new PIXI.Sprite(sprite.texture);
			this.sprite.width = 1;
			this.sprite.height = 1;
			this.sprite.anchor.set(0.5, 0.5);
		}
		enable(entity) {
			super.enable(entity);
			this.spriteAdder = () => {
				this.container.addChild(this.sprite);
			};
			this.spriteRemover = () => {
				this.container.removeChild(this.sprite);
			};
			entity.events.register("add", this.spriteAdder);
			entity.events.register("remove", this.spriteRemover);
			if (entity.exists) {
				this.spriteAdder();
			}
		}
		disable(entity) {
			super.disable(entity);
			if (entity.exists) {
				this.spriteRemover();
			}
			entity.events.unregister("add", this.spriteAdder);
			entity.events.unregister("remove", this.spriteRemover);
		}
	}

})(rigid.component.render);