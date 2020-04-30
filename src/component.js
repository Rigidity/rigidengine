(function(m) {

	m.System = class System {
		constructor(target = null, pre = () => {}, post = () => {}) {
			this.items = [];
			this.target = target;
			this.pre = pre;
			this.post = post;
		}
		add(component) {
			if (this.items.contains(component)) {
				return this;
			}
			this.pre();
			this.items.add(component);
			component.enable(this.target);
			this.post();
			return this;
		}
		remove(component) {
			if (!this.items.contains(component)) {
				return this;
			}
			this.pre();
			component.disable(this.target);
			this.items.remove(component);
			this.post();
			return this;
		}
		get(type) {
			for (var i = 0; i < this.items.length; i++) {
				if (this.items[i] instanceof type) {
					return this.items[i];
				}
			}
			return null;
		}
		getAll(type) {
			const res = [];
			for (var i = 0; i < this.items.length; i++) {
				if (this.items[i] instanceof type) {
					res.add(this.items[i]);
				}
			}
			return res;
		}
		has(type) {
			return this.get(type) != null;
		}
	}
	m.Component = class Component {
		enable(target) {

		}
		disable(target) {

		}
	}

})(rigid.component = {});