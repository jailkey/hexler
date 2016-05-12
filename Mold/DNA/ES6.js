//!info transpiled
Seed({
		type : "es6module",
		include : [
			{ 'DNA' : 'Mold.Core.Compile.DNA' },
			{ 'DafaultValues' : 'Mold.DNA.DefaultValues' },
			{ 'Function' : 'Mold.DNA.Function' },
			{ 'Export' : 'Mold.DNA.Export' }
		]
	},
	function(){

		this.onCall(function(seed){
			this.dependencies.forEach(function(current){
				Mold.Core.SeedManager.get(current).callSeed(seed);
			}.bind(this))
		}.bind(this))
	}
)