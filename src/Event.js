'use strict';

/*
 * This file is part of the Dispatcher package.
 *
 * (c) Mark Fluehmann <js.turanga@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const { isObject, isArray } = require( './utils.js' );
const EventException = require( './Exceptions/EventException.js' );

class Event {

    /**
     * Create class instance
     *
     * @param {mixed} subject  events subject
     * @param {mixed} data  complementary event arguments
     * @return void
     */
    constructor( subject, data ) {

        this.subject = subject;

        this.setArguments(data)

        this.propagationStopped = false;
    }


    /**
     * Evaluate if propagation has been stopped
     *
     * @return bool
     */
    isPropagationStopped() {
        return this.propagationStopped;
    }


    /**
     * Stop propagation for further events
     *
     * @return void
     */
    stopPropagation() {
        this.propagationStopped = true;
    }


    /**
     * Get events subject
     *
     * @return bool
     */
    getSubject() {

        return this['subject'];
    }


    /**
     * Apply complementary arguments on event
     *
     * @return {array|object} args
     * @return void
     */
    setArguments( args ) {

        if ( isObject(args) || isArray(args) )
            Object.keys(args).forEach( key => {
                this[key] = args[key];
            })

    }


    /**
     * Event has argument
     *
     * @param {string}  arg
     * @return bool
     */
    hasArgument( arg ) {
        if ( arg === undefined || arg === null )
            return false;

        return arg in this
    }


    /**
     * Get event argument by key or all
     *
     * @return {string} args
     * @return {object|null}
     */
    getArguments( arg ) {

        if ( arg !== undefined && !this.hasArgument(arg) )
            throw new EventException('Event argument not found');

        if ( arg !== undefined && this.hasArgument(arg) )
            return this[arg]

        const props = {};

        Object.keys(this).forEach( key => {

            if ( key !== 'subject' && key !== 'propagationStopped' )
                props[key] = this[key];
        })

        return props;
    }


    serialize() {
        return { subject: this.subject, data: this.data };
    }
};

module.exports = Event;

