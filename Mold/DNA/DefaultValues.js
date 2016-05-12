//!info transpiled
Seed({
		type : 'dna',
		include : [
			{ 'DNA' : 'Mold.Core.Compile.DNA' }
		]
	},
	function(module){

		module.exportDefault = new DNA("valueExpression", {
			transform : function(parser){
				parser.addGroupEntry("valueExpression", "string")
				parser.addGroupEntry("valueExpression", "val")
			}
		})
	}
);
