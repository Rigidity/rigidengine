(function(m) {
	
	m.rect = function(game, color, transform) {
		const res = m.object(game, transform);
		res.components.add(new rigid.component.render.Rect({
			color: color
		}));
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
		if (auto) res.timer.start();
		return res;
	}

})(rigid.simple = {});