"use strict";
(function(global){

	//Stolen from https://github.com/mozilla/source-map/blob/master/dist/source-map.js
	//
	var Base64 = function(number){
		var intToCharMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');

		if (0 <= number && number < intToCharMap.length) {
		  return intToCharMap[number];
		}
		throw new TypeError("Must be between 0 and 63: " + number);
	}


	var VLQ = function(){

		
		var VLQ_BASE_SHIFT = 5;
		var VLQ_BASE = 1 << VLQ_BASE_SHIFT;
		var VLQ_BASE_MASK = VLQ_BASE - 1;
		var VLQ_CONTINUATION_BIT = VLQ_BASE;

		function toVLQSigned(aValue) {
			return aValue < 0
			  ? ((-aValue) << 1) + 1
			  : (aValue << 1) + 0;
		}


		function fromVLQSigned(aValue) {

			var isNegative = (aValue & 1) === 1;
			var shifted = aValue >> 1;
			return isNegative ? -shifted: shifted;
		}

		function base64Encode(value){
			/*
			return btoa(encodeURIComponent(value).replace(/%([0-9A-F]{2})/g, function(match, p1) {
				return String.fromCharCode('0x' + p1);
			}));*/
		}

		return {
			encode : function base64VLQ_encode(aValue) {
				var encoded = "";
				var digit;

				var vlq = toVLQSigned(aValue);

				do {
					digit = vlq & VLQ_BASE_MASK;
					vlq >>>= VLQ_BASE_SHIFT;
					if (vlq > 0) {
						digit |= VLQ_CONTINUATION_BIT;
					}
					encoded += Base64(digit);
				} while (vlq > 0);
				//return aValue;
				return encoded;
			},
			/*
			decode : function base64VLQ_decode(aStr, aIndex, aOutParam) {
				var strLen = aStr.length;
				var result = 0;
				var shift = 0;
				var continuation, digit;

				do {
					if (aIndex >= strLen) {
						throw new Error("Expected more digits in base 64 VLQ value.");
					}

					digit = base64.decode(aStr.charCodeAt(aIndex++));
					if (digit === -1) {
						throw new Error("Invalid base64 digit: " + aStr.charAt(aIndex - 1));
					}

					continuation = !!(digit & VLQ_CONTINUATION_BIT);
					digit &= VLQ_BASE_MASK;
					result = result + (digit << shift);
					shift += VLQ_BASE_SHIFT;
				} while (continuation);

				aOutParam.value = fromVLQSigned(result);
				aOutParam.rest = aIndex;
			}*/
		}
	}

	var SourceMap = function(file, content){
		this.names = [];
		this.mappings = [];
		this.rawMappings = [];
		this.lastGeneratedLine = 1;
		this.lastOriginalColumn = 0;
		this.lastGeneratedColumn = 0;
		this.lastOriginalLine = 0;
		this.vlq = new VLQ();
		this.files = [];
		this.files.push(file);
		//this.
		this.mapFile = file + ".map";
		this.sourcesContent = [];
			console.log("sm", content)
		this.sourcesContent.push(content);
	}

	SourceMap.prototype = {

		addMapping : function(generatedLine, generatedColumn, originalLine, originalColumn, originalFile, name, code){
			var output = "";

			if(this.lastGeneratedLine !== generatedLine){

				while(this.lastGeneratedLine < generatedLine){
					output += ";"
					this.lastGeneratedLine++;
				}
			}
			output += this.vlq.encode(generatedColumn - this.lastGeneratedColumn);
			this.lastGeneratedColumn = generatedColumn;
			
			output += this.vlq.encode(0);
			output += this.vlq.encode(originalLine - 1 - this.lastOriginalLine);		
			this.lastOriginalLine = originalLine - 1;

			output += this.vlq.encode(originalColumn );
			this.lastOriginalColumn = originalColumn;
			if(name){
				this.names.push(name);

				output += this.vlq.encode(this.names.length - 1);
			}

			this.mappings.push(output);
		},
		createMapping : function(){
			var output = "";
			var len = this.mappings.length;
			for(var i = 0; i < len; i++){
				output += this.mappings[i];
				//console.log("I", i, len, this.mappings[i + 1], this.mappings[i + 1].indexOf(';') )
				if((i + 1) < this.mappings.length && this.mappings[i + 1].indexOf(';') < 0){
					output += ",";
				}
			}
			return output;
		},
		create : function(){

			return {
				version : 3,
				file : this.mapFile,
				sourceRoot : "",
				sources: this.files,
				names: this.names,
				mappings: this.createMapping(),
				//sourcesContent : this.sourcesContent
			}
		}	
	}

	global.SourceMap = SourceMap;

}(window))