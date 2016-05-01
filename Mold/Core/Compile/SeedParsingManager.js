//!info transpiled
Seed({
		type : 'module',
		include : [
			{ 'Hexler' : 'Mold.Core.Compile.Hexler'},
			{ 'Kleber' : 'Mold.Core.Compile.Kleber'},
		]
	},
	function(module){

		/**
		 * @service SeedParsingManager
		 * @static
		 */
		var SeedParsingManager = function SeedParsingManager (){
			this.parser = {}
		}
		
		SeedParsingManager.prototype = {
			createSeedParser : function(seed){
				if(!seed.name){
					throw new Error ("Seed name is not defined! [Mold.Core.Compile.SeedParsingManager]");
				}

				if(!seed.fileData){
					throw new Error("Seed [" + seed.name + "] has no data!");
				}

				this.parser[seed.name] = {
					dna : [],
					parser : new Hexler(),

				}

				this.parser[seed.name].parser.setContent(seed.fileData);

				return this.parser[seed.name];
			},
			getParser : function(seed){
			
				if(!this.parser[seed.name]){
					throw new Error("No parser for dna [" + seed.name + "] defined! [Mold.Core.Compile.SeedParsingManager]");
				}

				return this.parser[seed.name];
			},
			addDNA : function(seed, dna){
				//console.log("ADD DNA", dna.name, " to ", seed.name)
				this.getParser(seed).dna.push(dna);
				if(typeof dna.transform == "function"){
					dna.transform(this.getParser(seed).parser);
				}
			},
			parse : function(seed){
				//console.log("PARSE", seed.name)
				this.getParser(seed).parser.parse(seed.path);
			},
			generate : function(seed){
				//console.log("GENERATE", seed.name)
				//last parsing befor generating
				this.getParser(seed).parser.parse(seed.path);
				
				if(!seed.type){
					seed.type = "es6module";
				}

				var parser = this.getParser(seed);
				var kleber = new Kleber(seed.path, seed.fileData);

				parser.dna.forEach(function(currentDNA){
					currentDNA.transpile(currentDNA.infos).forEach(function(transpiler){
						kleber.on(transpiler.match, transpiler.execute);
					})
				})
				
				var result = kleber.create(parser.parser.tree.children);
				seed.code = new Function("__module", result)
				return seed;
			}
		}

		module.exports = new SeedParsingManager();
	}
)