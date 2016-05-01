import Mold.DNA.Export;
	
	var test = {
		ens : "ens",
		zwo : "zwo"
	}

export * from test;

	var names = {
		supermann : 'supermann',
		bettmann : 'bettmann'
	}

export {supermann, bettmann as dieter} from names;

console.log("TEST")

__module.exportDefault = function(){
	console.log("DO THE DEFAULT");
}

__module.addExport("Hans", "Hans")
__module.addExport("Peter", "Peter")
__module.addExport("Paul", "Paul")