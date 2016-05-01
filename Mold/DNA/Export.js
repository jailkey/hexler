//!info transpiled
Seed({
		type : 'dna',
		include : [
			{ 'DNA' : 'Mold.Core.Compile.DNA' }
		]
	},
	function(module){

		module.exportDefault = new DNA("export", {
			transform : function(parser){
				parser.createParent("val = 'export' | operator = '*' | val = 'from' | val => 'exportAllFrom' | terminator", "export");
				parser.createParent("val = 'export' | block => 'memberExpression' | val = 'from' | val => 'exportFrom' | terminator", "export");
				parser.createParent("val = 'export' | block => 'memberExpression' | terminator", "export");
				parser.createParent("val = 'export' | val = 'var' || val = 'const' || val = 'let' | * [val | + comma] || [val | operator = '=' | val | + comma] | terminator", "export");
				

				parser.createRule("val (parent.memberExpression) => 'memberValueWithAlias' | val = 'as' => 'memberAs' | val => 'memberAlias'")
				parser.createRule("val (parent.memberExpression) => 'memberValue'")
			},
			transpile : function(){
				return [
					{
						match : {
							type : "export"
						},
						execute : function(node, create, options, loc){
							var output = '';
							var exportAllFrom = node.find({ type : 'exportAllFrom'}, false);
							if(exportAllFrom.length){
								output += "__module.exportAllFrom('" + exportAllFrom[0].name + "');\n";
							}

							var memberExpression = node.find({ type : 'memberExpression' }, false);
							if(memberExpression.length){

								var exportFrom = node.find({ type : 'exportFrom' });
								exportFrom = (exportFrom.length) ? exportFrom[0].name : 'this';

								var memberValues = node.find({ type : 'memberValue'})
								//export memberValues
								if(memberValues.length){
									var memberMap = memberValues.map(function(entry){
										return "'" + entry.name + "'";
									})
									output = "__module.exportFrom(["+ memberMap.join(",") + "], " + exportFrom + ");\n"
								}
								

								//get values with alias
								for(var i = 0; i < memberExpression[0].children.length; i++){
									var current = memberExpression[0].children[i];
									if(current.type === 'memberValueWithAlias'){
										var origin = current.name;
									}

									if(current.type === 'memberAlias'){
										output += "__module.addExport('" + current.name + "', " + exportFrom  + "." + origin + ");\n"
									}
								}
							}
							return { output : output }
						}
					}
				]

			}
		})
	}
)