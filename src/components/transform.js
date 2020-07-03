(function(m) {

	m.Transform = class Transform extends m.Component {
		constructor({x = 0, y = 0, w = 1, h = 1, angle = 0} = {}) {
			super();
			this.x = x;
			this.y = y;
			this.w = w;
			this.h = h;
			this.angle = angle;
		}
		enable(entity) {
			function def(p, g, s) {rigid.utils.property({object: entity, name: p, getter: g, setter: s});}
			def("x", () => this.x, number => {
				entity.events.trigger("preupdate");
				this.x = number;
				entity.events.trigger("postupdate");
			});
			def("y", () => this.y, number => {
				entity.events.trigger("preupdate");
				this.y = number;
				entity.events.trigger("postupdate");
			});
			def("w", () => this.w, number => {
				entity.events.trigger("preupdate");
				this.w = number;
				entity.events.trigger("postupdate");
			});
			def("h", () => this.h, number => {
				entity.events.trigger("preupdate");
				this.h = number;
				entity.events.trigger("postupdate");
			});
			def("angle", () => this.angle, number => {
				entity.events.trigger("preupdate");
				this.angle = number;
				entity.events.trigger("postupdate");
			});
			this.serializer = data => {
				data.x = this.x;
				data.y = this.y;
				data.w = this.w;
				data.h = this.h;
				data.angle = this.angle;
			};
			this.deserializer = data => {
				entity.events.trigger("preupdate");
				this.x = data.x;
				this.y = data.y;
				this.w = data.w;
				this.h = data.h;
				this.angle = data.angle;
				entity.events.trigger("postupdate");
			};
			entity.events.register("serialize", this.serializer);
			entity.events.register("deserialize", this.deserializer);
		}
		disable(entity) {
			function undef(p) {rigid.utils.property({object: entity, name: p});}
			entity.events.unregister("serialize", this.serializer);
			entity.events.unregister("deserialize", this.deserializer);
			undef("x");
			undef("y");
			undef("w");
			undef("h");
			undef("angle");
		}
	}

})(rigid.component);