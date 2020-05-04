(function(m) {
	
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

})(rigid.simple = {});