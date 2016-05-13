//!info transpiled
"use strict";
Seed({
		type : "module",
		include : [
			{ "Parser" : ".Parser" },
			{ "Walker" : ".Walker" }
		],
		test : "Mold.Test.Core.Compile.Expression"
	},
	function(module){

		var _expressionCache = {};

		var Expression = function(rule){
			var parser = new Parser("EXPRESSOR");
			
			parser.keywords = [];
			parser.operators = ["=", "&&", "||", "=>", "|", "~", ".", "!", "+", "*", ">"];

			var tree = parser.parse(rule);
			var index = 0;
			var operate = "";
			var nextOperator = false;
			var entry = null;
			var optional = false;
			var multible = false;
			var levelDown = false;

			var createExpression = function(tree){
				var output = [];
				var lastEntry = false;
				var multible = false;
				var optional = false;
				var levelDown = false;

				Walker(tree, function(item){
					

					var reset = function(){
						optional = false;
					 	multible = false;
					 	levelDown = false;
					}

					switch(item.type){

						case "val":
							if(operate === "action"){
								entry.action = item.name;
								operate = "getname";
							}else if(operate === "getname"){
								entry.actionName = item.name;
								operate = false;
							}else{
								lastEntry = entry;
								entry = {
									type : item.name,
									index : index,
									operator : nextOperator,
									value : false,
									optional : optional,
									multible : multible,
									levelDown : levelDown,
									logical : false,
								}

								if(nextOperator){
									lastEntry.logical = entry;
								}else{
									output.push(entry)
								}
								
							}

							break;

						case "string":
							if(operate === "equal"){
								entry.value = item.name;
							}

							if(operate === "retype"){
								entry.retype = item.name;
							}

							
							break;

						case "list":
							lastEntry = entry;
							entry = {
								type : item.name,
								index : index,
								value : false,
								optional : optional,
								multible : multible,
								operator : nextOperator,
								subquery : createExpression(item.children),
								logical : false,
							}
							if(nextOperator){
								lastEntry.logical = entry
							}else{
								output.push(entry)
							}
							//output.push(entry)
							
							break;

						case "expression":
							entry.condition = item.children;
							break;

						case "operator":
							switch(item.name){
								case "|":
									index++;
									reset();
									nextOperator = false;
									break;

								case "=":
									operate = "equal";
									break;

								case "=>":
									operate = "retype";
									break;

								case "~":
									operate = "action";
									break;

								case "+":
									optional = true;
									break;

								case "*":
									multible = true;
									break;

								case ">":

									entry.levelDown = true;
									break;

								case "&&":
									nextOperator = "and"
									break;

								case "||":
									nextOperator = "or"
									break;

								case "!":
									nextOperator = "not"
									break;
							}

					}
				}, { level : 1 })
				return output;
			}
			//console.log("expression", output);
			return createExpression(tree.children);
		}

		//cache rule expression;
		module.exports = function(rule) {
			if(_expressionCache[rule]){
				return _expressionCache[rule];
			}
			_expressionCache[rule] = Expression(rule);
			return _expressionCache[rule];
		}
	}
);