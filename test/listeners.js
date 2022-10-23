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

describe( "listeners -", function() {

    it( 'should apply listeners to event', function() {

        const dispatcher = new Dispatcher;
        const listener = new TestListener

        dispatcher.listen('pre.foo', [listener, 'preFoo'])
        dispatcher.listen('post.foo', [listener, 'postFoo'])

        expect( dispatcher.hasListeners() ).to.eql(true);
        expect( dispatcher.hasListeners('pre.foo') ).to.eql(true);
        expect( dispatcher.hasListeners('post.foo') ).to.eql(true);
        expect( dispatcher.hasListeners('preFoo') ).to.eql(false);
        expect( dispatcher.hasListeners('postFoo') ).to.eql(false);
    });


    it( 'should get function based listeners for events', function() {

        const dispatcher = new Dispatcher;
        const listener = (arg) => { return arg + 1 }

        dispatcher.listen('pre.foo', listener)
        dispatcher.listen('post.foo', listener)

        expect(Object.keys(dispatcher.getListeners()).length).to.eql(2);
        expect(Object.keys(dispatcher.getListeners('pre.foo')).length).to.eql(1);
        expect(Object.keys(dispatcher.getListeners('post.foo')).length).to.eql(1);
    });


    it( 'should get array based listeners for events', function() {

        const dispatcher = new Dispatcher;
        const listener = new TestListener

        dispatcher.listen('pre.foo', [listener])
        dispatcher.listen('post.foo', [listener])

        expect(Object.keys(dispatcher.getListeners()).length).to.eql(2);
        expect(Object.keys(dispatcher.getListeners('pre.foo')).length).to.eql(1);
        expect(Object.keys(dispatcher.getListeners('post.foo')).length).to.eql(1);
    });


    it( 'should get array based listeners with function reference for events', function() {

        const dispatcher = new Dispatcher;
        const listener = new TestListener

        dispatcher.listen('pre.foo', [listener, 'preFoo'])
        dispatcher.listen('post.foo', [listener, 'postFoo'])

        expect(Object.keys(dispatcher.getListeners()).length).to.eql(2);
        expect(Object.keys(dispatcher.getListeners('pre.foo')).length).to.eql(1);
        expect(Object.keys(dispatcher.getListeners('post.foo')).length).to.eql(1);
    });


    it( 'should get multiple listeners', function() {

        const dispatcher = new Dispatcher;

        const listener1 = new TestListener
        const listener2 = new TestListener
        const listener3 = new TestListener

        listener1.name = '1'
        listener2.name = '2'
        listener3.name = '3'

        dispatcher.listen('pre.foo', [listener1, 'preFoo'])
        dispatcher.listen('pre.foo', [listener2, 'preFoo'])
        dispatcher.listen('pre.foo', [listener3, 'preFoo'])

        expect(dispatcher.getListeners('pre.foo')).to.eql({
            0: [listener1, 'preFoo'], 1: [listener2, 'preFoo'], 2: [listener3, 'preFoo'],
        });

    });


    it( 'should get all listeners', function() {

        const dispatcher = new Dispatcher;

        const listener1 = new TestListener
        const listener2 = new TestListener
        const listener3 = new TestListener
        const listener4 = new TestListener
        const listener5 = new TestListener
        const listener6 = new TestListener

        dispatcher.listen('pre.foo', listener1)
        dispatcher.listen('pre.foo', listener2)
        dispatcher.listen('pre.foo', listener3)
        dispatcher.listen('post.foo', listener4)
        dispatcher.listen('post.foo', listener5)
        dispatcher.listen('post.foo', listener6)

        expect(dispatcher.getListeners()).to.eql( { 
            'pre.foo': { 0: listener1, 1: listener2, 2: listener3 },
            'post.foo': { 0: listener4, 1: listener5, 2: listener6 }
        });
    });


    it( 'should dispatch event', function() {

        const dispatcher = new Dispatcher;
        const listener = new TestListener

        dispatcher.listen('pre.foo', [listener, 'preFoo']);
        dispatcher.listen('post.foo', [listener, 'postFoo']);

        dispatcher.dispatch('pre.foo', [new Event, 'pre.foo']);

        expect(listener.preFooInvoked).to.eql(true)
        expect(listener.postFooInvoked).to.eql(false)
    });


    it( 'should dispatch wildcard event', function() {

        const dispatcher = new Dispatcher;
        const listener = new TestListener

        dispatcher.listen('pre.foo', [listener, 'preFoo']);
        dispatcher.listen('post.*', [listener, 'postFoo']);

        dispatcher.dispatch('post.foo', new Event);
        expect(listener.counter).to.eql(1)

        dispatcher.dispatch('pre.foo', new Event);
        expect(listener.preFooInvoked).to.eql(true)
        expect(listener.postFooInvoked).to.eql(true)
    });


    it( 'should dispatch for closure', function() {

        const dispatcher = new Dispatcher;

        let invoked = 0;
        let listener = () => { ++invoked }

        dispatcher.listen('pre.foo', listener)
        dispatcher.listen('post.foo', listener)
        dispatcher.dispatch('pre.foo', new Event)

        expect(invoked).to.eql(1)

    });


    it( 'should stop event propagation', function() {

        const dispatcher = new Dispatcher;
        const listener = new TestListener;
        const otherListener = new TestListener;

        // postFoo() stops the propagation, so only one listener should be executed
        dispatcher.listen('Event', [listener, 'postFoo'])
        dispatcher.listen('Event', [listener, 'postFoo'])
        dispatcher.dispatch(new Event);

        expect(listener.postFooInvoked).to.eql(true)
        expect(otherListener.postFooInvoked).to.eql(false)

    });


    it( 'should dispatch by sequence', function() {

        const dispatcher = new Dispatcher;

        let invoked = [];

        const listener1 = () => { invoked.push(1) }
        const listener2 = () => { invoked.push(2) }
        const listener3 = () => { invoked.push(3) }

        dispatcher.listen('pre.foo', listener1)
        dispatcher.listen('pre.foo', listener2)
        dispatcher.listen('pre.foo', listener3)
        dispatcher.dispatch('pre.foo', new Event);

        expect(invoked).to.eql([1,2,3])

    });


    it( 'should remove listener', function() {

        const dispatcher = new Dispatcher;
        const listener = new TestListener;

        dispatcher.listen('pre.bar', listener)
        expect(dispatcher.hasListeners('pre.bar')).to.eql(true)

        dispatcher.unlisten('pre.bar', listener)
        expect(dispatcher.hasListeners('pre.bar')).to.eql(false)

    });


    it( 'should remove wildcard listener', function() {

        const dispatcher = new Dispatcher;
        const listener = new TestListener;

        dispatcher.listen('pre.bar', listener)
        dispatcher.listen('pre.*', listener)
        expect(dispatcher.hasListeners('pre.bar')).to.eql(true)
        expect(dispatcher.hasListeners('pre.*')).to.eql(true)

        dispatcher.unlisten('pre.bar', listener)
        dispatcher.unlisten('pre.*', listener)

        expect(dispatcher.hasListeners('pre.bar')).to.eql(false)
        expect(dispatcher.hasListeners('pre.*')).to.eql(false)

        dispatcher.unlisten('notexists', listener)
        expect(dispatcher.hasListeners()).to.eql(false)
    });
});