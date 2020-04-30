const rigid = {};

Array.prototype.contains = function(item) {
	return this.indexOf(item) != -1;
};
Array.prototype.remove = function(item) {
	const idx = this.indexOf(item);
	if (idx != -1) this.splice(idx, 1);
};
Array.prototype.clear = function() {
	while (this.length > 0) {
		this.splice(0, 1);
	}
};
Array.prototype.add = Array.prototype.push;