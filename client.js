
class Controller extends rigid.game.Component {
	constructor({
		left = 'a', right = 'd', up = 'w', down = 's',
		speed = 4
	} = {}) {
		super();
		this.listener.register("add", e => {
			e.data.motion = ev => {
				if (e.object.game.key[left]) e.object.x -= speed;
				if (e.object.game.key[right]) e.object.x += speed;
				if (e.object.game.key[up]) e.object.y -= speed;
				if (e.object.game.key[down]) e.object.y += speed;
			};
			e.object.listener.register("tick", e.data.motion);
		});
		this.listener.register("remove", e => {
			e.object.listener.unregister("tick", e.data.motion);
		});
	}
}
const game = new rigid.game.Game();
game.components.add(new rigid.component.Application({
    canvas: rigid.dom.id("canvas"),
    background: 0x000000
}));
const test = new game.Entity();
test.w = test.h = 64;
test.components.add(new rigid.component.RectRenderer({
	order: 1
}));
test.components.add(new Controller());
const item = new game.Entity();
item.w = item.h = 0.5;
item.components.add(new rigid.component.RectRenderer({
	color: 0x005500
}));
test.add(item);
const line = new game.Entity();
line.components.add(new rigid.component.RectRenderer({
	color: 0xFF00FF,
	order: 10000
}));
item.add(line);
test.listener.register("tick", () => {
	test.angle += 1;
	line.w = line.h = 12;
	item.w = 100;
	item.h = 200;
	item.x = 32;
	item.y = 64;
});
game.add(test);
game.start();
game.background = 0xAA0000;
