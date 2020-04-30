(function(m) {

	m.Transform = class Transform extends m.Component {
		constructor({x = 0, y = 0, w = 64, h = 64, angle = 0} = {}) {
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
					rigid.game.triggerEntityRecursively(entity, "preupdate");
					this.x = number;
					rigid.game.triggerEntityRecursively(entity, "postupdate");
				}
			});
			rigid.utils.property({
				object: entity, name: "y",
				getter: () => this.y,
				setter: number => {
					rigid.game.triggerEntityRecursively(entity, "preupdate");
					this.y = number;
					rigid.game.triggerEntityRecursively(entity, "postupdate");
				}
			});
			rigid.utils.property({
				object: entity, name: "w",
				getter: () => this.w,
				setter: number => {
					rigid.game.triggerEntityRecursively(entity, "preupdate");
					this.w = number;
					rigid.game.triggerEntityRecursively(entity, "postupdate");
				}
			});
			rigid.utils.property({
				object: entity, name: "h",
				getter: () => this.h,
				setter: number => {
					rigid.game.triggerEntityRecursively(entity, "preupdate");
					this.h = number;
					rigid.game.triggerEntityRecursively(entity, "postupdate");
				}
			});
			rigid.utils.property({
				object: entity, name: "angle",
				getter: () => this.angle,
				setter: number => {
					rigid.game.triggerEntityRecursively(entity, "preupdate");
					this.angle = number;
					rigid.game.triggerEntityRecursively(entity, "postupdate");
				}
			});
			rigid.utils.property({
				object: entity, name: "absoluteAngle",
				getter: () => {
					if (entity.parent == null) {
						return this.angle;
					} else {
						return entity.parent.absoluteAngle + this.angle;
					}
				},
				setter: number => {
					throw new Error("Cannot assign to absolute coordinates.");
				}
			});
			rigid.utils.property({
				object: entity, name: "absoluteX",
				getter: () => {
					if (entity.parent == null) {
						return this.x;
					} else {
						const parentX = entity.parent.absoluteX;
						const parentY = entity.parent.absoluteY;
						return rigid.math.rotatePoint(parentX, parentY, parentX + this.x, parentY + this.y, entity.parent.absoluteAngle)[0];
					}
				},
				setter: number => {
					throw new Error("Cannot assign to absolute coordinates.");
				}
			});
			rigid.utils.property({
				object: entity, name: "absoluteY",
				getter: () => {
					if (entity.parent == null) {
						return this.y;
					} else {
						const parentX = entity.parent.absoluteX;
						const parentY = entity.parent.absoluteY;
						return rigid.math.rotatePoint(parentX, parentY, parentX + this.x, parentY + this.y, entity.parent.absoluteAngle)[1];
					}
				},
				setter: number => {
					throw new Error("Cannot assign to absolute coordinates.");
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
			rigid.utils.unproperty({
				object: entity, name: "absoluteAngle"
			});
			rigid.utils.unproperty({
				object: entity, name: "absoluteX"
			});
			rigid.utils.unproperty({
				object: entity, name: "absoluteY"
			});
		}
	}

})(rigid.component);