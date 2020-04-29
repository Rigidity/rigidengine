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
					"src/math.js",
					"src/platform.js",
					"src/game.js",
					"src/component.js",
					"src/asset.js",
					"src/simple.js",
					"src/network.js",
					"src/dom.js",
					"src/module.js"
				], dest: "dist/rigid.js"
			}
		}
	});
	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.registerTask("default", ["concat"]);
};