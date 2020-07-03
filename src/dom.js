(function(m) {

	m.id = function(id) {
		return document.getElementById(id);
	}

	m.canvasPosition = function canvasPosition(e, canvas) {
		var rect = canvas.getBoundingClientRect();
		return {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top
		};
	}
	m.canvasPositions = function canvasPositions(e, canvas) {
		const res = [];
		for (var i = 0; i < e.touches.length; i++) {
			const touch = e.touches[i];
			res.push(m.canvasPosition(touch, canvas));
		}
		return res;
	}

})(rigid.dom = {});