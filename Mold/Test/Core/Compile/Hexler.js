//!info transpiled

Seed({
		type : 'data',
		include : [
			{ Kleber : 'Mold.Core.Compile.Kleber' }
		]
	},
	function(Hexler){

		describe("Hexler", function () {
			
			var hexler = false;
			describe("test creating an action", function () {

				it("creates new hexler instance", function(){
					hexler = new Hexler();
				});

				it("sets content", function(){
					hexler.setContent("var hans = 'test';")
				});

				it("add action and parse content", function(){
					var name = 'declaration';
					hexler.createAction("keyword = 'var' => 'var' | val | operator = '=' | ? | lineend || terminator /ib", function(matches, tree){
						//console.log(matches)
						var parent = matches[0].token.parent;
						var newToken = hexler.createToken(name, name,  { loc : matches[0].token.loc });
						parent.replaceChild(matches[0].token, newToken);
						newToken.addChild(matches[0].token);
						for(var i = 1; i < matches.length; i++){
							if(matches[i] === true || matches[i] === undefined){
								continue;
							}
							parent.removeChild(matches[i].token);
							newToken.addChild(matches[i].token);
						}
						expect(tree.children[0].type).toBe("declaration");
						expect(tree.children[0].children.length).toBe(5);
						
					});
					var parsedTree = hexler.parse();
					expect(parsedTree.children[0].children[0].type).toBe('var');
				});

			})



			describe("testing createParent method", function () {

				it("creates new hexler instance", function(){
					hexler = new Hexler();
				});

				it("sets content", function(){
					hexler.setContent("var hans = 'test';")
				});

				it("adds a rule", function(){
					//hexler.addRule("keyword = 'var' ~ create declaration | val | operator = '=' | ? | lineend || terminator /ib")
					hexler.createParent("keyword = 'var' | val | operator = '=' | ? | lineend || terminator /ib", 'declaration');
				})

				it("parse rule and check tree", function(){
					var tree = hexler.parse();
					expect(tree.type).toBe("programm");
					expect(tree.children[0].type).toBe("declaration");
					expect(tree.children[0].children.length).toBe(5);
				})

			});

			describe("testing removeIndex method", function () {

				it("creates new hexler instance", function(){
					hexler = new Hexler();
				});

				it("sets content", function(){
					hexler.setContent("var hans = 'test';")
				});

				it("execute removeIndex", function(){
					hexler.removeIndex("keyword = 'var' | val | operator = '=' | ? | lineend || terminator /ib", 1);
				})

				it("parse rule and check tree", function(){
					var tree = hexler.parse();
					//console.log('hexler', tree)
					expect(tree.children.length).toBe(4);
					expect(tree.children[1].type).toBe('operator');
				})

			});

			describe("testing removeAll method", function () {

				it("creates new hexler instance", function(){
					hexler = new Hexler();
				});

				it("sets content", function(){
					hexler.setContent("var hans = 'test';")
				});

				it("execute removeAll", function(){
					hexler.removeAll("keyword = 'var' | val | operator = '=' | ? | lineend || terminator /ib");
				})

				it("parse rule and check tree", function(){
					var tree = hexler.parse();
				//	console.log('hexler', tree)
					expect(tree.children.length).toBe(0);
				})

			});

			describe("testing firstToParent method", function () {

				it("creates new hexler instance", function(){
					hexler = new Hexler();
				});

				it("sets content", function(){
					hexler.setContent("var hans = 'test';")
				});

				it("execute firstToParent", function(){
					hexler.firstToParent("keyword = 'var' | val | operator = '=' | ? | lineend || terminator /ib");
				})

				it("parse rule and check tree", function(){
					var tree = hexler.parse();
					//console.log('hexler', tree)
					expect(tree.children[0].type).toBe("keyword");
					expect(tree.children.length).toBe(1);
					expect(tree.children[0].children.length).toBe(4);
				})

			});

			describe("test groups", function(){
				it("creates new hexler instance", function(){
					hexler = new Hexler();
				});

				it("adds a group", function(){
					hexler.addGroupEntry("testgroup", "eins");
					hexler.addGroupEntry("testgroup", "zwei");
					expect(hexler.groups.length).toBe(1)
					expect(hexler.groups[0].values.length).toBe(2);
				});

				it("test rules replacement", function(){
					var testRule = "keyword = 'var' | val | operator = '='| ${testgroup}";
					var parsedRule = hexler.parseRuleStringForGroups(testRule);
					expect(parsedRule).toBe("keyword = 'var' | val | operator = '='| eins || zwei");
				})

			})



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
						//console.log("content", data)
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
					//console.log("TREE", (test() - start), tree);
				})

			});


		});
	}
)