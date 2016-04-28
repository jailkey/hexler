//!info transpiled
"use strict";
Seed({
		type : "module",
		include : [
			{ "TokenFactory" : ".TokenFactory" },
			{ "Expression" : ".Expression" }
		]
	},
	function(module){
		var RuleParser = function(){};

		RuleParser.prototype = {

			parseRule : function(tree, rule, options){

				var expression = Expression(rule);
				options = this.getModifier(rule, options);
				var result = this.parseExpression(tree.children, expression, options);
				for(var i = 0; i < result.length; i++){
					if(options.action){
						this.execAction(result[i], options, tree);
						for(var y = 0; y < result[i].length; y++){
							if(result[i][y].expression && result[i][y].expression.retype){
								result[i][y].token.change({ type : result[i][y].expression.retype});
							}
						}
					}else{
						this.insertResult(result[i], options.create || false);
					}
				}
				return tree;
			},

			getModifier : function(rule, options){
				if(/\/[a-z]*$/g.test(rule)){
					var modifier = rule.substring(rule.lastIndexOf('/') + 1, rule.length);
					if(~modifier.indexOf('ib')){
						options.ignore = 'lineend';
					}
				}
				return options;
			},

			execCondition : function(condition, token, exp){

				var output = false;
				var currentToken = token;
				var negate = false;

				var outputObject = {
					token : token,
					expression : exp
				}

				var nextCondtion = function(type, name, start){
					var i = start, conlen = condition.length;
					for(; i < conlen; i++){
						if(condition.type === type && condtion.name === name){
							return i;
						}
					}
					return false;
				}

				var i = 0, len = condition.length;
				for(; i < len; i++){
					if(condition[i].type === "val" && condition[i].name === "parent"){
						currentToken = token.parent;

						//console.log("PARENT", currentToken)
						
					}else if(condition[i].type === "val"){

						if(negate){
							output = (currentToken.type === condition[i].name) ? false : outputObject;
						}else{
							output = (currentToken.type === condition[i].name) ? outputObject : false;
						}

						//console.log("VAL", output, currentToken.type, condition[i].name)
					}

					if(condition[i].type === "operator"){
						if(condition[i].name === "!"){
							negate = true;
						}

						if(condition[i].name === "&&"){
							negate = false;
							if(output){

							}else{
								var next = nextCondtion("operator", "||", i);
								if(next){
									i = next -1;
									continue;
								}else{
									return false;
								}
								
							}
						}

						if(condition[i].name === "||"){
							negate = false;
							if(output){
								return output;
							}
						}
					}

				}
				//console.log("CONDITION OUT", output)
				return output;
			},


			execLogicals : function(expression, token){
				var result = this.execExpression(expression, token);
				if(!result){
					if(expression.logical.operator === "or"){
						return this.execLogicals(expression.logical, token);
					}else{
						return false;
					}
				}else{
					if(expression.logical.operator === "and"){
						var subResult = this.execLogicals(expression.logical, token);
						if(subResult){
							return result;
						}else{
							return false
						}
					}else{
						return result;
					}
				}
			
			},

			execExpression : function(expression, token){
				if(expression.type === "$"){
				//	console.log("EXEC EXP", expression.type, token)
				}
				if(expression.type === "$" && !token){
					return {
						token : false,
						expression : expression
					}
				}

				if(expression.type === "?" && token.type){
					return {
						token : token,
						expression : expression
					}
				}
		
				if(expression.type  && token && expression.type === token.type){
					if(expression.value !== false){
						if(expression.value === token.name){
							return {
								token : token,
								expression : expression
							};
						}
						return false;
					}else{
						return {
							token : token,
							expression : expression
						};
					}
				}
				return false;
			},

			testEntry : function(exp, tree, options, level){
				var output = [];
				var currentToken = tree[0];

				level = level || 0
				level++;
				
				if(!currentToken){
					//return output;
				}
				//console.log("LENGTH START", tree.length)
				var collectedIgnors = [];
				if(currentToken && currentToken.type === options.ignor && options.index !== 0){
			
					while(currentToken && currentToken.type === options.ignor){
						collectedIgnors.push({
							token : currentToken,
							expression : {}
						});
						tree.shift();
						currentToken = tree[0];
					}
				}

				
			//test subquery
				if(exp.subquery){
					var treeCopy = Object.create(tree);
					if(collectedIgnors.length){
						output = output.concat(collectedIgnors);
					}
					var i = 0, sublen = exp.subquery.length;
					for(; i < sublen; i++){
						var subQueryResult = this.testEntry(exp.subquery[i], treeCopy, options);
						treeCopy.shift();
						if(subQueryResult.length){
							output = output.concat(subQueryResult);
						}else{
							return [];
						}
					}


			//or single value
				}else{
					var result;
					if(exp.logical){
						result = this.execLogicals(exp, currentToken);
					}else{
						result = this.execExpression(exp, currentToken);
						if(exp.type === "?" && result){
							//retest with next expression if it is true skip testing;
							var nextResult = this.testEntry(options.nextExpression, [currentToken], options, level);
							if(nextResult.length){
								//skip
								result = null;
							}
						}
					}
					
					if(result && exp.condition){
						result = (this.execCondition(exp.condition, currentToken, exp)) ? result : false;
					}
				
					if(result){
						if(collectedIgnors.length){
							output = output.concat(collectedIgnors);
						}
						output.push(result);

					}else{
						if(exp.optional){
							output.push(true);
						}else{
							return [];
						}
					}
				}

				if(exp.multible){
			
					if(output.length){
						
						if(exp.subquery){
							var testTree = treeCopy;
						}else{
							testTree = Object.create(tree);
							testTree.shift();
						}
						if(testTree.length){
							var multiresult = this.testEntry(exp, testTree, options);
							
							if(multiresult.length){
								output = output.concat(multiresult)
							}
						}
					}
				}
				return output;

			},

			parseExpression : function(tree, expression, options){
				var current = false;
				var outputTree = [];
				var collected = [];
				var output = [];
				options = options || {};

				var y = 0, len = tree.length, explen = expression.length;
				
				for(; y < len;){
					outputTree.push(current);
					var test = true;
					var checkSublevel = false;
					var subLevelTree = false;
					var z = 0;
					collected = [];

					var i = 0;
					var originIndex = y;
					for(;i < explen; i++){
						options.index = i;
						if(checkSublevel && subLevelTree && subLevelTree.length){

							var subResult = this.testEntry(expression[i], subLevelTree.slice(z, subLevelTree.length), options);
							if(!subResult){
								test = false;
								y++;
								break;
							}else{
								test = true;
								for(var x = 0; x < result.length; x++){
									//skip only for those results which are not not-found optionals
									if(result[x] !== true){
										z++;
									}
								}
								collected = collected.concat(subResult);
							}
						}else{
							var slice = tree.slice(y, tree.length);
							options.nextExpression = expression[i +1];
							var result = this.testEntry(expression[i], slice, options);

							if(!result.length){
								test = false;
								y++;
								break;
							}else{
								test = true;
								for(var x = 0; x < result.length; x++){
									//skip only for those results which are not not-found optionals
									if(result[x] !== true){
										y++;
									}
								}
								
								collected = collected.concat(result);

								if(expression[i].levelDown && result[0].token){
									checkSublevel = true;
									subLevelTree = result[0].token.children;
								}
							}
						}	
					}

					if(test && collected.length >= expression.length){
						output.push(collected);
						collected = [];
					}

					//checkchilds
					
				}
			
				var y = 0;
				var len = tree.length;
				
				for(; y < len; y++){
					if(tree[y] && tree[y].children.length){
						var childrenResult = this.parseExpression(tree[y].children, expression, options);
						var output = output.concat(childrenResult);
					}
				}

				return output;
			},

		

			testResult : function(result){
				
				if(!result.length){
					return false;
				}

				for(var i = 0; i < result.length; i++){
					if(result[i] === false){
						return false;
					}
				}
				return true;
			},

			testSubresult : function(subresult){
				if(!subresult || !subresult.length){
					return false;
				}
				for(var i = 0; i < subresult.length; i++){
					if(!this.testResult(subresult[i])){
						return false;
					}
				}
				return true;
			},


			execAction : function(result, options, tree){
				options.action.call(this, result, tree);
			},

			insertResult : function(result, name){
				var start = 0;
				var undefined;

				var parent = result[0].token.parent;
				if(!name){
					if(result[0].expression.action === 'create' || result[0].expression.action === 'replace' ){
						name = result[0].expression.actionName;
					}
				}

				if(name){
					var newToken = TokenFactory(name, name,  { loc : result[0].token.loc });
					parent.replaceChild(result[0].token, newToken);

					if(result[0].expression.action !== "replace" && result[0].expression.action !== "remove" ){
						newToken.addChild(result[0].token);
					}

					if(result[0].expression.retype){
						result[0].token.change({ type : result[0].expression.retype})
					}
					start = 1;
				}

				for(var i = start; i < result.length; i++){
					
					if(result[i] === true || result[i] === undefined){
						continue;
					}

					if(result[i].expression.action === "replace"){
						throw new Error(i + " action 'replace' can only used for the first part of an rule.");
					}
					
					if(newToken){
						parent.removeChild(result[i].token);
						if(result[i].expression.action !== "remove"){
							newToken.addChild(result[i].token);
						}
					}
					

					if(result[i].expression.action === "remove" && !newToken){
						result[i].token.parent.removeChild(result[i].token.index);
					}

					//retype
					if(result[i].expression.retype){
						result[i].token.change({ type : result[i].expression.retype})
					}
				}

				
			},

		}

		module.exports = RuleParser;
	}
);