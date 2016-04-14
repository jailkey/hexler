//!info transpiled
"use strict";
Seed({
		type : "module",
		include : [
			{ "TokenFactory" : ".TokenFactory" }
		]
	},
	function(module){

		/**
		 * @class  Parser 
		 * @description parse a string my the given parsing options
		 */
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
				"==", "!=", "===", "!==", "<", "<=", ">", ">=", "<<", ">>", ">>>", "+", "-" , "*", "/", "%", "|", "^", "&", "..",
				"-", "+", "!", "~", "&&", "||"
			],

			textOperators : [
				"in", "instanceof", "typeof ", "void", "delete"
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

			isWord: function(value){

				return /\w/g.test(value)
			},

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

			isTextOperator : function(value, previous, next){
				return !!~this.textOperators.indexOf(value) && !this.isWord(next);
			},

			isKeyword : function(value, next){
				return !!~this.keywords.indexOf(value) && !this.isWord(next);
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

			getStartBracket : function(endBracket){
				return this.startBrackets[this.endBrackets.indexOf(endBracket)];
			},

			getEndBracket : function(startBracket){
				return this.endBrackets[this.startBrackets.indexOf(startBracket)];
			},

			validateNesting : function(brackets, current){
				var lastBracket = brackets[brackets.length -1];
				if(this.getStartBracket(current) === lastBracket){
					brackets.substring(0, brackets.length -1)
				}else{
					return false;
				}
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

			parse : function(code, filename){
				this.orderOperators();
				return this.parseString(code, filename);
			},

			//returns tokens
			parseString : function(string, filename){
				var i = 0, len = string.length;
				var startToken = TokenFactory(this.types.PROGRAMM, 'start', { loc : null });
				var token = startToken;
				var lastToken = token;
				var tokenValue = "";
				var lineNumber = 1;
				var charPosition = 0;
				var that = this;
				var mode = "";
				var currentStringType = "";
				var lastBrackets = "";

				for(; i < len; i++){
					var current = string[i];
					var previousValue = "";

					var next = function(len){
						return string.substring(i, i + len);
					}

					var options = {
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
							var oldCharPos = options.loc.charPosition;
							options.loc.charPosition = options.loc.charPosition - previousValue.length;
							lastToken = TokenFactory(that.types.VALUE, previousValue, options);
							options.loc.charPosition = oldCharPos;
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
							var pos = options.loc.charPosition - tokenValue.length;
							lastToken = TokenFactory(this.types.STRING, tokenValue.substring(1, tokenValue.length -1), options, pos);
							lastToken.stringType = current;
							token.addChild(lastToken);
							tokenValue = "";
							mode = "default";
						}
						if(this.isLineEnding(current)){
							lineNumber++;
						}

					}else if(mode === "collectComment"){
						if(this.isMultilineCommentEnd(next(this.multilineCommentEnd.length))){
							lastToken = TokenFactory(this.types.COMMENT, tokenValue, options);
							i = i + this.multilineCommentEnd.length - 1;
							token.addChild(lastToken);
							tokenValue = "";
							mode = "default";
						}

						if(this.isLineEnding(current)){
							lineNumber++;
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
						

					}else if(this.isKeyword(tokenValue, next(1))){
						var pos = options.loc.charPosition - tokenValue.length;
						lastToken = TokenFactory(this.types.KEYWORD, tokenValue, options, pos);
						token.addChild(lastToken);
						tokenValue = "";

			//handle operator	
					}else if((operator = testOperator())){
						createVal();
						lastToken = TokenFactory(this.types.OPERATOR, operator.name, options);
						token.addChild(lastToken);
						tokenValue = "";
						i += (operator.len - 1)

					}else if(this.isTextOperator(tokenValue, string.substring(i - tokenValue.length - 1, i - tokenValue.length), next(1))){
						var pos = options.loc.charPosition - tokenValue.length;
						lastToken = TokenFactory(this.types.OPERATOR, tokenValue, options, pos);
						lastToken.isTextOperator = true;
						token.addChild(lastToken);
						tokenValue = "";

			//handle single values
					}else if(this.isLineEnding(current)){
						createVal();
						lastToken = TokenFactory(this.types.LINEEND, current, options);
						token.addChild(lastToken);
						tokenValue = "";
						lineNumber++;
						charPosition = 0;

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
						lastBrackets += current;
						lastToken = TokenFactory(this.getBlockType(current), current, options);
						token.addChild(lastToken);
						token = lastToken;
						
						tokenValue = "";

					}else if(this.isEndBracket(current)){
						var expectedBracket = this.getEndBracket(lastBrackets.substring(lastBrackets.length - 1, lastBrackets.length));
						if(current !== expectedBracket){

							var myError = new SyntaxError(
								"Missing " + expectedBracket + " after " + this.getBlockType(this.getStartBracket(current)) + " in " + filename + " line " + options.loc.line + "!",
								filename,
								options.loc.line
							);
							var stacks = myError.stack.split('\n');
							myError.stack =  stacks.join("\n");
							myError.line = options.loc.line;
							throw myError;
						}
						lastBrackets = lastBrackets.substring(0, lastBrackets.length -1);
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
					if(!token){
						throw new SyntaxError("Token not found in row " + options.loc.charPosition + "!", filename, options.loc.line);
					}
					token.addChild(TokenFactory(this.types.VALUE, tokenValue, options));
				}
				
				return startToken;
			}

		}

		module.exports = Parser;
	}
);