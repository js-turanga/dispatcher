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

const { dispatcher, Event }  = require( "../src" );

const { 
    EventByName, 
    EventByPropertyName, 
    TestDispatcher, 
    TestListener, 
    TestSubscriber, 
    TestSubscriberWithMultipleListeners 
} = require('./classes')


/** Test Specification */

describe( "events -", function() {

    it( 'should instantiate event class', function() {

        const event = new Event(null)
        expect( event.constructor.name ).to.eql('Event');
    });


    it( 'should instantiate event class with given name', function() {

        const event1 = new Event(null, { name: 'Event'})    
        const event2 = new Event(null, { name: 'EventName'});

        expect( event1.name ).to.eql('Event');
        expect( event2.name ).to.eql('EventName');
    });


    it( 'should apply arguments on event instantiation', function() {

        const event = new Event(null, { a: 'aaa', b: 'bbb' })

        expect( event.getArguments() ).to.eql({ a: 'aaa', b: 'bbb' });
    });


    it( 'should apply arguments on event', function() {

        const event = new Event()
        event.setArguments({ a: 'aaa', b: 'bbb' })

        expect( event.getArguments() ).to.eql({ a: 'aaa', b: 'bbb' });
    });


    it( 'should get event arguments', function() {

        const event = new Event({ s: 'sss' }, { a: 'aaa', b: 'bbb' })

        expect( event.getArguments() ).to.eql({ a: 'aaa', b: 'bbb' });
    });


    it( 'should get specific event argument', function() {

        const event = new Event({ s: 'sss' }, { a: 'aaa', b: 'bbb' })

        expect( event.getArguments('a') ).to.eql('aaa');
    });


    it( 'should throw event exception for trying to get unknown argument', function() {

        // const err = new EventException();
        // const event = new Event({ s: 'sss' }, { a: 'aaa', b: 'bbb' })

        // expect(event.getArguments('c')).to.throw(err, 'Event argument not found');
    });


    it( 'should receive events subject', function() {

        const event1 = new Event({ s: 'sss' }, { a: 'aaa', b: 'bbb' })

        expect( event1.getSubject() ).to.eql({ s: 'sss' });
    });

});
