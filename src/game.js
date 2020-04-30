(function(m) {
	
	m.triggerEntityRecursively = function(entity, name, event) {
		entity.children.forEach(child => {
			m.triggerEntityRecursively(child, name, event);
		});
		entity.events.trigger(name, event);
	}
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
						m.triggerEntityRecursively(entity, "tick", {delta: delta});
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
						() => m.triggerEntityRecursively(this, "preupdate"),
						() => m.triggerEntityRecursively(this, "postupdate")
					);
					this.children = [];
					this.parent = null;
				}
				add(child) {
					if (this.children.contains(child) || child.parent != null) {
						return this;
					}
					m.triggerEntityRecursively(this, "preupdate");
					this.children.add(child);
					child.parent = this;
					m.triggerEntityRecursively(child, "add");
					m.triggerEntityRecursively(this, "postupdate");
					return this;
				}
				remove(child) {
					if (!this.children.contains(child)) {
						return this;
					}
					m.triggerEntityRecursively(this, "preupdate");
					m.triggerEntityRecursively(child, "remove");
					this.children.remove(child);
					child.parent = null;
					m.triggerEntityRecursively(this, "postupdate");
					return this;
				}
			}
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