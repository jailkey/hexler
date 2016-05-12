//!info transpiled
"use strict";
Seed({
		type : "module"
	},
	function(module){

		var Kleber = function(filename, content){

			this.visitors = [];
			this.sourceMap = new Mold.Core.SourceMap(filename, content);
			this.defaults();
		}

		Kleber.prototype = {
			
			patternApplies : function(node, pattern){
				for(var prop in pattern){
					if(!node[prop] || node[prop] !== pattern[prop]){
						return false;
					}
				}
				return true;
			},

			create : function(tree, options, loc){

				loc = loc || {
					level : 0,
					line : 1,
					column : 0
				}

				//if tree is not an array convert it
				tree = (Array.isArray(tree)) ? tree : [tree];
		
				var that = this;
				var i = 0, len = tree.length;
				var y = 0, visitorLen = this.visitors.length;
				var output = "";
				var addLine = function(){
					loc.line++;
					loc.column = 0;
				}
				for(; i < len; i++){
					var node = tree[i];
					for(y = 0; y < visitorLen; y++){

						var visitor = this.visitors[y];
						if(this.patternApplies(node, visitor.pattern)){
							
							var result = visitor.callback(node, this.create.bind(this), options, loc);
							if(result.lines){
								for(var x = 0; x < result.lines; x++){
									output += " \n"
									addLine()
								}
							}

							if(result.skip){
								continue;
							}

							var name = (node.type === "val") ? node.name : false;
							
							if(!result.skipSourceMap){
								this.sourceMap.addMapping(
									loc.line, loc.column, node.loc.line, node.loc.charPosition, 0, name, ''
								);
							}
							
							loc.column += (result.output.length) ? result.output.length : 0;
							if(result.output !== false){
								output += result.output;
							}
						}
					}
				}
				return output;
			},

			on : function(pattern, callback){
				this.visitors.push({
					pattern : pattern,
					callback : callback
				})

				return this;
			},

			defaults : function(){
				this
					.on({ type : 'keyword' }, function(node){
						return { output : node.name + " "}
					})
					.on({ type : 'val' }, function(node){
						return { output : node.name + " "}
					})
					.on({ type : 'operator' }, function(node){
						if(node.isTextOperator){
							return { output : " " + node.name + " "}
						}else{
							return { output : " " + node.name + " "}
						}
						
					})
					.on({ type : 'string' }, function(node){
						return { output : node.stringType + node.name + node.stringType}
					})
					.on({ type : 'comma' }, function(node){
						return { output : ","}
					})
					.on({ type : 'terminator' }, function(node){
						return { output : node.name, skipSourceMap : true }
					})
					.on({ type : 'lineend' }, function(node){
						return { output : node.name, lines : 1, skip : true }
					})
					.on({ type : 'expression' }, function(node, create, options, loc){
						loc.level++;
						return { output : "(" + create(node.children, options, loc) + ")", skipSourceMap : true }
					})
					.on({ type : 'block' }, function(node, create, options, loc){
						//console.log("PARSE BLOCK", node, loc.line)
						loc.level++;
						return { output : "{" + create(node.children, options, loc) + "}", skipSourceMap : true }
					})
					.on({ type : 'list' }, function(node, create, options, loc){
						loc.level++;
						return { output : "[" + create(node.children, options, loc) + "]", skipSourceMap : true }
					})
			}
		}

		module.exports = Kleber;

	}
)