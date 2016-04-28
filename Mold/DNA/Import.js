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

			var moldModulNameMatches = token.find({ type : 'moldModul' });

			if(moldModulNameMatches.length){
				output.isMoldModule = true;
				output.module = moldModulNameMatches[0].name;
			}else{
			
				var stringModulNameMatches = token.find({ type : 'moduleString' });
				if(stringModulNameMatches.length){
					output.module = stringModulNameMatches[0].name;
				}else{
					throw new Error("Something went wrong, no module for import rule found! [Mold.DNA.Import]")
				}
			}

			var defaultMember = token.find({ type : 'defaultMember' });
			if(defaultMember.length){
				output.imports.push({
					isDefaultMember : true
				})
			}

			var allMembers = token.find({ type : 'allMembers' });
			if(allMembers.length){
				var allMembersName = token.find({ type : 'allMembersName' });
				if(!allMembersName.length){
					throw new Error("Something went wrong, no member name for import member * found! [Mold.DNA.Import]")
				}
				output.imports.push({
					isAllMembers : true,
					name : "*",
					alias : allMembersName[0].name
				})
			}

			var memberExpression = token.find({ type : 'memberExpression' });
			if(memberExpression.length){
				var currentImport = {};
				for(var i = 0; i < memberExpression[0].children.length; i++){
					var currentMember = memberExpression[0].children[i];
					currentImport.isMember = true;

					switch(currentMember.type){
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
				console.log("TRANSFORM")
				//match short imports
				parser.createParent("val = 'import' | string => 'moduleString' || val => 'moldModul' | terminator || lineend", "import");
				
				//match defaultMember or expression
				parser.createParent(
						"val = 'import' | val => 'defaultValue' || block => 'memberExpression' "
						+ " |  val = 'from' => 'importFrom' | string => 'moduleString' || val => 'moldModul' | terminator || lineend"
				, "import")
				
				//match defaultMember + all or expression
				parser.createParent(
						"val = 'import' | val => 'defaultMember'" 
						+ " | comma | block => 'memberExpression' || [operator = '*' => 'allMembers' | val = 'as' => 'memberAs' | val => 'allMembersName']"
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
					console.log("module", module)
					if(module.isMoldModule){
						console.log("ADD DEP", module.module)
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
							console.log("FOUND", node)
							//this.findInfos(node, tree)
							return { output : "" }
						}
					}
	 			]
	 		}
		})
	}
)