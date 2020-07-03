(function(m) {

	m.npmCache = {};
	m.npmModule = function(path) {
		if (path in m.npmCache) {
			return m.npmCache[path];
		} else {
			return m.npmCache[path] = require(path);
		}
	}

})(rigid.config = {});