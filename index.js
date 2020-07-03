window.onerror = function(...e) {
	alert(e);
}

function setup() {
	const game = new rigid.game.Game;
	game.components.add(new rigid.component.Application);
	game.components.add(new rigid.component.Simulation);
	game.background = 0x000022;

	const sun = new rigid.entity.Entity;
	sun.components.add(new rigid.component.Transform);
	sun.components.add(new rigid.component.render.Ellipse({
		color: 0xEDED00
	}));
	sun.components.add(new rigid.component.collide.Circle);
	sun.w = sun.h = 56;

	const ship = new rigid.entity.Entity;
	ship.components.add(new rigid.component.Transform);
	ship.components.add(new rigid.component.render.Rect({
		color: 0xFFDDEE
	}));
	ship.components.add(new rigid.component.collide.Rect);
	ship.w = 30;
	ship.h = 24;
	ship.x = -game.w / 2.6;
	ship.angle = -115;

	var extra = 0;
	var gravity = 1;

	const rocks = [];

	function rock() {
		const r = new rigid.entity.Entity;
		r.components.add(new rigid.component.Transform);
		r.components.add(new rigid.component.render.Ellipse({
			color: 0xAAAAAA
		}));
		r.w = r.h = 20;
		var side = Math.random();
		if (side >= 0.75) {
			side = "top";
		} else if (side >= 0.5) {
			side = "left";
		} else if (side >= 0.25) {
			side = "bottom";
		} else {
			side = "right";
		}
		if (side == "top") {
			r.x = Math.random() * game.w - game.w / 2;
			r.y = -game.h / 2;
		}
		if (side == "bottom") {
			r.x = Math.random() * game.w - game.w / 2;
			r.y = game.h / 2;
		}
		if (side == "left") {
			r.y = Math.random() * game.h - game.h / 2;
			r.x = -game.w / 2;
		}
		if (side == "right") {
			r.y = Math.random() * game.h - game.h / 2;
			r.x = game.w / 2;
		}
		r.components.add(new rigid.component.collide.Circle);
		game.add(r);
		rocks.push(r);
	}

	game.events.register("tick", () => {
		if (Math.random() > 0.982) {
			rock();
		}
		rocks.slice().forEach(r => {
			r.angle = rigid.math.angleBetween(r, sun);
			rigid.math.moveTowards(r, r.angle, 2.75);
			if (r.collision(ship)) {
				gameover();
			} else if (r.collision(sun)) {
				game.remove(r);
				sun.w++;
				sun.h++;
				rocks.splice(rocks.indexOf(r), 1)
			}
		});
		if (ship.x < -game.w / 2 - 64) {
			gameover();
		}
		if (ship.y < -game.h / 2 - 64) {
			gameover();
		}
		if (ship.x > game.w / 2 + 64) {
			gameover();
		}
		if (ship.y > game.h / 2 + 64) {
			gameover();
		}
	});

	const score = new rigid.entity.Entity;
	score.components.add(new rigid.component.Transform);
		score.components.add(new rigid.component.render.Text({
			size: 24,
			text: "0",
			color: 0x000000
		}));
		score.order = 1;
		game.add(score);
	var points = 0;

	function gameover() {
		const overlay = new rigid.entity.Entity;
		overlay.components.add(new rigid.component.Transform);
		overlay.components.add(new rigid.component.render.Rect({
			color: 0x440044
		}));
		overlay.opacity = 0.65;
		overlay.w = game.w;
		overlay.h = game.h;
		game.events.register("resize", () => {
			overlay.w = game.w;
			overlay.h = game.h;
		});
		game.add(overlay);
		const text = new rigid.entity.Entity;
		text.components.add(new rigid.component.Transform);
		text.components.add(new rigid.component.render.Text({
			size: 44,
			text: "Fatality\n\nClick to Play",
			color: 0xFF8888
		}));
		game.add(text);
		game.events.register("click", () => {
			game.destroy();
			setup();
		});
		game.timer.stop();
	}

	game.events.register("tick", () => {
		const gravityAngle = rigid.math.angleBetween(ship, sun);
		rigid.math.moveTowards(ship, gravityAngle, gravity);
		ship.angle += 1.7;
		rigid.math.moveTowards(ship, ship.angle, 1 + extra);
		extra *= 0.97;
		if (ship.collision(sun)) {
			gameover();
		}
		points++;
		score.text = "" + Math.floor(points / 6);
	});
	game.events.register("click", () => {
		extra += 4;
	});

	game.add(sun);
	game.add(ship);

	game.timer.start();
}

setup();