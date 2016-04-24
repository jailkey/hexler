//!info transpiled
Seed({
		type : 'data',
	},
	function(ParseSeeds){
		describe("test parse seed with test seed", function(){
			it("load test seed", function(){
				Mold
					.load("Mold.Test.Core.Compile.TestSeed")
					.then(function(){
						console.log("LOADED")
					})
			})
		});
	}
);