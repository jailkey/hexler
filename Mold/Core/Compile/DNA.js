//!info transpiled
Seed({
		type : "module",
		include : [
			{ "SeedParsingManager" : "Mold.Core.Compile.SeedParsingManager" }
		]
	},
	function(module){

		//copy the es6module type and modify it
		var es6ModuleTypeCopy = Object.create(Mold.Core.SeedTypeManager.get('es6module'));

		//changetype
		es6ModuleTypeCopy.name = "dna";
		es6ModuleTypeCopy.__create = es6ModuleTypeCopy.create;
		es6ModuleTypeCopy.create = function(seed){
			//if a dna seed will be created check his caller
			seed.onCall(function(callerSeed){
				if(!callerSeed.transpiled){
					SeedParsingManager.addDNA(callerSeed, seed.module.exportDefault);
				}
			})
			es6ModuleTypeCopy.__create.call(es6ModuleTypeCopy, seed);
		}

		//add ne module type
		Mold.Core.SeedTypeManager.add(es6ModuleTypeCopy);


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