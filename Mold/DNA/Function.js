//!info transpiled
Seed({
		type : "dna",
		include : [
			{ 'DNA' : 'Mold.Core.Compile.DNA' }
		]
	},
	function(module){
		module.exportDefault = new DNA("function", {
			transform : function(parser){
				parser.createParent("keyword = 'function' | val => 'functionName' | expression => 'functionArguments' | block ", "function");
				parser.createParent("keyword = 'function' | expression => 'functionArguments' | block ", "function");
				parser.addGroupEntry("valueExpression", "function")
			},
			transpile : function(){
				return [{
					match : {
						type : "function"
					},
					execute : function(node, create, options, loc){
						var output = "";
						var functionName = node.child("functionName");
						output += "function " + ((functionName) ? functionName.name : '' ) + " (" + create(node.child("functionArguments").children, options, loc) + ") { " + create(node.child("block").children, options, loc) + "}";

						return { output : output }
					}
				}]
			}
		});
	}
)