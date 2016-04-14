//!info transpiled
"use strict";
Seed({
		type : "module",
	},
	function(module){

		var Walker = function(tree, callback, options){
			var i = 0, len = tree.length;
			for(; i < len; i++){
				callback.call(this, tree[i], options);
				if(tree[i].children.length && options.level !== 1){
					Walker(tree[i].children, callback, options)
				}
			}
		}

		module.exports = Walker

	}
);