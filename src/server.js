(function(m) {

	m.Server = class Server {

		constructor({port = 8765, limit = -1} = {}) {
			this.port = port;
			this.limit = limit;
			this.connections = {};
			this.events = new rigid.event.Listener;
		}
		broadcast(name, packet) {
			this.io.emit("packet$" + name, packet);
		}
		send(client, name, packet) {
			client.socket.emit("packet$" + name, packet);
		}
		receive(client, name, callback) {
			client.socket.on("packet$" + name, callback);
		}
		unreceive(client, name, callback) {
			client.socket.off("packet$" + name, callback);
		}
		init(staticdir = "/../client", relative = true) {
			const express = rigid.config.npmModule('express');
			const http = rigid.config.npmModule('http');
			const socketio = rigid.config.npmModule('socket.io');
			const path = rigid.config.npmModule('path');
			this.app = express();
			this.server = http.createServer(this.app);
			this.io = socketio(this.server);
			this.app.use(express.static((relative ? __dirname : "") + staticdir));
			this.app.get('/', function(request, response, next) {
				response.sendFile(path.resolve((relative ? __dirname : "") + staticdir + path.sep + "index.html"));
			});
			this.server.listen(this.port);
			this.io.on("connection", socket => {
				if (this.limit >= 0 && Object.keys(this.connections).length >= this.limit) {
					socket.disconnect();
					return;
				}
				const id = rigid.utils.baseIdentifier.id();
				this.connections[id] = {
					id: id,
					socket: socket
				};
				this.events.trigger("join", this.connections[id]);
				socket.on("disconnect", () => {
					this.events.trigger("leave", this.connections[id]);
					delete this.connections[id];
				});
			});
		}

	}

})(rigid.network.server = {});