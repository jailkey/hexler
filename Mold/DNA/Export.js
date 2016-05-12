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
				parser.createParent("val = 'export' | operator = '*' | val = 'from' | val => 'exportAllFrom' | terminator || lineend", "export");
				parser.createParent("val = 'export' | block => 'memberExpression' | val = 'from' | val => 'exportFrom' | terminator || lineend", "export");
				parser.createParent("val = 'export' | block => 'memberExpression' | terminator || lineend", "export");
				parser.createParent("val = 'export' | keyword = 'var' || keyword = 'const' || keyword = 'let' | * [val => 'memberName' | operator = '=' | ${valueExpression} | + comma] | terminator || lineend", "export");
				parser.createParent("val = 'export' | keyword = 'var' || keyword = 'const' || keyword = 'let' | val | operator = '=' | ${valueExpression} | terminator || lineend", "export");
				
				//parser.createParent("val = 'export' | val = 'default' | keyword = 'class' || keyword = 'function' |")
				/*
				export default expression;
export default function (…) { … } // oder: class, function*
export default function name1(…) { … } // oder: class, function*
export { name1 as default, … };*/

				//nested default export
				parser.createRule("val (parent.memberExpression) => 'defaultValue' | val = 'as' => 'memberAs' | keyword = 'default' => 'defaultMember'")

				//standard nested export
				parser.createRule("val (parent.memberExpression) => 'memberValueWithAlias' | val = 'as' => 'memberAs' | val => 'memberAlias'")
				parser.createRule("val (parent.memberExpression) => 'memberValue'")
			},
			transpile : function(infos, parser){
				return [
					{
						match : {
							type : "export"
						},
						execute : function(node, create, options, loc){
								console.log("NODE", node)
							var output = '';
							var exportAllFrom = node.find({ type : 'exportAllFrom'}, false);
							if(exportAllFrom.length){
								output += "__module.exportAllFrom('" + exportAllFrom[0].name + "');\n";
							}

							var exportFrom = node.find({ type : 'exportFrom' });
							exportFrom = (exportFrom.length) ? exportFrom[0].name : 'this';
		
							var memberExpression = node.find({ type : 'memberExpression' }, false);

							if(memberExpression.length){
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
				
								//default export inside a expression
								var defaultValue = node.find({ type : 'defaultValue'});
								if(defaultValue.length){
									console.log("default value",  "__module.defaultExport = " + defaultValue[0].name + ";\n")
									output += "__module.defaultExport = " + defaultValue[0].name + ";\n"
								}
							}else{
								var i = 0, len = node.children.length, values = [];
							
								for(; i < len; i++){
									var current = node.children[i];

									if(
										current.type === "keyword" 
										&& current.name === "var" 
										|| current.name === "const" 
										|| current.name === "let"
									){
										
										var declaration = current.name;
										console.log("declaration found", declaration);
									}
									if(current.type === "memberName"){
										values.push({
											member : current,
											declaration : declaration
										})
									}

									if(parser.belongsToGroup("valueExpression", current.type) && values[values.length - 1 ]){
										values[values.length - 1 ].value = current;
									}

									if(current.type === "memberAlias"){
										values[values.length - 1 ].alias = current.name;
									}
								}
								var i = 0, len = values.length;
								for(; i < len; i++){
									if(values[i].alias){
										var name = values[i].alias;
									}else{
										var name = values[i].member.name;
										
									}
									output += values[i].declaration + " " + values[i].member.name + "=" + create(values[i].value, options, loc) + ";\n";
									output += "__module.addExport('" + name + "', " + values[i].member.name + ");\n"
		
								}
							}
							console.log("EXPORT", output)
							return { output : output }
						}
					}
				]

			}
		})
	}
)