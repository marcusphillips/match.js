////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
//// QOMBAT Matching - Marcus Phillips 2009
//// A Readable Expressions library
////
//// Version ~0.1
//// Please report any bugs to qombat@marcusphillips.com
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

(function(){

  ////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////
  ////
  //// Setup

  var M = QOMBAT._initialize_module({
    NAME : 'matching',
    SHORTCUT : 'M',
    DELEGATE : 'match'
  });

  ////
  ////
  ////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////








  M.match = function(){
    var flags = {}, flags_string, pattern_string = '', which, argument;
    for( which = 0; which < arguments.length; which++ ){
      argument = arguments[which];
      if( argument instanceof RegExp ){ // argument is a regex object
        argument = M._strip_pattern(argument);
        pattern_string = pattern_string.concat(argument);
      }else if( typeof argument === 'string' ){ // argument is a string
        pattern_string = pattern_string.concat(M._escape(argument));
      }else if( argument === M.global ){
        flags.global = true;
      }else if( argument === M.insensitive ){
        flags.insensitive = true;
      }else if( argument === M.multi_line ){
        flags.multi_line = true;
      }else{
        throw 'Bad argument passed to M()';
      }
    }
    flags_string = '';
    if( flags.global      ){
      flags_string = flags_string.concat('g');
    }
    if( flags.insensitive ){
      flags_string = flags_string.concat('i');
    }
    if( flags.multi_line  ){
      flags_string = flags_string.concat('m');
    }

    if( ! M._compileds[pattern_string] ){ M._compileds[pattern_string] = {}; }
    if( ! M._compileds[pattern_string][flags_string] ){
      M._compileds[pattern_string][flags_string] = new RegExp(pattern_string, flags_string);
    }
    return M._compileds[pattern_string][flags_string];
  };
  M._compileds = {};
  M.global      = {'flag':'global'};
  M.insensitive = {'flag':'insensitive'};
  M.multi_line  = {'flag':'multi_line'};

  M.beginning = new RegExp('^');
  M.end = new RegExp('$');
  M.boundary = new RegExp('\\b');
  M.non_boundary = new RegExp('\\B');
  M.null_character = new RegExp('\\0');
  M.new_line = new RegExp('\\n');
  M.form_feed = new RegExp('\\f');
  M.carriage_return = new RegExp('\\r');
  M.tab = new RegExp('\\t');
  M.vertical_tab = new RegExp('\\v');
  M.word_character = new RegExp('\\w');
  M.non_word_character = new RegExp('\\W');
  M.digit = new RegExp('\\d');
  M.non_digit = new RegExp('\\D');
  M.whitespace_character = new RegExp('\\s');
  M.non_whitespace_character = new RegExp('\\S');
  M.line_character = new RegExp('.');
  M.lower_alphas = new RegExp('[a-z]');
  M.upper_alphas = new RegExp('[A-Z]');
  M.alphas = new RegExp('[A-z]');
  M.numerics = new RegExp('[0-9]');
  M.lower_alphanumerics = new RegExp('[0-9a-z]');
  M.upper_alphanumerics = new RegExp('[0-9A-Z]');
  M.alphanumerics = new RegExp('[0-9A-z]');

  M.range = function( from, to ){
    if( from.toString().length !== 1 || to.toString().length !== 1 ){ throw 'M.range() requires single characters for from and to'; }
    return new RegExp('['+from+'-'+to+']');
  };

  M.grouping = function(){
    return new RegExp('('+ M._atomized( M._strip_pattern( M.apply({}, arguments ), true ) ) +')');
  };

  M.backreference = function( which ){
    return new RegExp('\\'+which);
  };

  M.maybe = function(){
    return new RegExp( (arguments.length ? M._atomized(M._strip_pattern(M.apply({}, arguments))) : '[^]') + '?' ); // note: [^] matches any character including line breaks
  };

  M.any = function(){
    return new RegExp( (arguments.length ? M._atomized(M._strip_pattern(M.apply({}, arguments))) : '[^]') + '*' );
  };

  M.some = function(){
    return new RegExp( (arguments.length ? M._atomized(M._strip_pattern(M.apply({}, arguments))) : '[^]') + '+' );
  };

  M.exactly = function( howmany, pattern ){ // todo: make this wrap M()
    if( typeof pattern === 'string' ){ pattern = M._escape(pattern); }
    if( pattern instanceof RegExp ){ pattern = M._strip_pattern(pattern); }
    return new RegExp( M._atomized(pattern) + '{'+howmany+'}' );
  };

  M.at_least = function( minimum, pattern ){ // todo: make this wrap M()
    if( typeof pattern === 'string' ){ pattern = M._escape(pattern); }
    if( pattern instanceof RegExp ){ pattern = M._strip_pattern(pattern); }
    return new RegExp( M._atomized(pattern) + '{'+minimum+',}' );
  };

  M.at_most = function( maximum, pattern ){ // todo: make this wrap M()
    if( typeof pattern === 'string' ){ pattern = M._escape(pattern); }
    if( pattern instanceof RegExp ){ pattern = M._strip_pattern(pattern); }
    return new RegExp( M._atomized(pattern) + '{0,'+maximum+'}' );
  };

  M.between = function( minimum, maximum, pattern ){ // todo: make this wrap M()
    if( typeof pattern === 'string' ){ pattern = M._escape(pattern); }
    if( pattern instanceof RegExp ){ pattern = M._strip_pattern(pattern); }
    return new RegExp( M._atomized(pattern) + '{'+minimum+','+maximum+'}' );
  };

  // todo: this is code duplication with m.or()
  // todo: make it accept character ranges
  M.nor = function(){
    var which;
    var argument;
    var characters = [];
    for( which=0; which < arguments.length; which++ ){
      argument = arguments[which];
      if( typeof argument !== 'string' || argument.length !== 1 ){ throw 'M.nor() only accepts single characters'; }
      if( argument.length === 0 ){ throw 'empty string is not a valid option for M.nor()'; }
      if( argument.length === 1 ){
        // escpae all the special characters in the character set
        if( argument === '^' || argument === ']' || argument === '\\' ){
          argument = '\\'+argument;
        }else if( argument === '-' ){
          if( characters[0] !== '-' ){ // this prevents multiple "-" characters from being added to the end of the char set
            characters.unshift(argument);
          }
        }else{
          characters.push(argument);
       }
      }else{
        options.push(M._escape(argument));
      }
    }
    return new RegExp( '[^'+ characters.join('') +']' );
  };

  M.or = function(){
    var which;
    var argument;
    var options = [];
    var characters = [];
    var stripped_pattern;
    for( which=0; which < arguments.length; which++ ){
      argument = arguments[which];
      if( typeof argument === 'string' ){
        if( argument.length === 0 ){ throw 'empty string is not a valid option for M.or()'; }
        if( argument.length === 1 ){
          // escpae all the special characters in the character set
          if( argument === '^' || argument === ']' || argument === '\\' ){
            argument = '\\'+argument;
          }else if( argument === '-' ){
            if( characters[0] !== '-' ){ // this prevents multiple "-" characters from being added to the end of the char set
              characters.unshift(argument);
            }
          }else{
            characters.push(argument);
          }
        }else{
          options.push(M._escape(argument));
        }
      }else if( argument instanceof RegExp ){
        stripped_pattern = M._strip_pattern(argument);
        if( stripped_pattern[0] === '[' && M._atom_count(stripped_pattern) === 1 ){
          characters.push(stripped_pattern.substr(1, stripped_pattern.length-2));
        }else{
          options.push(stripped_pattern);
        }
      }else{
        throw 'unknown type passed to M.or()';
      }
    }
    if( characters.length ){
      options.push(characters.length === 1 ? characters.join('') : '['+ characters.join('') +']' );
      if( options.length === 1 ){ return new RegExp(options[0]); }
    }
    if( options.length === 1 ){ throw 'you must provide more than one option to M.or()'; }
    return new RegExp( M._atomized(options.join('|')) );
  };







  /// internal helpers

  M._strip_pattern = function(pattern){
    if( ! pattern instanceof RegExp ){ throw 'String passed to M._strip_pattern()'; }
    pattern = pattern.toString();
    if( pattern.substr(-1, 1) !== '/' ){ throw 'You cannot pass a parameterized regex into a QOMBAT_matcher method'; }
    return pattern.substr(1, pattern.length-2); // take off the leading and trailing slash of the pattern string to prepare for aggregation with other arguments
  };
  // accepts a regex containing ONLY a set of valid things to match and returns the string within the brackets
  M._strip_set = function(set){
    return M._strip_pattern(set).substr(1,set.length-2);
  };

  // takes a string, returns the number of regex atoms in it
  M._atom_count = function( string ){
    var first = string[0], last = string[string.length-1];
    if( 2 <= string.length ){ // checking if there are atom modifiers on the end of this
      if( string[string.length-2] !== '\\' ){ // if the last character is not escaped
        if( last === '+' || last === '?' || last === '*' ){
          string = string.substr(0,string.length-1);
        }else if( last === '}' ){
          var unfixed = true;
          for( var which = string.length-1; 0 <= which; which-- ){
            if( string[which] === '{' ){
              string = string.substr(0,which+1);
              unfixed = false;
              break;
            }
            if( unfixed ){ throw 'somehow, we failed to match the quantifier opener for truncation'; }
          }
        }
        last = string[string.length-1];
      }
    }
    if(
      string.length === 1 ||
      first === '[' && last === ']' || //todo: make sure these ending characters are not escaped characters (such as in "[asdf]jkl\]", which is meant to match "djkl]")
      first === '(' && last === ')' ||
      (// this tests to see if the string is a single, escaped special character
        string.length === 2 &&
        string[0] === '\\' &&
        M._escape(string[1]) === string
      )
    ){ // todo: this will name "()()" as atom size 1
      return 1;
    }else{
      return 'todo: atom counting not well supported yet';
    }
  };

  // makes a pattern atomic
  M._atomized = function( atom ){
    if( atom instanceof RegExp ){ atom = M._strip_pattern(atom); }
    if( atom.length === 0 ){ throw 'atomizing a string of length 0?'; }
    if( M._atom_count(atom) !== 1 ){
      atom = '(?:'+ atom +')';
    }
    return atom;
  };

  M._escape = function( string ){
    var special_characters = "$()*+./?[\\]^{|}";
    M._escape.matcher = M._escape.matcher || new RegExp('(\\'+ Array.prototype.slice.call( special_characters ).join('|\\') +')', 'g');
    return string.replace(M._escape.matcher, '\\$1');
  };



})();
