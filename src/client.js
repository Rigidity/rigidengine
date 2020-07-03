(function(m) {
	
	m.Client = class Client {
		constructor() {
			this.events = new rigid.event.Listener;
		}
		send(name, packet) {
			this.io.emit("packet$" + name, packet);
		}
		receive(name, callback) {
			this.io.on("packet$" + name, callback);
		}
		unreceive(name, callback) {
			this.io.on("packet$" + name, callback);
		}
		init() {
			this.io = io();
			this.events.trigger("join");
			this.io.on("disconnect", () => {
				this.events.trigger("leave");
			});
		}
	}

})(rigid.network.client = {});