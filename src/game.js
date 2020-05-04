(function(m) {
	
	m.Game = class Game {
		constructor() {
			this.events = new rigid.event.Listener();
			this.components = new rigid.component.System(this,
				() => this.events.trigger("preupdate"),
				() => this.events.trigger("postupdate")
			);
			this.entities = [];
			this.timer = new rigid.utils.Timer({
				fps: 60,
				callback: delta => {
					this.events.trigger("tick", {
						delta: delta
					});
					this.entities.forEach(entity => {
						entity.events.trigger("tick", {delta: delta});
					});
				}
			});
			const game = this;
			this.Entity = class Entity {
				constructor() {
					this.game = game;
					this.exists = false;
					this.events = new rigid.event.Listener();
					this.components = new rigid.component.System(this,
						() => this.events.trigger("preupdate"),
						() => this.events.trigger("postupdate")
					);
				}
			}
		}
		destroy() {
			for (const key in this.events.handlers) {
				delete this.events.handlers[key];
			}
			this.entities.slice().forEach(entity => {
				for (const key in entity.events.handlers) {
					delete entity.events.handlers[key];
				}
				entity.components.items.slice().forEach(component => {
					entity.components.remove(component);
				});
				this.remove(entity);
			});
			this.components.items.slice().forEach(component => {
				this.components.remove(component);
			});
			this.timer.stop();
		}
		add(entity) {
			if (this.entities.contains(entity)) {
				return this;
			}
			this.events.trigger("preupdate");
			this.entities.add(entity);
			entity.exists = true;
			entity.events.trigger("add");
			this.events.trigger("postupdate");
			return this;
		}
		remove(entity) {
			if (!this.entities.contains(entity)) {
				return this;
			}
			this.events.trigger("preupdate");
			entity.events.trigger("remove");
			this.entities.remove(entity);
			entity.exists = false;
			this.events.trigger("postupdate");
			return this;
		}
	}

})(rigid.game = {});