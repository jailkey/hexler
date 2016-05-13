//!info transpiled
Seed({
		type : 'data',
	},
	function(Expression){
		var expression = null;
		describe("test expression", function(){
			it("create new expression", function(){
				expression = Expression("val (parent.memberExpression) => 'memberValue'");
				console.log("expression", expression)
			})
		})
	}
)