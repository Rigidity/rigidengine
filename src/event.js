(function(m) {

	m.Listener = class Listener {
		constructor() {
			this.handlers = {};
		}
		register(name, func) {
			if (!(name in this.handlers)) {
				this.handlers[name] = [];
			}
			this.handlers[name].add(func);
			return this;
		}
		unregister(name, func) {
			if (!(name in this.handlers)) {
				return this;
			}
			this.handlers[name].remove(func);
			if (this.handlers[name].length == 0) {
				delete this.handlers[name];
			}
			return this;
		}
		trigger(name, event = {}) {
			if (!(name in this.handlers)) {
				return this;
			}
			this.handlers[name].forEach(item => item(event));
			return this;
		}
	}
	
})(rigid.event = {});