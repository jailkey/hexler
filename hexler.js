(function(global){

	var TokenFactory = function(type, name, options){

		return {
			children : [],
			type : type,
			name :  name,
			parent : null,
			loc : options.loc,
			change : function(config){
				for(var prop in config){
					this[prop] = config[prop];
				}
			},
			addChild : function(child){
				child.parent = this;
				child.index = this.children.length;
				this.children.push(child);
				return this;
			},
			getChild : function(index){
				return children[index];
			},
			replaceChild : function(child, replace){

				this.children.splice(child.index, 1, replace);
			},
			removeChild : function(child){
				this.children.splice(child.index, 1);
				for(var i = 0; i < this.children.length; i++){
					this.children[i].index = i;
				}
			},
			child : function(type){
				var collected = [];
				for(var i = 0; i < this.children.length; i++){
					if(this.children[0].type === type){
						collected.push(this.children[0]);
					}
				}

				return (collected.length === 1) ? collected[1] : collected;
			}
		}
	}

	var Parser = function(){

	}

	Parser.prototype = {

		types : {
			PROGRAMM : "programm",
			STRING : "string",
			KEYWORD : "keyword",
			VALUE : "val",
			TERMINATOR : "terminator",
			LINEEND : "lineend",
			OPERATOR : "operator",
			COMMENT : "comment",
			COMMA : "comma",
			BLOCK : "block",
			EXPRESSION : "expression",
			LIST : "list",
		},

		lineEnding : "\n",

		terminator : ";",

		startBrackets : ["{", "(", "["],

		endBrackets : ["}", ")", "]"],

		comma : ",",

		operators : [
			"++", "--", "?", ":", "=>",
			"=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", ">>>=", "|=", "^=", "&=",
			"==", "!=", "===", "!==", "<", "<=", ">", ">=", "<<", ">>", ">>>", "+", "-" , "*", "/", "%", "|", "^", "&", "in", "instanceof", "..",
			"-", "+", "!", "~", "typeof", "void", "delete"
		],

		keywords : [
			"var", "const", "let", "if", "for", "while", "function",
			"else", "continue", "break", "switch", "case", "default", "do", "class",
			"throw", "catch", "try", "delete"
		],

		strings : [ '"', "'" ],

		multilineCommentStart : "/*",

		multilineCommentEnd : "*/",

		singleComment : "//",
		
		whitespaces : [" ", "\t"],

		orderOperators : function(){
			this.orderdOperators = [];
			var i = 0, len = this.operators.length;
			for(;i < len; i++){
				if(this.operators[i]){
					if(!this.orderdOperators[this.operators[i].length]){
						this.orderdOperators[this.operators[i].length] = [];
					}
					this.orderdOperators[this.operators[i].length].push(this.operators[i]);
				}
			}
		},

		orderdOperators : [],

		isMultilineCommentStart : function(value){
			return (this.multilineCommentStart === value) ? true  : false;
		},

		isMultilineCommentEnd : function(value){
			return (this.multilineCommentEnd === value) ? true  : false;
		},

		isSingleComment : function(value){
			return (this.singleComment === value) ? true  : false;
		},

		isLineEnding : function(value){
			return (value === this.lineEnding) ? true : false;
		},

		isTerminator : function(value){
			return (value === this.terminator) ? true : false;
		},

		isStartBracket : function(value){
			return !!~this.startBrackets.indexOf(value);
		},

		isEndBracket : function(value){
			return !!~this.endBrackets.indexOf(value);
		},

		isOperator : function(value){
			return !!~this.operators.indexOf(value);
		},

		isKeyword : function(value){
			return !!~this.keywords.indexOf(value);
		},

		isWhitespace : function(value){
			return !!~this.whitespaces.indexOf(value);
		},

		isString : function(value){
			return !!~this.strings.indexOf(value);
		},

		isComma : function(value){
			return (this.comma === value) ? true : false;
		},

		getBlockType : function(value){
			switch(value){
				case "{":
					return this.types.BLOCK;
				case "(":
					return this.types.EXPRESSION;
				case "[":
					return this.types.LIST;
			}
		},

		parse : function(code){
			this.orderOperators();
			console.log("order operator")
			return this.parseString(code);
		},

		//returns tokens
		parseString : function(string){
			var i = 0, len = string.length;
			var startToken = TokenFactory(this.types.PROGRAMM, 'start', { loc : null });
			var token = startToken;
			var lastToken = token;
			var tokenValue = "";
			var lineNumber = 1;
			var charPosition = 1;
			var that = this;
			var mode = "";
			var currentStringType = "";

			for(; i < len; i++){
				var current = string[i];
				var previousValue = "";

				var next = function(len){
					return string.substring(i, i + len);
				}

				options = {
					loc : {
						line : lineNumber,
						charPosition : charPosition
					}
				}

				previousValue = tokenValue;

				if(!this.isWhitespace(current)){
					tokenValue += current;
				}

	
				var createVal = function(){
					if(previousValue !== ""){
						options.loc.charPosition = options.loc.charPosition - previousValue.length;
						lastToken = TokenFactory(that.types.VALUE, previousValue, options);
						token.addChild(lastToken);
					}
				}

				var testOperator = function(){
					var i = that.orderdOperators.length -1;
					for(; i > 0; i--){
						//console.log("test oberator", next(i), that.orderdOperators[i])
						if(that.orderdOperators[i] && !!~that.orderdOperators[i].indexOf(next(i))){
							return {
								name : next(i),
								len : i
							}
						}
					}
					return false;
				}	
			
				var operator = false;
				if(mode === "collectString"){
					if(this.isString(current) && current === currentStringType){
						lastToken = TokenFactory(this.types.STRING, tokenValue.substring(1, tokenValue.length -1), options);
						lastToken.stringType = current;
						token.addChild(lastToken);
						tokenValue = "";
						mode = "default";
					}

				}else if(mode === "collectComment"){
					if(this.isMultilineCommentEnd(next(this.multilineCommentEnd.length))){
						lastToken = TokenFactory(this.types.COMMENT, tokenValue, options);
						token.addChild(lastToken);
						tokenValue = "";
						mode = "default";
					}

				}else if(mode === "collectSingleComment"){
					if(this.isLineEnding(current)){
						lastToken = TokenFactory(this.types.COMMENT, tokenValue, options);
						token.addChild(lastToken);
						tokenValue = "";
						mode = "default";
					}

				}else if(this.isSingleComment(next(this.singleComment.length))){
					mode = "collectSingleComment";

				}else if(this.isMultilineCommentStart(next(this.multilineCommentStart.length))){
					mode = "collectComment";

				}else if(this.isString(current)){
					mode = "collectString";
					currentStringType = current;

				}else if(this.isKeyword(tokenValue)){
					lastToken = TokenFactory(this.types.KEYWORD, tokenValue, options);
					token.addChild(lastToken);
					tokenValue = "";

		//handle operator	
				}else if((operator = testOperator())){
					createVal();
					lastToken = TokenFactory(this.types.OPERATOR, operator.name, options);
					token.addChild(lastToken);
					tokenValue = "";
					i += (operator.len - 1)

		//handle single values
				}else if(this.isLineEnding(current)){
					createVal();
					lastToken = TokenFactory(this.types.LINEEND, current, options);
					token.addChild(lastToken);
					tokenValue = "";
					lineNumber++;
					charPosition = 1;

				}else if(this.isTerminator(current)){
					createVal();
					lastToken = TokenFactory(this.types.TERMINATOR, current, options);
					token.addChild(lastToken);
					tokenValue = "";

				}else if(this.isComma(current)){
					createVal();
					lastToken = TokenFactory(this.types.COMMA, current, options);
					token.addChild(lastToken);
					tokenValue = "";

				}else if(this.isWhitespace(current)){
					if(previousValue !== ""){
						createVal()
					}
					tokenValue = "";

				}else if(this.isStartBracket(current)){
					createVal();
					lastToken = TokenFactory(this.getBlockType(current), current, options);
					token.addChild(lastToken);
					token = lastToken;
					
					tokenValue = "";

				}else if(this.isEndBracket(current)){
					createVal();
					token = token.parent;
					tokenValue = "";

				}else{
					//console.log("ELSE", current)
					
				}
				charPosition++;
			}
			if(tokenValue !== ""){
				options.loc.charPosition = options.loc.charPosition - tokenValue.length;
				token.addChild(TokenFactory(this.types.VALUE, tokenValue, options));
			}
			
			return startToken;
		},

		

		parseRule : function(tree, rule, name, options){
			var expression = Expression(rule);
			console.log("EXPRESSION", expression);
			var result = this.parseExpression(tree.children, expression, options);
			
			for(var i = 0; i < result.length; i++){
				//console.log(result[i])
				this.insertResult(result[i], name);
			}
			console.log("TREE", tree)
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
				//console.log("EXEC", exp.type, currentToken)
				if(exp.logical){
					result = this.execLogicals(exp, currentToken);
				}else{
					result = this.execExpression(exp, currentToken);
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
					
					var multiresult = this.testEntry(exp, testTree, options);
					
					//console.log("LENGTH END", testTree.length, multiresult, exp)
					if(multiresult.length){
						output = output.concat(multiresult)
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
			
			//while(current = tree.shift()){
			var y = 0, len = tree.length, explen = expression.length;;
			for(; y < len;){
				outputTree.push(current);
				var test = true;
				var checkSublevel = false;
				var subLevelTree = false;
				var z = 0;
				collected = [];
				
				var i = 0;
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
					
						var result = this.testEntry(expression[i], tree.slice(y, tree.length), options);
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
				if(tree[y] && tree[y].children.length){
					var childrenResult = this.parseExpression(tree[y].children, expression, options);
					var output = output.concat(childrenResult);
				}

			}

			//console.log("RESULT", output)
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



		insertResult : function(result, name){
			var start = 0;
			var undefined;

			var parent = result[0].token.parent;
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
					throw new Error("action 'replace' can only used for the first part of an rule.");
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

	var Walker = function(tree, callback, options){
		var i = 0, len = tree.length;
		for(; i < len; i++){
			callback.call(this, tree[i], options);
			if(tree[i].children.length && options.level !== 1){
				Walker(tree[i].children, callback, options)
			}
		}
	}

	var Expression = function(rule){
		var parser = new Parser();
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
					console.log("reset")
					optional = false;
				 	multible = false;
				 	levelDown = false;
				}

				switch(item.type){

					case "val":
						if(operate === "action"){
							entry.action = item.name;
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
								console.log("optionale found")
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

	global.JSParser = Parser;

	global.Expression = Expression;

	global.Walker = Walker;

}(window))