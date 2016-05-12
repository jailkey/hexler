import "modul";
import Mold.DNA.ES6;
import myDefault from Mold.Test.Core.Compile.TestDependency;
import {Hans, Peter, Paul as Gerd, supermann, dieter} from Mold.Test.Core.Compile.TestDependency;
import {constante, consttwo} from Mold.Test.Core.Compile.TestDependency;
//import 2defaultModul from "test-modul";


console.log("myDefault", myDefault)
console.log("Hans", Hans)
console.log("Peter", Peter)
console.log("Gerd", Gerd)

console.log("Supermann", supermann)
console.log("dieter", dieter)

console.log("constante", constante)
console.log("consttwo", consttwo)

/*
var test = arg => arg + 2;

console.log("TEST", test(2))*/

/*
['test', 'irgenwas'].map(arg => arg + 7 * 10);



(test, irgendwas) =>  {test + irgendwas};
var irgendwas = "asasdasdasdd"; */

/*

module.export(member, code, name)
module.exportDefault()
 */