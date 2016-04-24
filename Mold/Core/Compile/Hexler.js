//!info transpiled
"use strict";
Seed({
		type : "module",
		test : "Mold.Test.Core.Compile.Hexler",
		include : [
			{ "TokenFactory" : ".TokenFactory" },
			{ "Parser" : ".Parser" },
			{ "RuleParser" : ".RuleParser" },
			{ "Expression" : ".Expression" }
		]
	},
	function(module){


		/**
		 * @class Hexler 
		 * @description hexler api interface
		 * @param {object} config
		 */

		var Hexler = function(config){
			this.config = config;
			this.content = null;
			this.tree = null;
			this.rules = [];

			this.parser = new Parser();
			this.ruleParser = new RuleParser();
		}

		Hexler.prototype = {

			/**
			 * @method content 
			 * @description adds parsing content to Hexler
			 * @param  {string} content a code string
			 */
			setContent : function(content){
				this.content = content;
			},

			/**
			 * @method parse 
			 * @description parse the added content and executes all rules on it
			 * @return {object} returns the parsed tree
			 */
			parse : function(fileName){
				this.tree = this.parser.parse(this.content, fileName);
				for(var i = 0; i < this.rules.length; i++){
					this.tree = this.ruleParser.parseRule(this.tree, this.rules[i].rule, this.rules[i].options);
				}
				return this.tree;
			},

			/**
			 * @method createToken 
			 * @description factory function to create new tokens
			 * @param {string} type - type of the token 
			 * @param {string} name - name of the token
			 * @param {object} options - options (currently the only supported option is the loc object)
		 	 * @param {number} charPos - the current row position
		 	 * return {object} returns a new token object
			 */
			createToken : TokenFactory,

			/**
			 * @method addRule 
			 * @description adds a tree rule
			 * @param {[type]} rule [description]
			 */
			addRule : function(rule, options){
				this.rules.push({
					rule : rule,
					options : options || {}
				})
			},

			/**
			 * @method createAction 
			 * @description creates an action that will be executed when the rules matches
			 * @param  {string} rule  the rule 
			 * @param  {function} action the action that has to be executed when the rule matches, passed arguments are:
			 *                           - matches an array with matched tokens
			 *                           - tree the hole tree
			 */
			createAction : function(rule, action){

				if(typeof action !== 'function'){
					throw new Error('Argument "action" must be a function!')
				}

				this.rules.push({
					rule : rule,
					options : {
						action : action
					}
				})

				return this;
			},

			/**
			 * @method createParent 
			 * @description creates a new parent token if the rule matches, the machted nodes become child tokens of the new one
			 * @param  {string} rule  - the rule
			 * @param  {string} name - the name of the new rule
			 * @param  {object} [properties] - an optional object with properties for the new token
			 */
			createParent : function(rule, name, properties){
				this.createAction(rule, function(matches, tree){

					var parent = matches[0].token.parent;
					var newToken = TokenFactory(name, name,  { loc : matches[0].token.loc });
					if(typeof properties === 'object'){
						for(var prop in properties){
							if(typeof properties[prop] === 'function'){
								newToken[prop] = properties[prop].bind(newToken);
							}else{
								newToken[prop] = properties[prop];
							}
							
						}
					}

					parent.replaceChild(matches[0].token, newToken);
					newToken.addChild(matches[0].token);
					for(var i = 1; i < matches.length; i++){
						if(matches[i] === true || matches[i] === undefined){
							continue;
						}
						if(matches[i].token){
							parent.removeChild(matches[i].token);
							newToken.addChild(matches[i].token);
						}
					}		
				});
				return this;
			},

			/**
			 * @method firstToParent 
			 * @description converts the first match to a parent of the matched sequence
			 * @param  {string} rule - the rule to match
			 */
			firstToParent : function(rule){
				this.createAction(rule, function(matches, tree){
					var parent = matches[0].token.parent;
					for(var i = 1; i < matches.length; i++){
						if(matches[i] === true || matches[i] === undefined){
							continue;
						}
						if(matches[i].token){
							parent.removeChild(matches[i].token);
							matches[0].token.addChild(matches[i].token);
						}
					}	
				});

				return this;
			},

			/**
			 * @method removeIndex 
			 * @description removes one of the matched tokens by index
			 * @param  {string} rule - the rule
			 * @param  {number} index
			 */
			removeIndex : function(rule, index){
				this.createAction(rule, function(matches, tree){
					if(matches[index]){
						//console.log(matches[index])
						matches[index].token.remove();
					}
				});
				return this;
			},

			/**
			 * @method removeAll
			 * @description removes all matched tokens
			 * @param  {string} rule - the rule
			 */
			removeAll : function(rule){
				this.createAction(rule, function(matches, tree){
					for(var i = 0; i < matches.length; i++){
						if(matches[i]){
							matches[i].token.remove();
						}
					}
				});
				return this;
			}

		}

		module.exports = Hexler;

	}
)