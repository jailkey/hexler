//!info transpiled
Seed({
		type : "module",
		include : [
			{ 'DNA' : 'Mold.Core.Compile.DNA' }
		]
	},
	function(module){

		module.exports = new DNA("arrow-function", {
			transform : function(parser){

				parser.createParent("val || expression => 'arguments' | operator = '=>' | block", "arrowFunction");
				parser.createParent("val || expression  => 'arguments' | operator = '=>' | * string || val || operator | terminator || $", "arrowFunction");
				console.log("create parent")
			},
			transpile : [
				{
					match : {
						type : "arrowFunction"
					},
					execute : function(node, create, options, loc){

							console.log("FOUND")

						var argumentString= create(node.children[0].children, options, loc);
						var code = node.children.splice(2, node.children.length);
						
						if(code[0].type === "block"){
							code = code[0].children;
						}

						var output = "function(" + argumentString + "){ return " + create(code, options, loc) + "}.bind(this)";

						return { output : output }
					}
				}
 			]
		})
	}
)