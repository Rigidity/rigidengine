(function(m) {
	
	m.Asset = class Asset {
        constructor() {

        }
    }
    m.Sound = class Sound extends m.Asset {
        constructor({source, loop = false}) {
			super();
			source.loop(loop);
			this.source = source;
        }
    }
    m.Sprite = class Sprite extends m.Asset {
        constructor({texture, alias = false}) {
			super();
			if (!alias) texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
			this.texture = texture;
        }
	}
	m.single = function(item, callback) {
        if (item.length != 2 && item.length != 3) {
            throw new Error("Unexpected asset definition size.");
        }
        if (item[0] == "sprite") {
            if (typeof item[1] != "string") {
                throw new Error("Sprite definition type unknown. Use string.");
            } else {
				const texture = PIXI.Texture.from(item[1]);
				if (item.length == 3) {
					callback(new m.Sprite({
						texture: texture,
						...item[2]
					}));
				} else {
					callback(new m.Sprite({
						texture: texture
					}));
				}
            }
        } else if (item[0] == "sound") {
            if (typeof item[1] != "string" && !Array.isArray(item[1])) {
                throw new Error("Sound definition type unknown. Use string or array.");
            } else {
				if (item.length == 3) {
					const source = new Howl({
						src: Array.isArray(item[1]) ? item[1] : [item[1]]
					});
					callback(new m.Sound({
						source: source,
						...item[2]
					}));
				} else {
					const source = new Howl({
						src: Array.isArray(item[1]) ? item[1] : [item[1]]
					});
					callback(new m.Sound({
						source: source
					}));
				}
            }
        } else {
            throw new Error("Unexpected asset definition type.");
        }
    }
	m.multiple = function(assets, callback) {
        const results = {};
        const list = Object.keys(assets);
        var loading = 0;

        function loadNext() {
            loading++;
            if (loading > list.length) {
                callback(results);
            } else {
                const i = loading - 1;
                m.single(assets[list[i]], asset => {
                    results[list[i]] = asset;
                    loadNext();
                })
            }
        }
        loadNext();
	}
	
})(rigid.asset = {});