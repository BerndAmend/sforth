// This file only includes everything necessary to bootstrap the rest
// directly from forth files

// TODO implement it in a faster way
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

var Forth = {

	compiler_message_handler: function(str) {},

	forth_mangling: {
			"=": "$eq",
			">": "$greater",
			"<": "$less",
			"+": "$plus",
			"-": "$minus",
			"*": "$times",
			"/": "div",
			"!": "$bang",
			"@": "$at",
			"#": "$hash",
			"%": "$percent",
			"^": "$up",
			"&": "$amp",
			"~": "$tilde",
			"?": "$qmark",
			"|": "$bar",
			"\\": "$bslash",
			":": "$colon",
			"$": "$dollar",
			"€": "$euro"
		},
	forth_mangling_prefix: "gff_", // short for generated forth function

	forth_mangleName: function(str) {
			var result = str.toLowerCase();

			for(var s in forth_mangling) {
				result = result.replaceAll(s, forth_mangling[s]);
			}

			return forth_mangling_prefix + result;
		},

	forth_demangleName: function(str) {
			if(str.substr(0,forth_mangling_prefix.length) != forth_mangling_prefix)
				throw new Error("not a mangled function name");

			var result = str.substr(forth_mangling_prefix.length);

			for(var s in forth_mangling) {
				result = result.replaceAll(forth_mangling[s], s);
			}
			return result.toLowerCase();
		},

	forth_compile: function(code) {
			// unify line endings
			var clean_code = code.replace(/\r\n/gm, '\n')
								.replace(/\n/gm, ' \n ');

			// tokenize code
			var tokens=clean_code.split(" ");

			var generated_code = "";

			// go thru the list of compiler plugins and ask every plugin if it can handle the character
			//



			//return tokens.

			return clean_code; // generated_code;
		},

	forth_run: function(code) {
			this.compiler_message_handler(this.forth_compile(code));
			//eval(forth_compile(code));
		}
}
