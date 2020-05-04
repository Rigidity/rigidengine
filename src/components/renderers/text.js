(function(m) {

	// We extend the base renderer component, in renderer.js
	m.Text = class Text extends rigid.component.Renderer {
		constructor({text = "Text", font = "Arial", size = 24, color = 0xFFFFFF, align = "center", ...options} = {}) {
			super(options);
			this.text = new PIXI.Text(text, {
				fontFamily: font,
				fontSize: size,
				fill: color,
				align: align
			});
			this.text.anchor.set(0.5, 0.5);
		}
		enable(entity) {
			super.enable(entity);
			this.textAdder = () => {
				this.container.addChild(this.text);
			};
			this.textRemover = () => {
				this.container.removeChild(this.text);
			};
			entity.events.register("add", this.textAdder);
			entity.events.register("remove", this.textRemover);
			if (entity.exists) {
				this.textAdder();
			}
			rigid.utils.property({
				object: entity, name: "text",
				getter: () => this.text.text,
				setter: text => this.text.text = text
			});
		}
		disable(entity) {
			super.disable(entity);
			if (entity.exists) {
				this.textRemover();
			}
			rigid.utils.unproperty({
				object: entity, name: "text"
			});
			entity.events.unregister("add", this.textAdder);
			entity.events.unregister("remove", this.textRemover);
		}
	}

})(rigid.component.render);