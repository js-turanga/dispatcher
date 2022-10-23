'use strict';

/*
 * This file is part of the Dispatcher package.
 *
 * (c) Mark Fluehmann <js.turanga@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

class DispatcherException extends Error {

    constructor(message, code, meta) {

        super(message);
        
        this.name = "DispatcherException";

        this.meta = meta;

    }

}

module.exports = DispatcherException;
