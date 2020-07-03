(function(m) {

	m.Entity = class Entity {
		constructor(id = rigid.utils.baseIdentifier.id()) {
			this.exists = false;
			this.events = new rigid.event.Listener();
			this.components = new rigid.component.System(this,
				() => this.events.trigger("preupdate"),
				() => this.events.trigger("postupdate")
			);
			this.data = {};
			this.id = id;
		}
	}

})(rigid.entity = {});