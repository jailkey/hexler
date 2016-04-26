//!info transpiled
Seed({
		type : "module",
		include : [
			{ 'DNA' : 'Mold.Core.Compile.DNA' }
		]
	},
	function(module){

		module.exports = new DNA("module-import", {
			transform : function(parser){
				//convert simple import
				//parser
				//convert to input node for a bettern handling
				parser.createParent("val = 'import' | * ? | val = 'from' => 'importFrom' | string => 'moduleString' || val => 'moldModul' | terminator || lineend ", "import");
				

				//extract import data from import node
				parser.createAction("import", function(matches, tree){
					console.log("FOUND NODE", matches[0].token.children);
					var i = 1, len = matches[0].token.children.length;
					var collected = [];
					for(; i < len; i++){
						var current = matches[0].token.children[i];
						switch(current.type){
							case "moldModul":
							case "moduleString":
								var module = {
									type : current.type,
									name : current.name
								}
								break;
						 	case "importFrom":
								//ignor
								break
							default:
								collected.push(current);
						}
						
					}

					var seperateByComma = function(collected, isMember){
						var i = 0, len = collected.length;
						var seperated = [];
						var entry = {};
						for(; i < len; i++){
							switch(collected[i].type){
								case "val" :
								case "as" :
								case "comma":
									seperated.push(entry);
									entry = {};
								default:

							}
						}
						return seperated;
					}


					
					
				})
			},
			transpile : [
				{
					match : {
						type : "import"
					},
					execute : function(node, create, options, loc){
						//
						return { output : "" }
					}
				}
 			]
		})
	}
)