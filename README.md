# Hexler
A dynamic extendable parser with a simple pattern description language.

## how does hexler work?
Hexler creates a simple minimal tree from the given code. The tree can be modified by rules. This approach helps you to parse only things are needed in the app. For example: you wish to transpile arrow functions into standard functions, so you add a rule for it and the parser don't have to parse more then this required rules. Rules can be written in simple meta language (pdl). 


## default tree
If no rules are defined the returned tree has only the following node types:
  
  - programm - the root node with information about the file or script
  - string - string nodes (default " and ')
  - keyword - keywords nodes (default all javascript keywords)
  - val - value nodes are all node which don't fit into a other nodes pattern
  - operator - operater nodes (default are all javascript operators)
  - terminator - nodes with the defined terminator (default is ;)
  - lineend - line end nodes (default is \n)
  - comment - comment nodes (default /* */ for multiline and // for singleline comments)
  - comma - comma nodes
  - block - block nodes are all nodes wich start with { and ands with }
  - expression - expression nodes start with ( and ends with )
  - list - list nodes starts with [ and ends with ]
  

## install
```
	npm install hexler
```

## include

#### node
```javascript
	var Hexler = require('hexler');
```

#### browser
```html
	<script type="text/javascript" src="node_modules/hexler/src/hexler.js"></script>
```

## usage

#### crate an instance

```javascript
	var hexler = new Hexler();
```
#### add code to the parser
 
 ```javascript
 	hexler.setContent('var myTest = "this is a test";');
 ```
 
#### parse
 
 ```javascript
 	var tree = hexler.parse();
 ```
 
Hexler parsed the given content an creates a tree from it, the tree looks like this:

	* programm
		* keyword (var)
		* val (hans)
		* operator (=)
		* string (test)
		* terminator (;)
		

#### creating rules
to modify the tree we can crate rules:
 
 ```javascript
  hexler.createParent(
      "keyword = 'var' | val | operator = '=' | ? | lineend || terminator", 
      'declaration'
  );
 ```
the ```createParent``` method accepts two arguments, the first one is the rule pattern, the second one is the name for the new token.
 
The rule above transforms the tree to the following:
	
	* programm
		* declaration
			* keyword (var)
			* val (hans)
			* operator (=)
			* string (test)
			* terminator (;)
		
 
  
## the pattern discription language
Rules for Hexler are defined in a pattern discription language. With this meta language you can easily discribe patterns in the tree. The language contains the following parts:

#### seperator |
The seperator splits the pattern into rules for each node. The example above matches a sequenz of five nodes. The pattern for each node is described in the rules beetween the vertical bars.

#### node type
Every ndoe rule needs a type definition, this is done by writing the type name.
``` keyword | val ``` for example discribes a sequenz of to nodes. The first from type *keyword* the seconds type is *val* .

##### logical node type operations
If the pattern has to match more then one node type, logical operators *or (||)* and *and (&&)* can be used. For example ``` lineend || terminator ``` describes a pattern for nodes with the type *lineend* or *terminator*.

##### node type wildcard
If the pattern should match all types, the question mark *(?)* can be used

##### optional nodes
To mark a node as optional the plus *(+)*

#### node value
To match a special node value the euqal sign in used *(=)*. For example ``` val = 'var'``` matches a node with type 'val' and value 'var'.

#### node conditions
to define a node condition Hexler use parentheses. Inside the condition operators for 'parent' can be used. For example ```val (parent.object)``` matches all node with type *val* which has a parent node with *type object*.

#### child nodes
to tell a rule that it has to check the child tree > can be used.

#### sub rules
Sometimes it is necessary to match a set of rules. For example if you will match an object literal you can create a rule like this:

```javascript
hexler.addRule(
	"block => 'object' > | * [ val | operator = ':' | string || function | + comma] \ib",
);
```
in the second part of the rule (after the block), a subrule is defined. The subrule matches the block content, the * marks the complete subrule as multible, means matchs 'one or more' times.


##### retyping
to retype a node the ```=>``` operator can be used. For example  if we cahnge ```val => name``` in the code, the node type of the *val* node becomes *name*.


##### modifier
currently only the modifier /ib (ignor breaks) is availabel, if the modifier is set lineendings will be ignored.


	
	
## hexler methods

#### .setContent( content )
The set content method sets the content that should be parsed. The method expects a string with the content.

#### .parse()
The parse method parse the content by the given rules and returns a convertert tree. If no rules given a standard tree will returned.

#### .createToken( type, value, [options] )
A factory method to create new tokens. The method expects the arguments type for the node type and value for the node value. The optional option object can contain a loc object with the properties 'line' and 'charPosition'.

#### .createAction( rule, action )
The methods creates a custom action for a specific rule. Expected arguments are the 'rule' string and a action callback. The callback will be called with a 'matched' parameter that contains the matched nodes and and a tree parameter taht contains th hole tree.

#### .createParent( rule, type, [properties])
Creates a new parent node if the rule matches, the matched nodes becomes children of it. Expected arguments are 'rule' the rule to match, 'type' the token type and an optional properties object that will be added to the new token.

#### .removeIndex( rule, index )
Removes a specific token from the tree. The method expects the arguments 'rule' for the matching rule and 'index'  for the matching index of the rule.

#### .removeAll( rule )
Removes all matched tokens. Expects only a rule as argument.


