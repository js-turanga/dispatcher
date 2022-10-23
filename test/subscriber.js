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

describe( "subscriber -", function() {

    it( 'should add subscriber', function() {

        const dispatcher = new Dispatcher;
        const subscriber = new TestSubscriber;

        dispatcher.subscribe(subscriber)

        expect( dispatcher.hasListeners('pre.foo') ).to.eql(true);
        expect( dispatcher.hasListeners('post.foo') ).to.eql(true);
    });


    it( 'should add subscriber with multiple listeners', function() {

        const dispatcher = new Dispatcher;
        const subscriber = new TestSubscriberWithMultipleListeners;

        dispatcher.subscribe(subscriber)

        const listeners = dispatcher.getListeners('pre.foo')

        expect( dispatcher.hasListeners('pre.foo') ).to.eql(true);
        expect( Object.keys(listeners).length ).to.eql(2);
        expect( listeners[1][1] ).to.eql('preFoo2');
    });


    it( 'should remove subscriber', function() {

        const dispatcher = new Dispatcher;
        const subscriber = new TestSubscriber;

        dispatcher.subscribe(subscriber)

        expect( dispatcher.hasListeners('pre.foo') ).to.eql(true);
        expect( dispatcher.hasListeners('post.foo') ).to.eql(true);

        dispatcher.unsubscribe(subscriber)

        expect( dispatcher.hasListeners('pre.foo') ).to.eql(false);
        expect( dispatcher.hasListeners('post.foo') ).to.eql(false);
    });


    it( 'should remove subscriber with multiple listeners', function() {

        const dispatcher = new Dispatcher;
        const subscriber = new TestSubscriberWithMultipleListeners;

        dispatcher.subscribe(subscriber)

        expect( dispatcher.hasListeners('pre.foo') ).to.eql(true);
        expect( Object.keys(dispatcher.getListeners('pre.foo')).length ).to.eql(2);

        dispatcher.unsubscribe(subscriber)
        expect( dispatcher.hasListeners('pre.foo') ).to.eql(false);
    });


    it( 'should receive dispatcher instance as argument', function() {

        const dispatcher = new Dispatcher;
        const listener = new TestDispatcher

        dispatcher.listen('test', [listener, 'foo'])

        expect( listener.name ).to.eql(null);
        expect( listener.dispatcher ).to.eql(null);

        dispatcher.dispatch('test', 'test')
        expect( listener.name ).to.eql('test');
    });


    it( 'should have callable listener removed', function() {

        const dispatcher = new Dispatcher;
        const listener = () => {};

        dispatcher.listen('foo', listener)
        dispatcher.unlisten('foo', listener)

        expect( dispatcher.hasListeners() ).to.eql(false);

    });


    it( 'should have callable listener removed', function() {

        const dispatcher = new Dispatcher;
        const listener = () => {};

        dispatcher.listen('foo', listener)
        dispatcher.unlisten('foo', listener)

        expect( dispatcher.getListeners() ).to.eql({});
        expect( dispatcher.hasListeners() ).to.eql(false);

    });


    it( 'should has lazy listener', function() {

        const dispatcher = new Dispatcher;
        const disp = new TestDispatcher;

        let called = 0;
        const listener = [() => { ++called }, 'onFoo']

        dispatcher.listen('foo', listener)

        expect( dispatcher.hasListeners() ).to.eql(true);
        expect( dispatcher.hasListeners('foo') ).to.eql(true);
        expect( called ).to.eql(0);
    });


    it( 'should get lazy listener', function() {

        const dispatcher = new Dispatcher;
        const test = new TestDispatcher;
        const factory = () => { return test }

        dispatcher.listen('foo', [factory, 'foo'])
        expect( dispatcher.getListeners('foo') ).to.eql({ 0: [factory, 'foo'] });
        dispatcher.unlisten('foo', [factory, 'foo']);

        dispatcher.listen('bar', [factory, 'foo'])
        expect( dispatcher.getListeners() ).to.eql({'bar': { 0: [factory, 'foo']}});
    });


    it( 'should dispatch lazy listener', function() {

        const dispatcher = new Dispatcher;
        const disp = new TestDispatcher;

        let called = 0;

        const factory = () => { 
            ++called
            return disp
        }

        dispatcher.listen('foo', [factory, 'foo'])
        expect( called ).to.eql(0);

        dispatcher.dispatch('foo')
        expect( called ).to.eql(1);
        expect( disp.invoked ).to.eql(false);

        dispatcher.dispatch('foo')
        expect( called ).to.eql(1);

        dispatcher.listen('bar', [factory])
        expect( called ).to.eql(1);

        dispatcher.dispatch('bar')
        expect( disp.invoked ).to.eql(true);

        dispatcher.dispatch('bar')
        expect( called ).to.eql(2);
    });


    it( 'should remove lazy listener', function() {

        const dispatcher = new Dispatcher;
        const test = new TestDispatcher;
        const factory = () => { return test }

        dispatcher.listen('foo', [factory, 'foo'])
        expect( dispatcher.hasListeners('foo') ).to.eql(true);

        dispatcher.unlisten('foo', [test, 'foo'])
        expect( dispatcher.hasListeners('foo') ).to.eql(false);

        dispatcher.listen('foo', [test, 'foo'])
        expect( dispatcher.hasListeners('foo') ).to.eql(true);

        dispatcher.unlisten('foo', [factory, 'foo'])
        expect( dispatcher.hasListeners('foo') ).to.eql(false);        
    });


    it( 'should mutate while propagation is stopped', function() {

        const dispatcher = new Dispatcher;
        const test = new TestListener;
        let testLoaded = false;

        dispatcher.listen('Event', [test, 'postFoo']);
        dispatcher.listen('Event', [() => { testLoaded = true; return test; }, 'preFoo']);
        
        dispatcher.dispatch(new Event)
        expect( test.postFooInvoked ).to.eql(true);
        expect( test.preFooInvoked ).to.eql(false);

        test.preFoo(new Event)
        dispatcher.dispatch(new Event)
        expect( dispatcher.hasListeners('foo') ).to.eql(false);

        dispatcher.unlisten('foo', [test, 'foo'])
        expect( testLoaded ).to.eql(true);
      
    });

});