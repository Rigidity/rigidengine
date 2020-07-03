module.exports = function(grunt) {
	grunt.initConfig({
		concat: {
			options: {
				separator: ";"
			},
			dist: {
				src: [
					"src/sharedlib.js",
					"src/engine.js",
					"src/config.js",
					"src/utils.js",
					"src/event.js",
					"src/math.js",
					"src/platform.js",
					"src/component.js",
					"src/asset.js",
					"src/simple.js",
					"src/dom.js",
					"src/network.js",
					"src/client.js",
					"src/server.js",
					"src/components/application.js",
					"src/components/simulation.js",
					"src/components/transform.js",
					"src/components/renderer.js",
					"src/components/collider.js",
					"src/components/renderers/graphics.js",
					"src/components/renderers/rect.js",
					"src/components/renderers/ellipse.js",
					"src/components/renderers/sprite.js",
					"src/components/renderers/text.js",
					"src/components/colliders/circle.js",
					"src/components/colliders/polygon.js",
					"src/components/colliders/rect.js",
					"src/entity.js",
					"src/game.js",
					"src/module.js"
				], dest: "dist/rigid.js"
			}
		}
	});
	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.registerTask("default", ["concat"]);
};