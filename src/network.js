(function(m) {
	
	m.serialize = function(entity) {
		const res = {};
		entity.game.events.trigger("serialize", {
			entity: entity,
			data: res
		});
		entity.events.trigger("serialize", res);
		return res;
	}
	m.deserialize = function(game, data) {
		const res = new game.Entity;
		game.events.trigger("deserialize", {
			entity: res, data: data
		});
		res.events.trigger("deserialize", data);
		return res;
	}

})(rigid.network = {});