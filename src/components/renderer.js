(function(m) {

	m.Renderer = class Renderer extends m.Component {
		constructor({x = 0, y = 0, w = 1, h = 1, angle = 0, order = 0} = {}) {
			super();
			this.x = x;
			this.y = y;
			this.w = w;
			this.h = h;
			this.angle = angle;
			this.order = order;
		}
		enable(entity) {
			this.container = new PIXI.Container();
			this.container.zIndex = this.order;
			this.containerAdder = () => {
				const app = entity.game.components.get(rigid.component.Application);
				if (app != null) {
					app.stage.addChild(this.container);
					app.stage.sortChildren();
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
				this.container.position.set(entity.x + this.x, entity.y + this.y);
				this.container.scale.set(entity.w * this.w, entity.h * this.h);
				this.container.angle = entity.angle + this.angle;
			}
			rigid.utils.property({
				object: entity, name: "order",
				getter: () => this.container.zIndex,
				setter: num => {
					if (this.container.zIndex == num) return;
					this.container.zIndex = num;
					if (entity.game == undefined) return;
					const app = entity.game.components.get(rigid.component.Application);
				if (app != null) {app.stage.sortChildren();}
				}
			});
			rigid.utils.property({
				object: entity, name: "opacity",
				getter: () => this.container.alpha,
				setter: num => this.container.alpha = num
			});
			entity.events.register("add", this.containerAdder);
			entity.events.register("remove", this.containerRemover);
			entity.events.register("postupdate", this.containerUpdater);
			if (entity.exists) {
				this.containerAdder();
			}
			this.containerUpdater();
		}
		disable(entity) {
			if (entity.exists) {
				this.containerRemover();
			}
			rigid.utils.unproperty({
				object: entity, name: "opacity"
			});
			rigid.utils.unproperty({
				object: entity, name: "order"
			});
			entity.events.unregister("add", this.containerAdder);
			entity.events.unregister("remove", this.containerRemover);
			entity.events.unregister("postupdate", this.containerUpdater);
		}
	}

})(rigid.component);
rigid.component.render = {};