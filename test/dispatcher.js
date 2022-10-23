/*
 * This file is part of the Dispatcher package.
 *
 * (c) Mark Fluehmann <js.turanga@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

let expect = require( "chai" ).expect;

const EventException = require( '../src/Exceptions/EventException.js' );

const { Dispatcher, Event }  = require( "../src" );

const { 
    EventByName, 
    EventByPropertyName, 
    TestDispatcher, 
    TestListener, 
    TestSubscriber, 
    TestSubscriberWithMultipleListeners 
} = require('./classes')


/** Test Specification */

describe( "dispatcher -", function() {

    it( 'should have no listeners in initial state', function() {

        const dispatcher = new Dispatcher;
        const listener = new TestListener

        expect( dispatcher.hasListeners() ).to.eql(false);

        dispatcher.listen('pre.foo', [listener, 'preFoo'])
        dispatcher.listen('post.foo', [listener, 'postFoo'])

        expect( dispatcher.hasListeners() ).to.eql(true);
        expect( dispatcher.hasListeners('pre.foo') ).to.eql(true);
        expect( dispatcher.hasListeners('post.foo') ).to.eql(true);
    });


    it( 'should register listener by name', function() {

        const dispatcher = new Dispatcher;
        const listener = (arg) => { return arg }

        dispatcher.listen('fooEvent', listener)
        const result = dispatcher.dispatch('foo_event', 'test')

        expect( result ).to.eql(['test']);
    });


    it( 'should register listener by class name', function() {

        const dispatcher = new Dispatcher;
        const listener = (arg) => { return arg }

        dispatcher.listen('event_by_name', listener)
        const result = dispatcher.dispatch(new EventByName, 'test')
        expect( result ).to.eql(['test']);
    });


    it( 'should register listener by class property name', function() {

        const dispatcher = new Dispatcher;
        const listener = (arg) => { return arg }

        dispatcher.listen('event_by_property', listener)
        const result = dispatcher.dispatch(new EventByPropertyName, 'test')
        expect( result ).to.eql(['test']);
    });
});

