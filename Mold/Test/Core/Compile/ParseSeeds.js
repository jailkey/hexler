//!info transpiled
Seed({
		type : 'data',
	},
	function(ParseSeeds){
		var testSeed = null;
		describe("test parse seed with test seed", function(){
			it("load test seed", function(next){
				console.log("DO TEST")
				Mold
					.load("Mold.Test.Core.Compile.TestSeed")
					.then(function(seed){
						console.log("LOADED")
						testSeed = seed;
						next();
					})
			})

			it("test import rules", function(){
				console.log("SEED", testSeed)
			})
		});
	}
);