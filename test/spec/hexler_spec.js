describe("Hexler", function () {
	var hexler = false;
	var Hexler = require('../../src/hexler').Hexler;
	var fs = require('fs');

	describe("testing a simple rule", function () {

		it("creates new hexler instance", function(){
			hexler = new Hexler();
		});

		it("sets content", function(){
			hexler.setContent("var hans = 'test';")
		});

		it("adds a rule", function(){
			hexler.addRule("keyword = 'var' | val | operator = '=' | string ", { create : "declaration"});
		})

		it("parse rule and check tree", function(){
			var tree = hexler.parse();
		
			expect(tree.type).toBe("programm");
			expect(tree.children[0].type).toBe("declaration");
			expect(tree.children[0].children.length).toBe(4);
		})

	});

	describe("testing with file content", function () {

		it("creates new hexler instance", function(){
			hexler = new Hexler();
		});

		it("sets content", function(done){
			var fileLoaded = false;

			fs.readFile("spec/Mold.js", function(data){

				hexler.setContent(data)
				done()
			});


		});

		it("adds a rule", function(){
			hexler.addRule("keyword = 'var' | val | operator = '=' | string ", { create : "declaration"});
			hexler.addRule("keyword = 'function' ~ replace | + val => 'name' | expression => 'arguments' | block ", { create : "function" })
			hexler.addRule("block => 'object' > | * [ val | operator = ':' | string || function | + comma] ", { ignor : "lineend"});
			hexler.addRule("val (parent.object) |  operator = ':' | string ", { create : "property" });
			hexler.addRule("val (parent.object) |  operator = ':' | function ", { create : "method" });
		})

		it("parse rule and check tree", function(){
			var start = process.hrtime();
			var tree = hexler.parse();
			console.log("TREE", (process.hrtime() - start), tree);
		})

	});


});