//!info transpiled
"use strict";
Seed({
		type : "module",
	},
	function(module){
		/**
		 * @factory
		 * @function TokenFactory 
		 * @description factory function creates tokens
		 * @param {string} type - type of the token 
		 * @param {string} name - name of the token
		 * @param {object} options - options (currently the only supported option is the loc object)
		 * @param {number} charPos - the current row position
		 */
		var TokenFactory = function(type, name, options, charPos){
			options = options || {};
			var loc = {
				line : (options.loc && options.loc.line) ? options.loc.line : 0,
				charPosition : (charPos > -1) ? charPos : (options.loc && options.loc.charPosition) ? options.loc.charPosition : 0
			}
			return {
				children : [],
				type : type,
				name :  name,
				parent : null,
				loc : loc,
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
				remove : function(){
					this.parent.removeChild(this);
				},
				nextSibling : function(){
					return this.parent.children[this.index+1] || null;
				},
				find : function(query, notRecursiv, target){
					var collected = [], found;
					target = target || this;
					for(var i = 0; i < target.children.length; i++){
						found = false;
						for(var prop in query){
							found = (target.children[i][prop] === query[prop]) ? true : false;
						}
						if(found){
							collected.push(target.children[i])
						}
						if(target.children[i].children.length && !notRecursiv){
							var recursivResult = this.find(query, false, target.children[i]);
							collected = collected.concat(recursivResult);
						}
					}
					return collected
				},
				child : function(type){
					var collected = [];
					for(var i = 0; i < this.children.length; i++){
						if(this.children[i].type === type){
							collected.push(this.children[i]);
						}
					}
					if(!collected.length){
						return null;
					}
					return (collected.length === 1) ? collected[0] : collected;
				}
			}
		}

		module.exports = TokenFactory;
	}
);