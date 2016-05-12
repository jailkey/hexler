import Mold.DNA.ES6;
	
/*
var myTestFunction = function name (){
	console.log();
}*/

var test = {
	ens : "ens",
	zwo : "zwo"
}

//export * from test;

var names = {
	supermann : 'supermann',
	bettmann : 'bettmann'
}

//export {supermann, bettmann as dieter} from names;

var testDefault = {
	theDefaultValue : "default value"
}

//export var consttwo = function() { console.log("consttwo") };

var hans = function(){
	console.log("HANS")
}

export {testDefault as default};

export var test = "irgendwas";

export var constante = "test";




console.log("TEST")

__module.exportDefault = function(){
	console.log("DO THE DEFAULT");
}

__module.addExport("Hans", "Hans")
__module.addExport("Peter", "Peter")
__module.addExport("Paul", "Paul")