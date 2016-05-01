//!info transpiled
Seed({
		type : "dna",
		include : [
			{ 'DNA' : 'Mold.Core.Compile.DNA' }
		]
	},
	function(module){

		module.exportDefault = new DNA("arrow-function", {
			transform : function(parser){
				parser.createParent("val || expression => 'arguments' | operator = '=>' | block", "arrowFunction");
				parser.createParent("val || expression  => 'arguments' | operator = '=>' | * ? | terminator || $", "arrowFunction");
			},
			transpile : function(){
				return [
					{
						match : {
							type : "arrowFunction"
						},
						execute : function(node, create, options, loc){
							if(node.children[0].children.length){
								var argumentString = create(node.children[0].children, options, loc);
							}else{
								var argumentString = " " + node.children[0].name + " ";
							}
							var code = node.children.splice(2, node.children.length);
							
							if(code[0].type === "block"){
								code = code[0].children;
							}

							var output = "function(" + argumentString + "){ return " + create(code, options, loc) + "}.bind(this)";

							return { output : output }
						}
					}
	 			]
	 		}
		})
	}
)