(function(m) {

	m.property = function({object = {}, name = "property", getter, setter} = {}) {
		if (object.hasOwnProperty(name)) {
			return object;
		}
		Object.defineProperty(object, name, {
			get: getter,
			set: setter
		});
		return object;
	}
	m.unproperty = function({object = {}, name} = {}) {
		if (!object.hasOwnProperty(name)) {
			return object;
		}
		delete object[name];
		return object;
	}

	m.time = function() {
        return new Date().getTime();
	}
	m.Timer = class Timer {
        constructor({callback, fps} = {}) {
			this.callback = callback;
			this.fps = fps;
			this.timeout = null;
			this.state = false;
		}
        start() {
			if (this.state) {
				return this;
			}
			this.state = true;
			var oldTime = m.time();
			var remainder = 0;
			const timer = this;
			function step() {
				if (!timer.state) {
					return;
				}
				var newTime = m.time();
				const delta = newTime - oldTime;
				oldTime = newTime;
				remainder += delta;
				const delay = 1000 / timer.fps;
				while (remainder >= delay) {
					remainder -= delay;
					if (!timer.state) {
						return;
					}
					timer.callback(delta);
				}
				if (!timer.state) {
					return;
				}
				timer.timeout = setTimeout(step, delay - remainder);
			}
			step();
			return this;
		}
		stop() {
			if (!this.state) {
				return this;
			}
			this.state = false;
			if (this.timeout != null) {
				clearTimeout(this.timeout);
				this.timeout = null;
			}
			return this;
		}
	}
	
})(rigid.utils = {});