(function(m) {
	m.radians = function(degrees) {
		return degrees * Math.PI / 180;
	}
	m.degrees = function(radians) {
		return radians * 180 / Math.PI;
	}
	m.distance = function(a, b) {
		return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
	}
	m.angleBetween = function(a, b) {
		var dy = b.y - a.y;
		var dx = b.x - a.x;
		var theta = Math.atan2(dy, dx);
		theta *= 180 / Math.PI;
		return theta;
	}
	m.moveTowards = function(point, angle, speedX, speedY = speedX) {
		point.x += speedX * Math.cos(angle * Math.PI / 180);
		point.y += speedY * Math.sin(angle * Math.PI / 180);
	}
	m.rotatePoint = function(cx, cy, x, y, angle) {
		var radians = (Math.PI / 180) * -angle,
			cos = Math.cos(radians),
			sin = Math.sin(radians),
			nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
			ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
		return [nx, ny];
	}
	m.rotatePolygon = function(cx, cy, polygon, angle) {
		var res = [];
		var polyLength = polygon.length;
		for (var i = 0; i < polyLength; i++) {
			res.push(rotatePoint(cx, cy, polygon[i][0], polygon[i][1], angle));
		}
		return res;
	}
	m.clamp = function(num, a, b) {
		return num > b ? b : (num < a ? a : num);
	}
	m.round = function(num, decimal = 1) {
		const power = Math.pow(10, decimal);
		return Math.round(num * power) / power;
	}
})(rigid.math = {});