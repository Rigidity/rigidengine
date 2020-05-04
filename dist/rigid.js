const rigid = {};

Array.prototype.contains = function(item) {
	return this.indexOf(item) != -1;
};
Array.prototype.remove = function(item) {
	const idx = this.indexOf(item);
	if (idx != -1) this.splice(idx, 1);
};
Array.prototype.clear = function() {
	while (this.length > 0) {
		this.splice(0, 1);
	}
};
Array.prototype.add = Array.prototype.push;;(function(m) {
	
})(rigid.config = {});;(function(m) {

	m.property = function({object = {}, name = "property", getter, setter} = {}) {
		if (object.hasOwnProperty(name)) {
			return object;
		}
		Object.defineProperty(object, name, {
			get: getter,
			set: setter
		});
		return object;
	}
	m.unproperty = function({object = {}, name} = {}) {
		if (!object.hasOwnProperty(name)) {
			return object;
		}
		delete object[name];
		return object;
	}

	m.time = function() {
        return new Date().getTime();
	}
	m.Timer = class Timer {
        constructor({callback, fps} = {}) {
			this.callback = callback;
			this.fps = fps;
			this.timeout = null;
			this.state = false;
		}
        start() {
			if (this.state) {
				return this;
			}
			this.state = true;
			var oldTime = m.time();
			var remainder = 0;
			const timer = this;
			function step() {
				if (!timer.state) {
					return;
				}
				var newTime = m.time();
				const delta = newTime - oldTime;
				oldTime = newTime;
				remainder += delta;
				const delay = 1000 / timer.fps;
				while (remainder >= delay) {
					remainder -= delay;
					if (!timer.state) {
						return;
					}
					timer.callback(delta);
				}
				if (!timer.state) {
					return;
				}
				timer.timeout = setTimeout(step, delay - remainder);
			}
			step();
			return this;
		}
		stop() {
			if (!this.state) {
				return this;
			}
			this.state = false;
			if (this.timeout != null) {
				clearTimeout(this.timeout);
				this.timeout = null;
			}
			return this;
		}
	}
	
})(rigid.utils = {});;(function(m) {

	m.Listener = class Listener {
		constructor() {
			this.handlers = {};
		}
		register(name, func) {
			if (!(name in this.handlers)) {
				this.handlers[name] = [];
			}
			this.handlers[name].add(func);
			return this;
		}
		unregister(name, func) {
			if (!(name in this.handlers)) {
				return this;
			}
			this.handlers[name].remove(func);
			if (this.handlers[name].length == 0) {
				delete this.handlers[name];
			}
			return this;
		}
		trigger(name, event = {}) {
			if (!(name in this.handlers)) {
				return this;
			}
			this.handlers[name].forEach(item => item(event));
			return this;
		}
	}
	
})(rigid.event = {});;(function(m) {
	m.radians = function(degrees) {
		return degrees * Math.PI / 180;
	}
	m.degrees = function(radians) {
		return radians * 180 / Math.PI;
	}
	m.distance = function(a, b) {
		return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
	}
	m.angleBetween = function(a, b) {
		var dy = b.y - a.y;
		var dx = b.x - a.x;
		var theta = Math.atan2(dy, dx);
		theta *= 180 / Math.PI;
		return theta;
	}
	m.moveTowards = function(point, angle, speedX, speedY = speedX) {
		point.x += speedX * Math.cos(angle * Math.PI / 180);
		point.y += speedY * Math.sin(angle * Math.PI / 180);
	}
	m.rotatePoint = function(cx, cy, x, y, angle) {
		var radians = (Math.PI / 180) * -angle,
			cos = Math.cos(radians),
			sin = Math.sin(radians),
			nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
			ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
		return [nx, ny];
	}
	m.rotatePolygon = function(cx, cy, polygon, angle) {
		var res = [];
		var polyLength = polygon.length;
		for (var i = 0; i < polyLength; i++) {
			res.push(rotatePoint(cx, cy, polygon[i][0], polygon[i][1], angle));
		}
		return res;
	}
	m.clamp = function(num, a, b) {
		return num > b ? b : (num < a ? a : num);
	}
	m.round = function(num, decimal = 1) {
		const power = Math.pow(10, decimal);
		return Math.round(num * power) / power;
	}
})(rigid.math = {});;(function(m) {
	m.isNode = function() {
		return typeof module != "undefined" && module.exports;
	}
	m.server = m.isNode();
	m.client = !m.server;

	m.isMobile = function() {
		let check = false;
		(function(a) {
			if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
		})(navigator.userAgent || navigator.vendor || window.opera);
		return check;
	}
	m.isMobileOrTablet = function() {
		let check = false;
		(function(a) {
			if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
		})(navigator.userAgent || navigator.vendor || window.opera);
		return check;
	}
	m.mobile = m.client && m.isMobile();
	m.tablet = m.client && !m.mobile && m.isMobileOrTablet();
	m.desktop = m.client && !m.mobile && !m.tablet;
})(rigid.platform = {});;(function(m) {

	m.System = class System {
		constructor(target = null, pre = () => {}, post = () => {}) {
			this.items = [];
			this.target = target;
			this.pre = pre;
			this.post = post;
		}
		add(component) {
			if (this.items.contains(component)) {
				return this;
			}
			this.pre();
			this.items.add(component);
			component.enable(this.target);
			this.post();
			return this;
		}
		remove(component) {
			if (!this.items.contains(component)) {
				return this;
			}
			this.pre();
			component.disable(this.target);
			this.items.remove(component);
			this.post();
			return this;
		}
		get(type) {
			for (var i = 0; i < this.items.length; i++) {
				if (this.items[i] instanceof type) {
					return this.items[i];
				}
			}
			return null;
		}
		getAll(type) {
			const res = [];
			for (var i = 0; i < this.items.length; i++) {
				if (this.items[i] instanceof type) {
					res.add(this.items[i]);
				}
			}
			return res;
		}
		has(type) {
			return this.get(type) != null;
		}
	}
	m.Component = class Component {
		enable(target) {

		}
		disable(target) {

		}
	}

})(rigid.component = {});;(function(m) {
	
	m.Asset = class Asset {
        constructor() {

        }
    }
    m.Sound = class Sound extends m.Asset {
        constructor({source, loop = false}) {
			super();
			source.loop(loop);
			this.source = source;
        }
    }
    m.Sprite = class Sprite extends m.Asset {
        constructor({texture, alias = false}) {
			super();
			if (!alias) texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
			this.texture = texture;
        }
	}
	m.single = function(item, callback) {
        if (item.length != 2 && item.length != 3) {
            throw new Error("Unexpected asset definition size.");
        }
        if (item[0] == "sprite") {
            if (typeof item[1] != "string") {
                throw new Error("Sprite definition type unknown. Use string.");
            } else {
				const texture = PIXI.Texture.from(item[1]);
				if (item.length == 3) {
					callback(new m.Sprite({
						texture: texture,
						...item[2]
					}));
				} else {
					callback(new m.Sprite({
						texture: texture
					}));
				}
            }
        } else if (item[0] == "sound") {
            if (typeof item[1] != "string" && !Array.isArray(item[1])) {
                throw new Error("Sound definition type unknown. Use string or array.");
            } else {
				if (item.length == 3) {
					const source = new Howl({
						src: Array.isArray(item[1]) ? item[1] : [item[1]]
					});
					callback(new m.Sound({
						source: source,
						...item[2]
					}));
				} else {
					const source = new Howl({
						src: Array.isArray(item[1]) ? item[1] : [item[1]]
					});
					callback(new m.Sound({
						source: source
					}));
				}
            }
        } else {
            throw new Error("Unexpected asset definition type.");
        }
    }
	m.multiple = function(assets, callback) {
        const results = {};
        const list = Object.keys(assets);
        var loading = 0;

        function loadNext() {
            loading++;
            if (loading > list.length) {
                callback(results);
            } else {
                const i = loading - 1;
                m.single(assets[list[i]], asset => {
                    results[list[i]] = asset;
                    loadNext();
                })
            }
        }
        loadNext();
	}
	
})(rigid.asset = {});;(function(m) {
	
	m.sprite = function(game, sprite, transform) {
		const res = m.object(game, transform);
		res.components.add(new rigid.component.render.Sprite({
			sprite: sprite
		}));
		return res;
	}
	m.rect = function(game, color, transform) {
		const res = m.object(game, transform);
		res.components.add(new rigid.component.render.Rect({
			color: color
		}));
		res.components.add(new rigid.component.collide.Rect);
		return res;
	}
	m.ellipse = function(game, color, transform) {
		const res = m.object(game, transform);
		res.components.add(new rigid.component.render.Ellipse({
			color: color
		}));
		return res;
	}
	m.object = function(game, transform) {
		const res = new game.Entity;
		res.components.add(new rigid.component.Transform(transform));
		return res;
	}
	m.game = function({canvas = rigid.dom.id("canvas"), auto = true} = {}) {
		const res = new rigid.game.Game;
		res.components.add(new rigid.component.Application({
			canvas: canvas, background: 0x000000
		}));
		res.components.add(new rigid.component.Simulation);
		if (auto) res.timer.start();
		return res;
	}

})(rigid.simple = {});;(function(m) {
	
})(rigid.network = {});;(function(m) {

	m.id = function(id) {
		return document.getElementById(id);
	}

	m.canvasPosition = function canvasPosition(e, canvas) {
		var rect = canvas.getBoundingClientRect();
		return {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top
		};
	}

})(rigid.dom = {});;(function(m) {
	
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

})(rigid.component);;(function(m) {
	
	m.Simulation = class Simulation extends m.Component {
		constructor({} = {}) {
			super();
			this.system = new Collisions();
		}
		enable(game) {
			this.ticker = () => {
				this.system.update();
			};
			game.events.register("tick", this.ticker);
		}
		disable(game) {
			game.events.unregister("tick", this.ticker);
		}
	}

})(rigid.component);;(function(m) {

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

})(rigid.component);;(function(m) {

	m.Renderer = class Renderer extends m.Component {
		constructor({x = 0, y = 0, w = 1, h = 1, angle = 0, order = 0} = {}) {
			super();
			this.x = x;
			this.y = y;
			this.w = w;
			this.h = h;
			this.angle = angle;
			this.container = new PIXI.Container();
			this.container.zIndex = order;
		}
		enable(entity) {
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
					app.stage.sortChildren();
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
rigid.component.render = {};;(function(m) {

	m.Collider = class Collider extends m.Component {
		constructor({x = 0, y = 0, w = 1, h = 1, angle = 0} = {}) {
			super();
			this.x = x;
			this.y = y;
			this.w = w;
			this.h = h;
			this.angle = angle;
		}
		enable(entity) {
			this.bodyAdder = () => {
				const sim = entity.game.components.get(rigid.component.Simulation);
				if (sim != null) {
					sim.system.insert(this.body);
				}
			}
			this.bodyRemover = () => {
				const sim = entity.game.components.get(rigid.component.Simulation);
				if (sim != null) {
					sim.system.remove(this.body);
				}
			}
			entity.events.register("add", this.bodyAdder);
			entity.events.register("remove", this.bodyRemover);
			entity.events.register("postupdate", this.bodyUpdater);
			if (entity.exists) {
				this.bodyAdder();
			}
			this.bodyUpdater();
			entity.collision = other => {
				const collider = other.components.get(rigid.component.Collider);
				if (collider == null) return false;
				return this.body.collides(collider.body);
			}
		}
		disable(entity) {
			if (entity.exists) {
				this.bodyRemover();
			}
			entity.events.unregister("add", this.bodyAdder);
			entity.events.unregister("remove", this.bodyRemover);
			entity.events.unregister("postupdate", this.bodyUpdater);
		}
	}

})(rigid.component);
rigid.component.collide = {};;(function(m) {

	// We extend the base renderer component, in renderer.js
	m.Graphics = class Graphics extends rigid.component.Renderer {
		constructor(options) {
			super(options);
			this.graphics = new PIXI.Graphics();
		}
		enable(entity) {
			super.enable(entity);
			this.graphicsAdder = () => {
				this.container.addChild(this.graphics);
			};
			this.graphicsRemover = () => {
				this.container.removeChild(this.graphics);
			};
			entity.events.register("add", this.graphicsAdder);
			entity.events.register("remove", this.graphicsRemover);
			if (entity.exists) {
				this.graphicsAdder();
			}
		}
		disable(entity) {
			super.disable(entity);
			if (entity.exists) {
				this.graphicsRemover();
			}
			entity.events.unregister("add", this.graphicsAdder);
			entity.events.unregister("remove", this.graphicsRemover);
		}
	}

})(rigid.component.render);;(function(m) {

	m.Rect = class Rect extends m.Graphics {
		constructor({color = 0xFFFFFF, ...options} = {}) {
			super(options);
			this.graphics.beginFill(color);
			this.graphics.drawRect(-0.5, -0.5, 1, 1);
		}
	}

})(rigid.component.render);;(function(m) {

	m.Ellipse = class Ellipse extends m.Graphics {
		constructor({color = 0xFFFFFF, resolution = 64, ...options} = {}) {
			super(options);
			this.graphics.beginFill(color);
			this.graphics.drawEllipse(0, 0, resolution / 2, resolution / 2);
			this.graphics.scale.set(1 / resolution, 1 / resolution);
		}
	}

})(rigid.component.render);;(function(m) {

	// We extend the base renderer component, in renderer.js
	m.Sprite = class Sprite extends rigid.component.Renderer {
		constructor({sprite, ...options} = {}) {
			super(options);
			this.sprite = new PIXI.Sprite(sprite.texture);
			this.sprite.width = 1;
			this.sprite.height = 1;
			this.sprite.anchor.set(0.5, 0.5);
		}
		enable(entity) {
			super.enable(entity);
			this.spriteAdder = () => {
				this.container.addChild(this.sprite);
			};
			this.spriteRemover = () => {
				this.container.removeChild(this.sprite);
			};
			entity.events.register("add", this.spriteAdder);
			entity.events.register("remove", this.spriteRemover);
			if (entity.exists) {
				this.spriteAdder();
			}
		}
		disable(entity) {
			super.disable(entity);
			if (entity.exists) {
				this.spriteRemover();
			}
			entity.events.unregister("add", this.spriteAdder);
			entity.events.unregister("remove", this.spriteRemover);
		}
	}

})(rigid.component.render);;(function(m) {

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

})(rigid.component.render);;(function(m) {

	const CircBody = Circle;
	m.Circle = class Circle extends rigid.component.Collider {
		constructor({...options} = {}) {
			super(options);
			this.body = new CircBody(0, 0, 0.5);
		}
		enable(entity) {
			this.bodyUpdater = () => {
				if (!entity.components.has(rigid.component.Transform)) return;
				this.body.x = entity.x + this.x;
				this.body.y = entity.y + this.y;
				this.body.scale = entity.w * this.w;
			}
			super.enable(entity);
		}
	}

})(rigid.component.collide);;(function(m) {

	const PolyBody = Polygon;
	m.Polygon = class Polygon extends rigid.component.Collider {
		constructor({points = [], ...options} = {}) {
			super(options);
			this.body = new PolyBody(0, 0, points);
		}
		enable(entity) {
			this.bodyUpdater = () => {
				if (!entity.components.has(rigid.component.Transform)) return;
				this.body.x = entity.x + this.x;
				this.body.y = entity.y + this.y;
				this.body.scale_x = entity.w * this.w;
				this.body.scale_y = entity.h * this.h;
				this.body.angle = rigid.math.radians(entity.angle + this.angle);
			}
			super.enable(entity);
		}
	}

})(rigid.component.collide);;(function(m) {

	m.Rect = class Rect extends m.Polygon {
		constructor({...options} = {}) {
			super({
				points: [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]],
				...options
			});
		}
	}

})(rigid.component.collide);;;(function(m) {
	
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

})(rigid.game = {});;if (rigid.platform.client) {
	PIXI.utils.skipHello();
} else {
	module.exports = rigid;
}