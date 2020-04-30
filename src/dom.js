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

})(rigid.dom = {});