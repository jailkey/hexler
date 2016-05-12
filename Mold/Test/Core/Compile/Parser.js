//!info transpiled
Seed({
		type : 'data',
	},
	function(Parser){
		var parser = null;

		describe("test Parser", function(){
			it("create parser instance", function(){
				parser = new Parser();
				expect(parser).not.toBe(null);
			})

			it("parse a function", function(){
				var tree = parser.parse("export {testDefault as default};")
				console.log("tree", tree)
				expect(tree.children[0].type).toBe("val");
				expect(tree.children[1].type).toBe("block");
					expect(tree.children[1].children[0].type).toBe("val");
					expect(tree.children[1].children[1].type).toBe("val");
					expect(tree.children[1].children[2].type).toBe("keyword");
				expect(tree.children[2].type).toBe("terminator");
				
			})

			it("parse a function expression", function(){
				var tree = parser.parse("var test = function(){ };")

				expect(tree.children[0].type).toBe("keyword");
				expect(tree.children[1].type).toBe("val");
				expect(tree.children[2].type).toBe("operator");
				expect(tree.children[3].type).toBe("keyword");
				expect(tree.children[4].type).toBe("expression");
				expect(tree.children[5].type).toBe("block");
				expect(tree.children[6].type).toBe("terminator");
			})

			it("parse text operator", function(){
				var tree = parser.parse("for(var test in irgendwas)")
				expect(tree.children[1].children[0].type).toBe("keyword");
				expect(tree.children[1].children[1].type).toBe("val");
				expect(tree.children[1].children[2].type).toBe("operator");
				expect(tree.children[1].children[3].type).toBe("val");
			})

			it("parse a comment", function(){
				var tree = parser.parse("test /* asdasd asd\n asdasd */");
				console.log("tree", tree)
				expect(tree.children[0].type).toBe("val");
				expect(tree.children[1].type).toBe("comment");
			});
		})

	}
);