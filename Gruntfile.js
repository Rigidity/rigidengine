module.exports = function(grunt) {
	grunt.initConfig({
		concat: {
			options: {
				separator: ";"
			},
			dist: {
				src: [
					"src/engine.js",
					"src/config.js",
					"src/utils.js",
					"src/event.js",
					"src/math.js",
					"src/platform.js",
					"src/component.js",
					"src/asset.js",
					"src/simple.js",
					"src/network.js",
					"src/dom.js",
					"src/components/application.js",
					"src/components/transform.js",
					"src/components/renderer.js",
					"src/components/renderers/graphics.js",
					"src/components/renderers/rect.js",
					"src/components/renderers/ellipse.js",
					"src/components/physics.js",
					"src/game.js",
					"src/module.js"
				], dest: "dist/rigid.js"
			}
		}
	});
	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.registerTask("default", ["concat"]);
};