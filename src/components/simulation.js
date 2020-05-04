(function(m) {
	
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

})(rigid.component);