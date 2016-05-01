//!info transpiled
Seed({
		type : 'module',
		include : [
			{ 'SeedStates' : 'Mold.Core.SeedStates'},
			{ 'SeedParsingManager' : 'Mold.Core.Compile.SeedParsingManager'},
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
				
				//add import dna
				SeedParsingManager.addDNA(seed, ImportDNA);
				
				//get import infos from import seed, the importInfos are set after parsing
				var importInfos = { data : [] };
				ImportDNA.infos(SeedParsingManager.getParser(seed).parser, importInfos);
				SeedParsingManager.parse(seed);
				ImportDNA.handleSeed(seed, importInfos)

				done()
			})
			.onAfter(SeedStates.PARSE, function(seed, done){
				seed.state = Mold.Core.SeedStates.LOAD_DEPENDENCIES;
				done();
			})
			.on(SeedStates.TRANSFORM, function(seed, done){
				done()
			})
			.onAfter(SeedStates.TRANSFORM, function(seed, done){
				seed.state = Mold.Core.SeedStates.TRANSPILE;
				done();
			})
			.on(SeedStates.TRANSPILE, function(seed, done){
				seed = SeedParsingManager.generate(seed);
				done()
			})
			.onAfter(SeedStates.TRANSPILE, function(seed, done){
				//generates new code from the seed
				
				seed.state = Mold.Core.SeedStates.EXECUTE;
				console.log("SET TO EXECUTE", seed.name)
				done();
			})
	}
)