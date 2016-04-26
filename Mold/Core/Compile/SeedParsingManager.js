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
					throw new Error ("seed name is not defined!");
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
				console.log("seedname", seed.name)
				if(!this.parser[seed.name]){
					throw new Error("No parser for dna defined!");
				}

				return this.parser[seed.name];
			},
			addDNA : function(seed, dna){
				this.getParser(seed).dna.push(dna);
				if(typeof dna.transform == "function"){
					dna.transform(this.getParser(seed).parser)
				}
			},
			parse : function(seed){
				this.getParser(seed).parser.parse(seed.path);
			},
			generate : function(seed){
				if(!seed.type){
					seed.type = "module";
				}

				seed.code = function(){
					
				}

				var parser = this.getParser(seed);
				var kleber = new Kleber(seed.path, seed.fileData);


				parser.dna.forEach(function(currentDNA){
					currentDNA.transpile.forEach(function(transpiler){
						kleber.on(transpiler.match, transpiler.execute);
					})
				})
				//console.log(parser.parser.tree.children)
				var result = kleber.create(parser.parser.tree.children);
				console.log("result", result)
				return seed;
			}
		}

		module.exports = new SeedParsingManager();
	}
)