//!info transpiled
Seed({
		type : "module",
		include : [
			{ 'DNA' : 'Mold.Core.Compile.DNA' }
		]
	},
	function(module){

		var _findInfos = function(token){
			var output = {
				isMoldModule : false,
				module : '',
				imports : []
			}

			var moldModulNameMatches = token.find({ type : 'moldModul' }, false);

			if(moldModulNameMatches.length){
				output.isMoldModule = true;
				output.module = moldModulNameMatches[0].name;
			}else{
			
				var stringModulNameMatches = token.find({ type : 'moduleString' }, false);
				if(stringModulNameMatches.length){
					output.module = stringModulNameMatches[0].name;
				}else{
					throw new Error("Something went wrong, no module for import rule found! [Mold.DNA.Import]")
				}
			}

			var defaultMember = token.find({ type : 'defaultMember' }, false);
			if(defaultMember.length){
				output.imports.push({
					isDefaultMember : true,
					alias : defaultMember[0].name
				})
			}

			var allMembers = token.find({ type : 'allMembers' }, false);
			if(allMembers.length){
				var allMembersName = token.find({ type : 'allMembersName' }, false);
				if(!allMembersName.length){
					throw new Error("Something went wrong, no member name for import member * found! [Mold.DNA.Import]")
				}
				output.imports.push({
					isAllMembers : true,
					name : "*",
					alias : allMembersName[0].name
				})
			}


			var memberExpression = token.find({ type : 'memberExpression' }, false);
			if(memberExpression.length){
				var currentImport = {};
				for(var i = 0; i < memberExpression[0].children.length; i++){
					var currentMember = memberExpression[0].children[i];
					currentImport.isMember = true;
					switch(currentMember.type){
						case "defaultValue":
							currentImport.isDefaultMember = true;
							break;
						case "memberValue":
							currentImport.name = currentMember.name;
							output.imports.push(currentImport)
							currentImport = {};
							break;
						case "memberValueWithAlias":
							currentImport.name = currentMember.name;
							break;
						case "memberAlias":
							currentImport.alias = currentMember.name;
							output.imports.push(currentImport)
							currentImport = {};
							break;
					}
				}
			}
			return output;
		}



		module.exports = new DNA("module-import", {
			transform : function(parser){

				//match short imports
				parser.createParent("val = 'import' | string => 'moduleString' || val => 'moldModul' | terminator || lineend", "import");
				
				//match defaultMember or expression
				parser.createParent(
						"val = 'import' | val => 'defaultMember' || block => 'memberExpression' "
						+ " |  val = 'from' => 'importFrom' | string => 'moduleString' || val => 'moldModul' | terminator || lineend"
				, "import")
				
				//match defaultMember + all or expression
				parser.createParent(
						"val = 'import' | val => 'defaultMember'" 
						+ " | comma | block => 'memberExpression' || [operator = '*' => 'allMembers' | val = 'as' => 'memberAs' | val => 'allMembersName']"
						+ " |  val = 'from' => 'importFrom' | string => 'moduleString' || val => 'moldModul' | terminator || lineend"
				, "import")

				//simple default rule
				parser.createParent(
						"val = 'import' | val => 'defaultMember'" 
						+ " |  val = 'from' => 'importFrom' | string => 'moduleString' || val => 'moldModul' | terminator || lineend"
				, "import")

				//create expression entries
				parser.createRule("val (parent.memberExpression) => 'memberValueWithAlias' | val = 'as' => 'memberAs' | val => 'memberAlias'")
				parser.createRule("val (parent.memberExpression) => 'memberValue'")

				
			},
			infos : function(parser, input){

				//extract import data from import node		
				parser.createAction("import", function(matches, tree){
					var token = matches[0].token;
					input.data.push(_findInfos(token));
				})
			
				return input;
			},
			handleSeed : function(seed, infos){
				for(var i = 0; i < infos.data.length; i++){
					var module = infos.data[i];
					
					//currently only mold modules are implemented
					if(module.isMoldModule){
						seed.addDependency(module.module);
					}
				}
			},
			transpile : function(info){
				return [
					{
						match : {
							type : "import"
						},
						execute : function(node, create, options, loc){
							var output = "";
							var moduleInfos = _findInfos(node);
							//console.log("IMPORT", moduleInfos)
							//handle mold module imports
							if(moduleInfos.isMoldModule && moduleInfos.imports.length){
								console.log("INFOS", moduleInfos)
								for(var i = 0; i < moduleInfos.imports.length; i++){
									if(moduleInfos.imports[i].isDefaultMember){
										output += "var " +  moduleInfos.imports[i].alias + " = ";
										output += "Mold.Core.SeedManager.get('" + moduleInfos.module + "').module.defaultExport;"
										output += "\n";
									}else if(moduleInfos.imports[i].isAllMembers){
										if(moduleInfos.imports[i].alias){
											output += "var " +  moduleInfos.imports[i].alias + " = ";
											output += "Mold.Core.SeedManager.get('" + moduleInfos.module + "').module.getAll();"
											output += "\n";
										}else{
											var allImports = Mold.Core.SeedManager.get(moduleInfos.module).module.getAll();
											for(var alias in allImports){
												output += "var " + alias + " = ";
												output += "Mold.Core.SeedManager.get('" + moduleInfos.module + "').module._namedExports['" + alias + "'];"
												output += "\n";
											}
										}
									}else if(moduleInfos.imports[i].isMember){
										if(moduleInfos.imports[i].alias){
											output += "var " + moduleInfos.imports[i].alias + " = ";
											output += "Mold.Core.SeedManager.get('" + moduleInfos.module + "').module._namedExports['" + moduleInfos.imports[i].name + "'];"
											output += "\n";
										}else{
											output += "var " + moduleInfos.imports[i].name + " = ";
											output += "Mold.Core.SeedManager.get('" + moduleInfos.module + "').module._namedExports['" + moduleInfos.imports[i].name + "'];"
											output += "\n";
										}
									}
									
								}
								
							}
							console.log("IMPORT",  node, output)
							//this.findInfos(node, tree)
							return { output : output }
						}
					}
	 			]
	 		}
		})
	}
)