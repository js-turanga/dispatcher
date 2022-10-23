'use strict';

/*
 * This file is part of the Dispatcher package.
 *
 * (c) Mark Fluehmann <js.turanga@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const Event = require( './Event.js' );
const DispatcherException = require( './Exceptions/DispatcherException.js' );
const { isNull, isString, isArray, isObject, isFunction, snakeCase } = require( './utils.js' );

class Dispatcher {

    /**
     * Create a new class instance.
     */
    constructor() {
        this.listeners = {};

        this.wildcardListeners = {};

        this.cached = {};
    }


    /**
     * Register an event listener with the dispatcher.
     *
     * @param {string|array}  events
     * @param {callable|array}  listener
     * @return void
     */
    listen( events, listener ) {

        if ( !isString(events) && !isArray(events) )
            throw new DispatcherException('Failed to register event. Events should be provided as string or array of strings');

        events = isArray(events) ? events : [events];

        events.forEach( event => {

            event = snakeCase(event);

            if ( event.includes('.*') === false ) {

                if (! this.listeners[event] )
                    this.listeners[event] = []

                this.listeners[event].push(listener)
            }

            if ( event.includes('.*') === true ) {

                if (! this.wildcardListeners[event] )
                    this.wildcardListeners[event] = []

                this.wildcardListeners[event].push(listener)
            }

            delete this.cached[event];        
        })
    }


    /**
     * Removes one or all event listener from the specified event.
     *
     * @param {string}  event
     * @param {mixed}  listener
     * @return void
     */
    unlisten( event, listener = null ) {

        event = snakeCase(event);

        if ( isNull(listener) ) {
            delete this.listeners[event];
            delete this.wildcardListeners[event];
        }

        if ( event.includes('.*') === false )
            this.unregisterListener(event, listener);

        if ( event.includes('.*') === true )
            this.unregisterWildcardListener(event, listener);

    }


    /**
     * Register an event subscriber with the dispatcher.
     *
     * @param {mixed} subscriber
     * @return void
     */
    subscribe( subscriber ) {

        if ( !isObject(subscriber) || typeof subscriber.getSubscribedEvents !== 'function' )
            throw new DispatcherException('Subscriber must be of type object and must implement getSubscribedEvents method');

        const events = subscriber.getSubscribedEvents()

        Object.entries(events).forEach( entry => {

            let [event, args] = entry;

            event = snakeCase(event);

            if ( isString(args) )
                this.listen(event, [subscriber, args])

            if ( isArray(args) )
                args.forEach( method => {
                    this.listen(event, [subscriber, method])
                })

        })
    }


    /**
     * Removes a registered subscriber
     *
     * @param {mixed} subscriber
     * @return void
     */
    unsubscribe( subscriber ) {

        if ( !isObject(subscriber) || typeof subscriber.getSubscribedEvents !== 'function' )
            throw new DispatcherException('Subscriber must be of type object and must implement getSubscribedEvents method');

        const events = subscriber.getSubscribedEvents()

        Object.entries(events).forEach( entry => {

            let [event, args] = entry;

            event = snakeCase(event);

            if ( isString(args) )
                this.unlisten(event, [subscriber, args])

            if ( isArray(args) )
                args.forEach( method => {
                    this.unlisten(event, [subscriber, method])
                })

        })
    }


    /**
     * Fire an event and call the listeners.
     *
     * @param {string|object}  event
     * @param  {mixed}  args
     * @return {array|null}
     */
    dispatch( event, args = null ) {

        const isStoppable = event.constructor.name === 'Event' || 
                            Object.getPrototypeOf(event.constructor).name === 'Event';

        const [eventName, payload] = this.parseEventAndPayload(event, args);

        const listeners = this.getListeners(eventName);

        const responses = [];

        Object.values(listeners).forEach( listener => {

            listener = this.rebuildListener(listener);

            let propagationStopped = isStoppable && event.isPropagationStopped()

            if ( !propagationStopped )
                responses.push( listener(payload, this) );   
        })

        return responses;
    }


    /**
     * Checks whether an event has any registered listeners.
     *
     * @param {string}  event
     * @return {bool}  true if the specified event has any listeners, false otherwise
     */
    hasListeners( event = null ) {

        event = snakeCase(event);

        const listener = this.listeners[event] || []
        const wListener = this.wildcardListeners[event] || []

        if ( !isNull(event) )
            return Object.keys(listener).length > 0 || Object.keys(wListener).length > 0 ;

        const listeners = Object.assign({}, this.listeners, this.wildcardListeners)

        return Object.keys(listeners).length > 0;
    }


    /**
     * Get all of the listeners for a given event name
     *
     * @param {string}  event
     * @return {object}  event listeners for the specified event, or all event listeners by event name
     */
    getListeners( event = null ) {

        event = snakeCase(event);

        const wEvent = this.buildWildcardEvent(event);

        if (! isNull(event) ) {

            const listener = this.listeners[event] || []
            const wListener = this.wildcardListeners[wEvent] || []

            if ( Object.keys(listener).length === 0 && Object.keys(wListener).length === 0 )
                return {}

            if (! this.cached[event] )
                this.buildCache(event);

            return Object.assign({}, this.cached[event] ?? {}, this.cached[wEvent] ?? {})
        }

        const listeners = Object.assign({}, this.listeners, this.wildcardListeners)

        Object.keys(listeners).forEach( event => {
            if (! this.cached[event] )
                this.buildCache(event);
        })

        return Object.assign({}, this.cached)
    }


    /**
     * Build cache of listeners including resolved lazy listeners
     *
     * @param {mixed}  event
     * @return void
     */
    buildCache( event = null ) {

        const wEvent = this.buildWildcardEvent(event);

        if ( this.listeners[event] )
            Object.keys(this.listeners[event]).forEach( key => {

                if (! this.cached[event] ) 
                    this.cached[event] = {};

                this.cached[event][key] = this.listeners[event][key];
            })

        if ( this.wildcardListeners[wEvent] )
            Object.keys(this.wildcardListeners[wEvent]).forEach( key => {

                if (! this.cached[wEvent] ) 
                    this.cached[wEvent] = {};

                this.cached[wEvent][key] = this.wildcardListeners[wEvent][key];
            })        
    }


    /**
     * Rebuild listener for closure based listeners
     *
     * @param {mixed}  listener
     * @return {callable|array} 
     */
    rebuildListener( listener ) {

        if ( isObject(listener) && typeof listener.__invoke === 'function' )
            listener = listener['__invoke'].bind(listener)

        if ( isArray(listener) && listener.length <= 2 && typeof listener[0] === 'function' ) {
            listener[0] = listener[0]()
            listener[1] = listener[1] || '__invoke';
        }

        if ( isArray(listener) && listener.length == 2 && typeof listener[0] !== 'function' )
            listener = listener[0][listener[1]].bind(listener[0]);

        return listener;
    }

    /**
     * Parse the given event and payload and prepare them for dispatching.
     *
     * @param {mixed}  event
     * @param {mixed}  payload
     * @return array
     */
    parseEventAndPayload( event, payload ) {

        // is Event class
        if ( isObject(event) && event.constructor.name === 'Event' ) {
            payload = event
            event = event.constructor.name
        }

        // extends Event class
        if ( isObject(event) && Object.getPrototypeOf(event.constructor).name === 'Event' ) {
            payload = payload || event
            event = event.constructor.name
        }

        if ( isObject(event) && event.name !== undefined ) {
            payload = payload || event
            event = event.name
        }

        return [snakeCase(event), payload];
    }


    /**
     * Unregister listener
     *
     * @param {string}  event
     * @param {mixed}  listener
     * @return void
     */
    unregisterListener( event, listener ) {

        if (! this.listeners[event] )
            return;

        const listeners = this.listeners[event];

        Object.entries(listeners).forEach( entry => {

            const [key, cb] = entry;

            if ( cb == listener || ( isArray(listener) && cb[1] == listener[1]) ) {
                delete this.listeners[event][key];
                delete this.cached[event];
            }
        })

        if (! this.listeners[event][0] ) {
            delete this.listeners[event];
            delete this.cached[event];
        }
    }


    /**
     * Unregister listener
     *
     * @param string  event
     * @param mixed  listener
     * @return void
     */
    unregisterWildcardListener( event, listener ) {

        if (! this.wildcardListeners[event] )
            return;

        const listeners = this.wildcardListeners[event];

        Object.entries(listeners).forEach( entry => {

            const [key, cb] = entry;

            if ( cb === listener ) {
                delete this.wildcardListeners[event][key];
                delete this.cached[event];
            }
        })

        if (! this.wildcardListeners[event][0] ) {
            delete this.wildcardListeners[event];
            delete this.cached[event];
        }
    }


    /**
     * Build wildcard event from event name
     * 
     * @param string|null  event
     */
    buildWildcardEvent( event ) {

        if ( isNull(event) )
            return event;

        if ( event.includes('.') === false )
            return event;

        if ( event.includes('.*') !== false )
            return event;

        return event.substr(0, event.indexOf('.')) + '.*';
    }

};

module.exports = Dispatcher;
