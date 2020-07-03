const rigid = require("./dist/rigid.js");

const game = new rigid.game.Game;
game.components.add(new rigid.component.Simulation);

const gen = new rigid.utils.Identifier();

const quantity = 16384;

for (var i = 0; i < quantity; i++) {
	const wall = new rigid.entity.Entity;
	wall.components.add(new rigid.component.Transform({
		w: 16, h: 16, x: Math.random() * 16384 - 8192, y: Math.random() * 16384 - 8192
	}));
	wall.components.add(new rigid.component.collide.Rect);
	game.add(wall);
}

game.timer.start();
console.log("Game initialized.");

const server = new rigid.network.server.Server({
	port: 25565, limit: 10
});
server.events.register("join", client => {
	console.log("User has joined.");
	client.entity = new rigid.entity.Entity;
	client.entity.components.add(new rigid.component.Transform({
		w: 48, h: 48, x: Math.random() * 512 - 256, y: Math.random() * 512 - 256
	}));
	client.entity.components.add(new rigid.component.collide.Rect);
	game.add(client.entity);
	client.ticker = () => {
		const data = {
			world: [],
			player: client.entity.id
		};
		game.entities.forEach(entity => {
			if (rigid.math.distance(client.entity, entity) > 1024) return;
			data.world.push({
				x: entity.x, y: entity.y,
				w: entity.w, h: entity.h,
				angle: entity.angle,
				id: entity.id
			});
		});
		server.send(client, "objects", data);
	};
	game.events.register("tick", client.ticker);
	server.receive(client, "motion", motion => {
		client.entity.x += motion[0];
		client.entity.y += motion[1];
	});
});
server.events.register("leave", client => {
	game.events.unregister("tick", client.ticker);
	game.remove(client.entity);
	console.log("User has left.");
});
server.init("./", false);
setInterval(() => console.log(game.entities.length, Object.values(game.entityMap).length), 1000);