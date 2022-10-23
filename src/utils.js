'use strict';

/*
 * This file is part of the Dispatcher package.
 *
 * (c) Mark Fluehmann <js.turanga@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

module.exports = {

    /**
    * @returns {boolean}
    */
    isNull: ( arg ) => (arg === null || arg === undefined),

    /**
    * @returns {boolean}
    */
    isString: ( arg ) => typeof arg === 'string',

    /**
    * @returns {boolean}
    */
    isNumber: ( arg ) => !isNaN( arg ),

    /**
    * @returns {boolean}
    */
    isArray: ( arg ) => Array.isArray( arg ),

    /**
    * @returns {boolean}
    */
    isObject: ( arg ) => typeof arg === 'object' && Array.isArray( arg ) === false && arg !== null,

    /**
    * @returns {boolean}
    */
    isFunction: ( arg ) => typeof arg === 'function',

    /**
    * @returns {boolean}
    */
    contains(str, substring, fromIndex) {
        return str.indexOf(substring, fromIndex) !== -1;
    },

    /**
    * @returns {string}
    */
    truncate(str, maxChars, append, onlyFullWords) {

        append = append || "...";
        maxChars = onlyFullWords ? maxChars + 1 : maxChars;

        str = module.exports.trim(str);

        if (str.length <= maxChars)
            return str;

        str = str.substr(0, maxChars - append.length);
  
        //crop at last space or remove trailing whitespace
        str = onlyFullWords ? str.substr(0, str.lastIndexOf(" ")) : trim(str);

        return str + append;
    },

    /**
    * @returns {string}
    */
    trim(str, chars) {
        chars = chars || WHITE_SPACES;
        return ltrim(rtrim(str, chars), chars);
    },

    /**
    * @returns {string}
    */
    crop(str, maxChars, append) {
        return module.exports.truncate(str, maxChars, append, true);
    },

    /**
    * @returns {string}
    */
    lowerCase: ( arg ) => {
        if ( arg === null || arg === undefined ) return arg;

        return arg.toLowerCase();
    },

    /**
    * @returns {string}
    */
    upperCase: ( arg ) => {
        if ( arg === null || arg === undefined ) return arg;

        return arg.toUpperCase();
    },

    /**
    * @returns {string}
    */
    camelCase: ( arg ) => {
        if ( arg === null || arg === undefined ) return arg;

        arg = module.exports.replaceAccents(arg);
        // arg = module.exports.removeNonWord(arg)
        arg = arg
                .replace(/\-/g, " ") //convert all hyphens to spaces
                .replace(/\s[a-z]/g, module.exports.upperCase) //convert first char of each word to UPPERCASE
                .replace(/\s+/g, "") //remove spaces
                .replace(/^[A-Z]/g, module.exports.lowerCase); //convert first char to lowercase
        
        return arg;
    },

    /**
    * @returns {string}
    */
    snakeCase: ( arg ) => {
        if ( arg === null || arg === undefined ) return arg;

        return module.exports.lowerCase(module.exports.camelCase(arg).replace(/([A-Z])/g, '_$1').trim());
    },

    /**
    * @returns {string}
    */
    properCase: ( arg ) => {
        if ( arg === null || arg === undefined ) return arg;

        return module.exports.lowerCase(arg).replace(/^\w|\s\w/g, module.exports.upperCase);
    },

    /**
    * @returns {string}
    */
    pascalCase: ( arg ) => {
        if ( arg === null || arg === undefined ) return arg;

        return module.exports.camelCase(arg).replace(/^[a-z]/, module.exports.upperCase);
    },

    /**
    * @returns {string}
    */
    sentenceCase: (arg) => {
        // Replace first char of each sentence (new line or after '.\s+') to UPPERCASE
        return module.exports.lowerCase(arg).replace(/(^\w)|\.\s+(\w)/gm, module.exports.upperCase);
    },

    /**
    * @returns {string}
    */
    removeNonWord: ( arg ) => {
        return arg.replace(/[^0-9a-zA-Z\xC0-\xFF \-]/g, "");
    },

    /**
    * @returns {string}
    */
    replaceAccents: ( arg ) => {
        // verifies if the String has accents and replace them
        if ( arg.search(/[\xC0-\xFF]/g) > -1 ) {
            arg = arg
                .replace(/[\xC0-\xC5]/g, "A")
                .replace(/[\xC6]/g, "AE")
                .replace(/[\xC7]/g, "C")
                .replace(/[\xC8-\xCB]/g, "E")
                .replace(/[\xCC-\xCF]/g, "I")
                .replace(/[\xD0]/g, "D")
                .replace(/[\xD1]/g, "N")
                .replace(/[\xD2-\xD6\xD8]/g, "O")
                .replace(/[\xD9-\xDC]/g, "U")
                .replace(/[\xDD]/g, "Y")
                .replace(/[\xDE]/g, "P")
                .replace(/[\xE0-\xE5]/g, "a")
                .replace(/[\xE6]/g, "ae")
                .replace(/[\xE7]/g, "c")
                .replace(/[\xE8-\xEB]/g, "e")
                .replace(/[\xEC-\xEF]/g, "i")
                .replace(/[\xF1]/g, "n")
                .replace(/[\xF2-\xF6\xF8]/g, "o")
                .replace(/[\xF9-\xFC]/g, "u")
                .replace(/[\xFE]/g, "p")
                .replace(/[\xFD\xFF]/g, "y");
        }

        return arg;
    }
};

