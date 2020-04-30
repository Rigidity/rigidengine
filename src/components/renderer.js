(function(m) {

	m.Renderer = class Renderer extends m.Component {
		constructor({x = 0, y = 0, w = 1, h = 1, angle = 0} = {}) {
			super();
			this.x = x;
			this.y = y;
			this.w = w;
			this.h = h;
			this.angle = angle;
			this.container = new PIXI.Container();
		}
		enable(entity) {
			this.containerAdder = () => {
				const app = entity.game.components.get(rigid.component.Application);
				if (app != null) {
					app.stage.addChild(this.container);
				}
			}
			this.containerRemover = () => {
				const app = entity.game.components.get(rigid.component.Application);
				if (app != null) {
					app.stage.removeChild(this.container);
				}
			}
			this.containerUpdater = () => {
				if (!entity.components.has(m.Transform)) return;
				this.container.position.set(entity.absoluteX + this.x, entity.absoluteY + this.y);
				this.container.scale.set(entity.w * this.w, entity.h * this.h);
				this.container.angle = entity.absoluteAngle + this.angle;
			}
			entity.events.register("add", this.containerAdder);
			entity.events.register("remove", this.containerRemover);
			entity.events.register("postupdate", this.containerUpdater);
			if (entity.exists) {
				this.containerAdder();
			}
		}
		disable(entity) {
			if (entity.exists) {
				this.containerRemover();
			}
			entity.events.unregister("add", this.containerAdder);
			entity.events.unregister("remove", this.containerRemover);
			entity.events.unregister("postupdate", this.containerUpdater);
		}
	}

})(rigid.component);
rigid.component.render = {};