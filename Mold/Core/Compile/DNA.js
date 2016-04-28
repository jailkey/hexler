//!info transpiled
Seed({
		type : "module"
	},
	function(module){

		var DNA = function DNA(name, config){
			this.name = name;
			this.validate(config);
			this.parser = null;

			this.transform = config.transform;
			this.infos = config.infos;
			this.handleSeed = config.handleSeed;
			this.transpile = config.transpile;
		}

		DNA.prototype = {
			validate : function(config){
				if(!config.transform){
					throw new Error("DNA transform function is not defined!");
				}
				if(!config.transpile){
					throw new Error("DNA transpile object is not defined!");
				}
				return true;
			}

		}

		module.exports = DNA;
	}
)