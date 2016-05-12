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
			this.groups = [];

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
				console.log("PARSE", fileName)
				this.tree = this.parser.parse(this.content, fileName);
				console.log("PARSE RULE", Object.create(this.tree), this.parser.keywords)
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

			addKeyword : function(keyword){

			},

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
			 * - matches an array with matched tokens
			 * - tree the hole tree
			 */
			createAction : function(rule, action){

				if(typeof action !== 'function'){
					throw new Error('Argument "action" must be a function!')
				}
				rule = this.parseRuleStringForGroups(rule);

				//console.log("RULE", rule)
				this.rules.push({
					rule : rule,
					options : {
						action : action
					}
				})

				return this;
			},

			createRule : function(rule){
				this.createAction(rule, function(){});
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
					console.log("PARENT CREATED", name)		
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
			},

			/**
			 * @method parseRuleStringForGroups 
			 * @description parse a rulestring and replace groups with the rule value
			 * @param {string} rule - the rule
			 * @return {string} returns the string with the replaces group
			 */
			parseRuleStringForGroups : function(rule){
				for(var i = 0; i < this.groups.length; i++){
					var reg = new RegExp("\\$\\{" + this.groups[i].name + "\\}", "m");
					rule = rule.replace(reg, this.getGroupString(this.groups[i].name));
				}
				return rule;
			},

			/**
			 * @method getGroupString 
			 * @description creates a value string from a group
			 * @param  {string} name - the group name
			 * @return {string} returns the group value string
			 */
			getGroupString : function(name){
				var group = this.groups.find(function(entry){ return entry.name === name });
				if(group){
					return group.values.join(group.logic)
				}
				return null;
			},

			/**
			 * @method addGroup 
			 * @description adds a new group 
			 * @param {string} name - the name of the group
			 * @param {mixed} values - group value
			 * @param {string} [logic] - optional logic operator, default is or
			 */
			addGroup : function(name, values, logic){

				var group = {
					name : name,
					values : (Array.isArray(values)) ? values : [values],
					logic : (logic) ? logic : ' || '
				}

				this.groups.push(group);
				return group;
			},

			/**
			 * @method addGroupEntry 
			 * @description adds a group entry, if the group is not defined a new group will be created
			 * @param {string} name - the name of the group 
			 * @param {mixed} value - the group value
			 */
			addGroupEntry : function(name, value){
				var group = this.groups.find(function(entry){ return entry.name === name })
				if(!group){
					group = this.addGroup(name, value);
					return;
				}
				if(Array.isArray(value)){
					group.values = group.values.concat(value)
				}else{
					group.values.push(value)
				}
			},

			belongsToGroup : function(name, value){
				var group = this.groups.find(function(entry){ return entry.name === name })

				if(!group){
					return false;
				}

				return !!~group.values.indexOf(value);
			}

		}

		module.exports = Hexler;

	}
)