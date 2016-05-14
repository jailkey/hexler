//!info transpiled
Seed({
		type : 'data',
	},
	function(ParseSeeds){
		var testSeed = null;
		var dependentSeed = null;
		describe("test parse seed with test seed", function(){
			it("load test seed", function(next){
				Mold
					.load("Mold.Test.Core.Compile.TestSeed")
					.then(function(seed){
						console.log("LOADED")
						testSeed = seed;
						expect(testSeed).not.toBe(null);
						next();
					})
			})

			it("get dependent seed", function(){
				dependentSeed = Mold.Core.SeedManager.get("Mold.Test.Core.Compile.TestDependency")
				expect(dependentSeed).not.toBe(null);
			})

			it("test export rules", function(){
				expect(dependentSeed.module._namedExports['supermann']).toBe('supermann');
				expect(dependentSeed.module._namedExports['dieter']).toBe('bettmann');
				expect(dependentSeed.module._namedExports['consttwo']).toBeFunction();
				expect(dependentSeed.module.defaultExport).toBeObject();
				expect(dependentSeed.module.defaultExport.theDefaultValue).toBe("default value");
			})

			it("test import rules", function(){
				console.log("SEED", testSeed)
			})
		});
	}
);