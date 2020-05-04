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
			rigid.utils.property({
				object: entity, name: "x",
				getter: () => this.x,
				setter: number => {
					entity.events.trigger("preupdate");
					this.x = number;
					entity.events.trigger("postupdate");
				}
			});
			rigid.utils.property({
				object: entity, name: "y",
				getter: () => this.y,
				setter: number => {
					entity.events.trigger("preupdate");
					this.y = number;
					entity.events.trigger("postupdate");
				}
			});
			rigid.utils.property({
				object: entity, name: "w",
				getter: () => this.w,
				setter: number => {
					entity.events.trigger("preupdate");
					this.w = number;
					entity.events.trigger("postupdate");
				}
			});
			rigid.utils.property({
				object: entity, name: "h",
				getter: () => this.h,
				setter: number => {
					entity.events.trigger("preupdate");
					this.h = number;
					entity.events.trigger("postupdate");
				}
			});
			rigid.utils.property({
				object: entity, name: "angle",
				getter: () => this.angle,
				setter: number => {
					entity.events.trigger("preupdate");
					this.angle = number;
					entity.events.trigger("postupdate");
				}
			});
		}
		disable(entity) {
			rigid.utils.unproperty({
				object: entity, name: "x"
			});
			rigid.utils.unproperty({
				object: entity, name: "y"
			});
			rigid.utils.unproperty({
				object: entity, name: "w"
			});
			rigid.utils.unproperty({
				object: entity, name: "h"
			});
			rigid.utils.unproperty({
				object: entity, name: "angle"
			});
		}
	}

})(rigid.component);