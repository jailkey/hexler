//!info transpiled
Seed({
		type : 'module',
		include : [
			{ 'SeedStates' : 'Mold.Core.SeedStates'},
			{ 'SeedParsingManager' : 'Mold.Core.Compile.SeedParsingManager'},
			{ 'ArrowFunction' : 'Mold.DNA.ArrowFunction'},
			{ 'ImportDNA' : 'Mold.DNA.Import'}

		],
		test : "Mold.Test.Core.Compile.ParseSeeds"
	},
	function(module){

		Mold.Core.SeedFlow
			.on(SeedStates.PARSE, function(seed, done){
				//check if fileData exists
				if(!seed.fileData){
					throw new Error("Seed [" + seed.name + "] has no data!");
				}

				//create new hexler for each seed
				SeedParsingManager.createSeedParser(seed);

				//add import dna here
			
				//parse data
				SeedParsingManager.parse(seed);
				
				//add dna
				SeedParsingManager.addDNA(seed, ImportDNA);
				SeedParsingManager.parse(seed);
				done()
			})
			.onAfter(SeedStates.PARSE, function(seed, done){
				seed.state = Mold.Core.SeedStates.LOAD_DEPENDENCIES;

				console.log("seed", seed.parser)
				console.log("after PARSE")
				done();
			})
			.on(SeedStates.TRANSFORM, function(seed, done){

				console.log("do TRANSFROM", seed.name);
				done()
			})
			.onAfter(SeedStates.TRANSFORM, function(seed, done){
				console.log("after TRANSFROM")
				seed.state = Mold.Core.SeedStates.TRANSPILE;
				done();
			})
			.on(SeedStates.TRANSPILE, function(seed, done){
				console.log("do TRANSPILE", seed.name);
				done()
			})
			.onAfter(SeedStates.TRANSPILE, function(seed, done){
				console.log("after TRANSPILE");
				
				//generates new code from the seed
				seed = SeedParsingManager.generate(seed);

				seed.state = Mold.Core.SeedStates.EXECUTE;
				done();
			})
	}
)