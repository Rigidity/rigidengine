function newGame() {
	rigid.asset.multiple({
		virus: ["sprite", "virus.png"],
		shield: ["sprite", "shield.png", {alias: true}]
	}, assets => {
		const game = new rigid.game.Game;
		game.components.add(new rigid.component.Application);
		game.components.add(new rigid.component.Simulation);
		game.background = 0xFFFFCC
		var points = 0;
		const score = new game.Entity;
		score.components.add(new rigid.component.Transform);
		score.components.add(new rigid.component.render.Text({
			text: points, color: 0, size: 32
		}));
		game.add(score);
		const repositionScore = () => {
			score.x = -game.w / 2 + 48;
			score.y = -game.h / 2 + 48;
		};
		repositionScore();
		game.events.register("resize", repositionScore);
		var scoreAmount = 0;
		game.events.register("tick", () => {
			scoreAmount++;
			if (scoreAmount >= 5) {
				points++;
				scoreAmount = 0;
			}
			score.text = "" + points;
		});
		const player = new game.Entity;
		player.components.add(new rigid.component.Transform({
			w: 64, h: 64
		}));
		player.components.add(new rigid.component.render.Ellipse({
			color: 0,
			order: 1
		}));
		player.components.add(new rigid.component.collide.Circle);
		player.fading = false;
		const basespeed = 0.9;
		var speed = basespeed;
		var factor = 0.87;
		var motionX = 0;
		var motionY = 0;
		var easiness = 0.984;
		player.events.register("tick", () => {
			if (player.fading > 0) {
				player.w -= 0.205;
				player.h -= 0.205;
				speed += 0.0062;
				player.fading--;
			} else {
				player.fading = 0;
			}
			player.opacity = player.w / 64;
			if (player.w <= 16 || player.h <= 16) {
				const overlay = new game.Entity;
				overlay.components.add(new rigid.component.Transform);
				overlay.components.add(new rigid.component.render.Rect({
					color: 0
				}));
				overlay.opacity = 0.5;
				const resizeOverlay = () => {
					overlay.w = game.w;
					overlay.h = game.h;
				};
				resizeOverlay();
				game.events.register("resize", resizeOverlay);
				game.add(overlay);
				const message = new game.Entity;
				message.components.add(new rigid.component.Transform({
					y: -32
				}));
				message.components.add(new rigid.component.render.Text({
					text: "Fatality", color: 0xFF0000, size: 64, order: 2
				}));
				game.add(message);
				const message2 = new game.Entity;
				message2.components.add(new rigid.component.Transform({
					y: 48
				}));
				message2.components.add(new rigid.component.render.Text({
					text: "Score: " + points + "\nClick to Restart", color: 0xFFFFFF, size: 32, order: 2
				}));
				game.add(message2);
				game.remove(score);
				game.remove(player);
				game.events.register("click", () => {
					game.destroy();
					newGame();
				});
				game.timer.stop();
			}
		});
		game.add(player);
		class Virus extends game.Entity {
			constructor(x, y) {
				super();
				this.components.add(new rigid.component.Transform);
				this.components.add(new rigid.component.render.Sprite({
					sprite: assets.virus
				}));
				this.components.add(new rigid.component.collide.Circle);
				this.x = x;
				this.y = y;
				const size = Math.random() * 32 + 24;
				this.angry = size < 32;
				this.w = size;
				this.h = size;
				this.angle = Math.random() * 360;
				this.fading = false;
				this.events.register("tick", () => {
					if (this.fading) {
						this.opacity -= 0.03;
					}
					if (this.opacity <= 0) {
						game.remove(this);
						viruses.remove(this);
					}
					if (this.angry) {
						this.angle = rigid.math.angleBetween(this, player);
						rigid.math.moveTowards(this, this.angle, 0.4);
					}
				});
			}
		}
		class Shield extends game.Entity {
			constructor(x, y) {
				super();
				this.components.add(new rigid.component.Transform);
				this.components.add(new rigid.component.render.Sprite({
					sprite: assets.shield
				}));
				this.components.add(new rigid.component.collide.Rect);
				this.x = x;
				this.y = y;
				const size = Math.random() * 16 + 40;
				this.w = size;
				this.h = size;
				this.fading = false;
				this.events.register("tick", () => {
					if (this.fading) {
						this.opacity -= 0.03;
					}
					if (this.opacity <= 0) {
						game.remove(this);
						shields.remove(this);
					}
				});
			}
		}
		const viruses = [];
		const shields = [];
		function makeVirus() {
			const virus = new Virus(
				Math.random() * game.w - game.w / 2,
				Math.random() * game.h - game.h / 2
			);
			game.add(virus);
			var removed = false;
			if (player.collision(virus)) {
				removed = true;
			} else {
				viruses.forEach(other => {
					if (!removed && virus.collision(other)) {
						removed = true;
					}
				});
				shields.forEach(other => {
					if (!removed && virus.collision(other)) {
						removed = true;
					}
				});
			}
			if (removed) {
				game.remove(virus);
			} else {
				viruses.add(virus);
			}
		}
		function makeShield() {
			const shield = new Shield(
				Math.random() * game.w - game.w / 2,
				Math.random() * game.h - game.h / 2
			);
			game.add(shield);
			var removed = false;
			if (player.collision(shield)) {
				removed = true;
			} else {
				viruses.forEach(other => {
					if (!removed && shield.collision(other)) {
						removed = true;
					}
				});
				shields.forEach(other => {
					if (!removed && shield.collision(other)) {
						removed = true;
					}
				});
			}
			if (removed) {
				game.remove(shield);
			} else {
				shields.add(shield);
			}
		}
		for (var i = 0; i < 12; i++) {
			makeVirus();
		}
		for (var i = 0; i < 1; i++) {
			makeShield();
		}
		game.events.register("tick", () => {
			if (Math.random() > easiness) makeVirus();
			if (Math.random() > 0.992) makeShield();
			const point = new Point(game.mouseX, game.mouseY);
			const res = {
				x: motionX, y: motionY
			};
			rigid.math.moveTowards(res, rigid.math.angleBetween(player, point), rigid.math.clamp(rigid.math.distance(player, point) / 512 * speed, 0, speed));
			motionX = res.x;
			motionY = res.y;
			player.x += motionX;
			player.y += motionY;
			motionX *= factor;
			motionY *= factor;
			viruses.forEach(virus => {
				if (!virus.fading && player.collision(virus)) {
					virus.fading = true;
					player.fading = 30;
				}
			});
			shields.forEach(shield => {
				if (!shield.fading && player.collision(shield)) {
					shield.fading = true;
					player.fading = 0;
					speed = (speed * 4 + basespeed) / 5;
					viruses.forEach(virus => {
						if (rigid.math.distance(virus, shield) <= 200) {
							virus.fading = true;
						}
					});
					easiness *= 0.996;
				}
			});
		});
		game.events.register("click", () => {
			const point = new Point(game.mouseX, game.mouseY);
			viruses.forEach(virus => {
				if (!virus.fading && virus.components.get(rigid.component.Collider).body.collides(point)) {
					virus.fading = true;
					easiness *= 0.996;
				}
			});
		});
		game.timer.start();
	});
}
newGame();