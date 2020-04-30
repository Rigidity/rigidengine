(function(m) {
	
	// The root application component to be attached to games clientside.
	m.Application = class Application extends m.Component {
		// Pass in an optional canvas and background, both of which have defaults.
		constructor({canvas = rigid.dom.id("canvas"), background = 0x000000} = {}) {
			super();

			// Save the canvas.
			this.canvas = canvas;

			// Initialize the PIXI application.
			this.app = new PIXI.Application({
				view: this.canvas
			});

			// Get the stage container.
			this.stage = this.app.stage;

			// And renderer of the application.
			this.renderer = this.app.renderer;

			// Set the initial background.
			this.renderer.backgroundColor = background;

			this.x = 0;
			this.y = 0;
			this.mouseX = 0;
			this.mouseY = 0;

			// This repositions the camera.
			this.updateCamera = () => {
				this.stage.position.set(this.canvas.width / 2 + this.x, this.canvas.height / 2 + this.y);
			}

			// And this resizes the window, rendering because it clears it.
			this.resizer = () => {
				this.canvas.width = window.innerWidth;
				this.canvas.height = window.innerHeight;
				this.renderer.render(this.stage);

				// We also want to reposition the camera after resizing.
				this.updateCamera();
			}

			// And now.
			this.updateCamera();

		}
		enable(game) {

			// Define the objects that store key and mouse data.
			game.key = {};
			game.mouse = {};

			// Create event handlers.
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

			// Define some properties that you can get and set.
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

			// Define mouse position readonly properties.
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

			// Hook the events.
			window.addEventListener("resize", this.resizer);
			window.addEventListener("keydown", this.onkeydown);
			window.addEventListener("keyup", this.onkeyup);
			window.addEventListener("mousedown", this.onmousedown);
			window.addEventListener("mouseup", this.onmouseup);
			window.addEventListener("mousemove", this.onmousemove);
			window.addEventListener("click", this.onclick);

			// And call it immediately.
			this.resizer();
		}
		disable(game) {

			// Remove the property to prevent object pollution.
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

			// And unhook the events.
			window.removeEventListener("resize", this.resizer);
			window.removeEventListener("resize", this.resizer);
			window.removeEventListener("keydown", this.onkeydown);
			window.removeEventListener("keyup", this.onkeyup);
			window.removeEventListener("mousedown", this.onmousedown);
			window.removeEventListener("mouseup", this.onmouseup);
			window.removeEventListener("mousemove", this.onmousemove);
			window.removeEventListener("click", this.onclick);

			// Remove the objects that store input.
			delete game.key;
			delete game.mouse;

		}
	}

})(rigid.component);