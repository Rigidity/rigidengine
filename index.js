const game = rigid.simple.game();

const items = [];
function recurse(target) {
	const entity = rigid.simple.rect(game, Math.random() * 0xFFFFFF, {
		w: 32, h: 32, x: 10
	});
	target.add(entity);
	items.push(entity);
	setTimeout(() => recurse(entity), 1000);
}
game.events.register("tick", () => {
	items.forEach(item => item.angle++);
});

recurse(game);