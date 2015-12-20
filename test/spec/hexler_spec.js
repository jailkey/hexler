describe("Hexler", function () {
	var hexler = false;


	if(window){
		var Hexler = window.Hexler;
		var fs = window.fs;
		var test = performance.now.bind(performance);
	}else{
		var Hexler = require('../../src/hexler');
		var fs = require('fs');
		var test = process.hrtime.bind(process)
	}

	describe("testing a simple rule", function () {

		it("creates new hexler instance", function(){
			hexler = new Hexler();
		});

		it("sets content", function(){
			hexler.setContent("var hans = 'test';")
		});

		it("adds a rule", function(){
			hexler.addRule("keyword = 'var' ~ create declaration | val | operator = '=' | ? | lineend || terminator /ib");
		})

		it("parse rule and check tree", function(){
			var tree = hexler.parse();
			console.log('hexler', tree)
			expect(tree.type).toBe("programm");
			expect(tree.children[0].type).toBe("declaration");
			expect(tree.children[0].children.length).toBe(5);
		})

	});




	xdescribe("test file with broken brackets", function(){

		var fileName = "spec/test_wrong_brackets.js";
		it("create hexler and loads files", function(done){
			hexler = new Hexler();
			fs.readFile(fileName, function(data){
				hexler.setContent(data.responseText)
				done()
			});
		})

		it("try to parse brocken file", function(){
			expect(function() { hexler.parse(fileName) }).toThrow(new SyntaxError('Missing ) after block in spec/test_wrong_brackets.js line 4!'));
		})
	})

	xdescribe("test file with missing brackets", function(){

		var fileName = "spec/test_missing_brackets.js";
		it("create hexler and loads files", function(done){
			hexler = new Hexler();
			fs.readFile(fileName, function(data){
				hexler.setContent(data.responseText)
				done()
			});
		})

		it("try to parse brocken file", function(){
			expect(function() { hexler.parse(fileName) }).toThrow(new SyntaxError('Missing ) after block in spec/test_missing_brackets.js line 4!'));
		})
	})

	xdescribe("testing with file content", function () {

		it("creates new hexler instance", function(){
			hexler = new Hexler();
		});

		it("sets content", function(done){
			var fileLoaded = false;

			fs.readFile("spec/Mold.js", function(data){
				console.log("content", data)
				hexler.setContent(data.responseText)
				done()
			});


		});

		it("adds some rules", function(){
			hexler.addRule("keyword = 'var' | val | operator = '=' | string ", { create : "declaration"});
			hexler.addRule("keyword = 'function' ~ replace function | + val => 'name' | expression => 'arguments' | block ")
			hexler.addRule("block => 'object' > | * [ val | operator = ':' | string || function | + comma] ", { ignor : "lineend"});
			hexler.addRule("val (parent.object) |  operator = ':' | string ", { create : "property" });
			hexler.addRule("val (parent.object) |  operator = ':' | function ", { create : "method" });
		})

		it("parse rule and check tree", function(){
			var start = test();
			var tree = hexler.parse();
			console.log("TREE", (test() - start), tree);
		})

	});


});