const rigid = {};
(function() {

	// A reference back to the engine itself.
	const engine = this;

	// The mathematical module.
	const math = {};
	engine.math = math;

	// A module with information about the current platform.
	const platform = {};
	engine.platform = platform;

	// General utilities that make writing code easier.
	const utils = {};
	engine.utils = utils;

	// Module for manipulation of html elements.
	const dom = {};
	engine.dom = dom;

	// Module that holds the game class and other related things.
	const game = {};
	engine.game = game;

	// A module that simplifies the entity system for easy use.
	const simple = {};
	engine.simple = simple;

	// This module allows for the easy loading of assets.
	const asset = {};
	engine.asset = asset;

	// Coming Soon: Client networking module.
	const client = {};
	engine.client = client;
	
	// Coming Soon: Server networking module.
	const server = {};
	engine.server = server;

	// Coming Soon: Mutual networking module.
	const net = {};
	engine.net = net;

	// Is called after everything else in the file.
	function initialize() {
		// Prevent pixi.js from promoting itself.
		PIXI.utils.skipHello();
	}

	// Some ease of use built in functions.
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
	Array.prototype.add = Array.prototype.push;

	// The game class that contains the entire game.
	game.Game = class Game {
		constructor({} = {}) {

			// The game's event listener.
			this.listener = new utils.Listener();

			// A holder for game components.
			this.components = new game.System({object: this});

			// The list of entities in the game.
			this.entities = [];

			// The timer that represents the game loop.
			this.timer = new utils.Timer({
				fps: 60, // 60 frames per second.
				callback: delta => {

					// Tick the game itself.
					this.listener.trigger("tick", {
						delta: delta
					});

					// Tick every entity in the game recursively.
					this.entities.forEach(entity => {
						this.recurseEntity(entity, "tick", false, {
							delta: delta
						});
					});

				}
			});
			// A reference to the game object.
			const thegame = this;
			this.Entity = class Entity {
				constructor({raw = false} = {}) {

					// Store the game object in the entity.
					this.game = thegame;

					// The entity event listener.
					this.listener = new utils.Listener();

					// The entity's set of components.
					this.components = new game.System({object: this});

					// The parent entity.
					this.parent = null;

					// Children entities.
					this.children = [];

					if (!raw) {
						// Add some default components.
						this.components.add(new component.Transform());
					}

				}

				// Adds an entity as a child.
				add(entity) {
					if (this.children.contains(entity) || entity.parent != null) {
						return this;
					}
					this.children.add(entity);
					entity.parent = this;
					entity.listener.trigger("link", {
						entity: this
					});
					this.game.recurseEntity(this, "update", true);
					return this;
				}

				// Removes an entity as a child.
				remove(entity) {
					if (!this.children.contains(entity) || entity.parent != null) {
						return this;
					}
					entity.listener.trigger("unlink", {
						entity: this
					});
					this.children.remove(entity);
					entity.parent = null;
					this.game.recurseEntity(this, "update", true);
					return this;
				}

			}
		}
		recurseEntity(entity, name, after = false, data = {}) {
			if (!after) {
				entity.listener.trigger(name, data);
			}
			entity.children.forEach(child => {
				this.recurseEntity(child, name, after, data);
			});
			if (after) {
				entity.listener.trigger(name, data);
			}
		}
		add(entity) {
			if (this.entities.contains(entity)) {
				return this;
			}
			this.entities.add(entity);
			this.recurseEntity(entity, "add", false);
			return this;
		}
		remove(entity) {
			if (!this.entities.contains(entity)) {
				return this;
			}
			this.recurseEntity(entity, "remove", true);
			this.entities.remove(entity);
			return this;
		}
		start() {
			this.timer.start();
			this.listener.trigger("start");
		}
		stop() {
			this.listener.trigger("stop");
			this.timer.stop();
		}
	}
	game.Component = class Component {
		constructor() {
			this.listener = new utils.Listener();
			this.requires = [];
		}
	}
	game.System = class System {
		constructor(info = {}) {
			this.items = new Map();
			this.info = info;
		}
		get(type) {
			for (const component of this.items.keys()) {
				if (component instanceof type) {
					return component;
				}
			}
			return null;
		}
		data(type) {
			for (const [component, data] of this.items.entries()) {
				if (component instanceof type) {
					return data;
				}
			}
			return null;
		}
		getAll(type) {
			const res = [];
			for (const component of this.items.keys()) {
				if (component instanceof type) {
					res.add(component);
				}
			}
			return res;
		}
		allData(type) {
			const res = [];
			for (const [component, data] of this.items.entries()) {
				if (component instanceof type) {
					res.add(data);
				}
			}
			return res;
		}
		has(type) {
			return this.get(type) != null;
		}
		clear() {
			this.items.clear();
		}
		add(component) {
			if (this.items.has(component)) {
				return this;
			}
			component.requires.forEach(req => {
				if (!this.has(req)) {
					throw new Error("Component " + req.prototype.name + " is required.");
				}
			});
			const data = {};
			this.items.set(component, data);
			component.listener.trigger("add", {
				...this.info, data: data
			});
			return this;
		}
		remove(component) {
			if (!this.items.has(component)) {
				return this;
			}
			const data = this.items.get(component);
			component.listener.trigger("remove", {
				...this.info, data: data
			});
			this.items.delete(component);
			this.items.forEach(component => {
				component.requires.forEach(req => {
					if (!this.has(req)) {
						throw new Error("Component " + req.prototype.name + " is required.");
					}
				});
			});
			return this;
		}
	}

	simple.sprite = function(game, sprite, x = 0, y = 0, w = 64, h = 64, angle = 0) {
		const square = new game.Entity();
		square.x = x;
		square.y = y;
		square.w = w;
		square.h = h;
		square.angle = angle;
		square.components.add(new component.SpriteRenderer({
			sprite: sprite
		}));
		return square;
	}
	simple.rect = function(game, color = 0xFFFFFF, x = 0, y = 0, w = 64, h = 64, angle = 0) {
		const square = new game.Entity();
		square.x = x;
		square.y = y;
		square.w = w;
		square.h = h;
		square.angle = angle;
		square.components.add(new component.RectRenderer({
			color: color
		}));
		return square;
	}
	simple.ellipse = function(game, color = 0xFFFFFF, x = 0, y = 0, w = 64, h = 64, angle = 0) {
		const square = new game.Entity();
		square.x = x;
		square.y = y;
		square.w = w;
		square.h = h;
		square.angle = angle;
		square.components.add(new component.CircleRenderer({
			color: color
		}));
		return square;
	}

	utils.Listener = class Listener {
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
	utils.Timer = class Timer {
        constructor({callback, fps} = {}) {
            this.fps = fps;
            this.state = false;
            this.extra = 0;
			this.callback = callback;
			this.previous = utils.time();
        }
        restart() {
            this.stop();
            this.start();
        }
        start() {
            this.state = true;
			this.extra = 0;
			this.previous = utils.time();
            this._perform();
            return this;
        }
        stop() {
            this.state = false;
            return this;
        }
        _perform() {
            var time = utils.time();
            var amount = 1000 / this.fps;
            setTimeout(() => {
                if (!this.state) {
                    return;
                }
                this.extra += utils.time() - time;
                while (this.extra >= amount) {
					this.extra -= amount;
					const delta = utils.time() - this.previous;
					this.callback(delta);
					this.previous = utils.time();
                }
                this._perform();
            }, amount);
        }
    }
	utils.time = function() {
        return new Date().getTime();
	}
	utils.property = function(target, name, getter, setter) {
		if (target.hasOwnProperty(name)) {
			throw new Error("Property " + name + " already exists.");
		}
		Object.defineProperty(target, name, {
			get: getter,
			set: setter
		});
	}
	utils.unproperty = function(target, name) {
		if (!target.hasOwnProperty(name)) {
			throw new Error("Property " + name + " doesn't exist.");
		}
		delete target[name];
	}

	asset.Asset = class Asset {
        constructor() {

        }
    }
    asset.Sound = class Sound extends asset.Asset {
        constructor({source, loop = false}) {
			super();
			source.loop(loop);
			this.source = source;
        }
    }
    asset.Sprite = class Sprite extends asset.Asset {
        constructor({texture, alias = false}) {
			super();
			if (!alias) texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
			this.texture = texture;
        }
	}
	asset.single = function(item, callback) {
        if (item.length != 2 && item.length != 3) {
            throw new Error("Unexpected asset definition size.");
        }
        if (item[0] == "sprite") {
            if (typeof item[1] != "string") {
                throw new Error("Sprite definition type unknown. Use string.");
            } else {
				const texture = PIXI.Texture.from(item[1]);
				if (item.length == 3) {
					callback(new asset.Sprite({
						texture: texture,
						...item[2]
					}));
				} else {
					callback(new asset.Sprite({
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
					callback(new asset.Sound({
						source: source,
						...item[2]
					}));
				} else {
					const source = new Howl({
						src: Array.isArray(item[1]) ? item[1] : [item[1]]
					});
					callback(new asset.Sound({
						source: source
					}));
				}
            }
        } else {
            throw new Error("Unexpected asset definition type.");
        }
    }
	asset.multiple = function(assets, callback) {
        const results = {};
        const list = Object.keys(assets);
        var loading = 0;

        function loadNext() {
            loading++;
            if (loading > list.length) {
                callback(results);
            } else {
                const i = loading - 1;
                asset.single(assets[list[i]], asset => {
                    results[list[i]] = asset;
                    loadNext();
                })
            }
        }
        loadNext();
    }
	
	dom.id = function(id) {
		return document.getElementById(id);
	}
	dom.query = function(query) {
		return document.querySelector(query);
	}
	dom.queries = function(queries) {
		return document.querySelector(queries);
	}

	// Math Utilities
	math.radians = function(degrees) {
        return degrees * Math.PI / 180;
    }
    math.degrees = function(radians) {
        return radians * 180 / Math.PI;
	}
	math.distance = function(a, b) {
        return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
	}
	math.angleBetween = function(a, b) {
        var dy = b.y - a.y;
        var dx = b.x - a.x;
        var theta = Math.atan2(dy, dx);
        theta *= 180 / Math.PI;
        return theta;
    }
    math.moveTowards = function(point, angle, speedX, speedY = speedX) {
        point.x += speedX * Math.cos(angle * Math.PI / 180);
        point.y += speedY * Math.sin(angle * Math.PI / 180);
    }
    math.rotatePoint = function(cx, cy, x, y, angle) {
        var radians = (Math.PI / 180) * -angle,
            cos = Math.cos(radians),
            sin = Math.sin(radians),
            nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
            ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
        return [nx, ny];
    }
    math.rotatePolygon = function(cx, cy, polygon, angle) {
        var res = [];
        var polyLength = polygon.length;
        for (var i = 0; i < polyLength; i++) {
            res.push(rotatePoint(cx, cy, polygon[i][0], polygon[i][1], angle));
        }
        return res;
    }
	math.clamp = function(num, a, b) {
        return num > b ? b : (num < a ? a : num);
	}
	math.round = function(num, decimal = 1) {
		/*// decimal = decimal place. example: decimal = 10:  10ths aka 0.1s
		if (decimal%10 != 0 && decimal != 1) { throw new Error("math.round decimal must be a power of 10"); }
		if (decimal < 10) { decimal = 1 / decimal; }
		
		return (num / decimal % decimal) > 0.5 ? ((num / decimal) + (1 - (num / decimal % decimal))) : ((num / decimal) + (num / decimal % decimal));
		*/
		return Math.round(num * Math.pow(10, decimal)) / Math.pow(10, decimal);
	}

	platform.isMobile = isMobile();
	platform.isTablet = !platform.isMobile && isMobileOrTablet();
	platform.isDesktop = !platform.isMobile && !platform.isTablet;

	function isMobile() {
        let check = false;
        (function(a) {
            if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
        })(navigator.userAgent || navigator.vendor || window.opera);
        return check;
    }
    function isMobileOrTablet() {
        let check = false;
        (function(a) {
            if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
        })(navigator.userAgent || navigator.vendor || window.opera);
        return check;
    }

    initialize();
	
}.bind(
	typeof module != "undefined" &&
	module.exports ?
	module.exports :
	rigid
))();