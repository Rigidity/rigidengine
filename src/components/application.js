(function(m) {
	
	m.Application = class Application extends m.Component {
		constructor({canvas = rigid.dom.id("canvas"), background = 0x000000} = {}) {
			super();
			this.canvas = canvas;
			this._background = background;
		}
		enable(game) {
			this.app = new PIXI.Application({
				view: this.canvas
			});
			this.stage = this.app.stage;
			this.renderer = this.app.renderer;
			this.renderer.backgroundColor = this._background;
			this.x = 0;
			this.y = 0;
			this.mouseX = 0;
			this.mouseY = 0;
			this.updateCamera = () => {
				this.stage.position.set(this.canvas.width / 2 + this.x, this.canvas.height / 2 + this.y);
			}
			this.updateCamera();
			game.key = {};
			game.mouse = {};
			this.resizer = () => {
				this.canvas.width = window.innerWidth;
				this.canvas.height = window.innerHeight;
				this.renderer.render(this.stage);
				this.updateCamera();
				game.events.trigger("resize");
			};
			this.onkeydown = e => {
				const old = game.key[e.key] == true;
				game.key[e.key] = true;
				if (!old) {
					game.events.trigger("keydown", {
						key: e.key
					});
				}
				game.events.trigger("keytype", {
					key: e.key
				});
			};
			this.onkeyup = e => {
				game.key[e.key] = false;
				game.events.trigger("keyup", {
					key: e.key
				});
			};
			this.onmousedown = e => {
				game.mouse[e.button] = true;
				game.events.trigger("mousedown", {
					button: e.button
				});
			};
			this.onmouseup = e => {
				game.mouse[e.button] = false;
				game.events.trigger("mouseup", {
					button: e.button
				});
			};
			this.onmousemove = e => {
				const pos = rigid.dom.canvasPosition(e, this.canvas);
				this.mouseX = pos.x;
				this.mouseY = pos.y;
				game.events.trigger("mousemove", {
					button: e.button
				});
			};
			this.onclick = e => {
				game.events.trigger("click", {
					button: e.button
				});
			};
			rigid.utils.property({
				object: game, name: "background",
				getter: () => this.renderer.backgroundColor,
				setter: color => {
					this.renderer.backgroundColor = color;
				}
			});
			rigid.utils.property({
				object: game, name: "w",
				getter: () => this.canvas.width
			});
			rigid.utils.property({
				object: game, name: "h",
				getter: () => this.canvas.height
			});
			rigid.utils.property({
				object: game, name: "mouseX",
				getter: () => this.mouseX - this.canvas.width / 2 + this.x
			});
			rigid.utils.property({
				object: game, name: "mouseY",
				getter: () => this.mouseY - this.canvas.height / 2 + this.y
			});
			rigid.utils.property({
				object: game, name: "absoluteMouseX",
				getter: () => this.mouseX
			});
			rigid.utils.property({
				object: game, name: "absoluteMouseY",
				getter: () => this.mouseY
			});
			window.addEventListener("resize", this.resizer);
			window.addEventListener("keydown", this.onkeydown);
			window.addEventListener("keyup", this.onkeyup);
			window.addEventListener("mousedown", this.onmousedown);
			window.addEventListener("mouseup", this.onmouseup);
			window.addEventListener("mousemove", this.onmousemove);
			window.addEventListener("click", this.onclick);
			this.resizer();
		}
		disable(game) {
			rigid.utils.unproperty({
				object: game, name: "background"
			});
			rigid.utils.unproperty({
				object: game, name: "mouseX"
			});
			rigid.utils.unproperty({
				object: game, name: "mouseY"
			});
			rigid.utils.unproperty({
				object: game, name: "absoluteMouseX"
			});
			rigid.utils.unproperty({
				object: game, name: "absoluteMouseY"
			});
			window.removeEventListener("resize", this.resizer);
			window.removeEventListener("resize", this.resizer);
			window.removeEventListener("keydown", this.onkeydown);
			window.removeEventListener("keyup", this.onkeyup);
			window.removeEventListener("mousedown", this.onmousedown);
			window.removeEventListener("mouseup", this.onmouseup);
			window.removeEventListener("mousemove", this.onmousemove);
			window.removeEventListener("click", this.onclick);
			delete game.key;
			delete game.mouse;
			this.app.destroy();
			$(this.canvas).replaceWith($(this.canvas).clone());
		}
	}

})(rigid.component);