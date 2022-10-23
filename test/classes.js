/*
 * This file is part of the Dispatcher package.
 *
 * (c) Mark Fluehmann <js.turanga@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const Event = require( '../src/Event.js' );


class EventByName extends Event
{
}


class EventByPropertyName
{
    constructor() {
        this.name = 'EventByProperty';
    }
}


class TestDispatcher
{
    constructor() {
        this.name = null;
        this.dispatcher = null;
        this.invoked = false;
    }

    foo(name, dispatcher) {
        this.name = name;
        this.dispatcher = dispatcher;
    }

    __invoke(name, dispatcher) {
        this.name = name;
        this.dispatcher = dispatcher;   
        this.invoked = true;   
    }
}


class TestListener
{
    constructor() {
        this.preFooInvoked = false;
        this.postFooInvoked = false;
        this.counter = 0;
    }

    preFoo(e) {
        this.preFooInvoked = true;
    }

    postFoo(e) {
        this.postFooInvoked = true;
        this.counter += 1;

        if (! this.preFooInvoked ) {
            e.stopPropagation();
        } 
    }

    __invoke() {}
}


class TestSubscriber
{
    constructor() {
    }

    getSubscribedEvents() {
        return {
            'pre.foo': 'preFoo', 
            'post.foo': 'postFoo'
        }
    }
}


class TestSubscriberWithMultipleListeners
{
    getSubscribedEvents() {
        return {
            'pre.foo': ['preFoo1', 'preFoo2']
        }
    }
}


module.exports = { EventByName, EventByPropertyName, TestDispatcher, TestListener, TestSubscriber, TestSubscriberWithMultipleListeners }