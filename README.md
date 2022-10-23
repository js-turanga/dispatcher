# Dispatcher
Bringing together various application packages requires a common foundation for communication needs. For that reason events serve best to decouple packages while allowing to hook into state changes.



## Installation
npm install js-turanga/dispatcher



## Dispatcher
The Dispatcher class is like the heartbeat of an event notification system. Events and listeners
Creating an event dispatcher instance is as easy as:

	const { Dispatcher } = require( "./dispatcher/dist" );

	const dispatcher = new Dispatcher;


Supported capabilities by the event dispatcher

	// register one event (as string) or multiple events (as array of strings) for listener
	dispatcher.listen( events, listener );

	// unregister event listeners
	dispatcher.unlisten( events, listener );

	// subscribe subscriber class which must implement getSubscribedEvents to collect events with listeners
	dispatcher.subscribe( subscriber );

	// unregister subscriber
	dispatcher.unsubscribe( subscriber );

	// dispatch event class (payload is then event itself) or event name as string with optional payload argument
	dispatcher.dispatch( event, payload );

	// check if any listener is registered for event (or all listeners when argument left away )
	dispatcher.hasListeners( event );

	// get event listeners for event (or all listeners when argument left away )
	dispatcher.getListeners( event );



## Events
It is common to dispatch event classes for communication between application packages. An event class serves as container for related datasets. Depending on the use case, building event classes for any event might be too much of overhead. What is common for both cases, they share an event name and event data.


### Event Naming
When an event is dispatched, it’s identified by a unique name, which any number of listeners might be listening to. 
The unique event name can be any string, but optionally follows a few naming conventions:
* use only lowercase letters, numbers, dots (.) and underscores (_);
* prefix names with a namespace followed by a dot (e.g. order.*, user.*);
* end names with a verb that indicates what action has been taken (e.g. order.placed, order_placed).

To ensure these naming conventions, the event dispatcher includes some checks and transformations:
* for event classes with a 'name' property, the name property is transformed to snake case
* for event classes without a 'name' property, event names are built by class name (without namespace), transformed to snake case
  e.g. event class 'User\UserProfileCreated' is transformed to event name 'user_profile_created'
* for events registered and dispatches as string, a snake case transformation is applied
  e.g. event named 'userProfileCreated' is transformed to event name 'user_profile_created'


### Event Payload
Events dispatched as event classes as well as in the lightweight mode are capable of transfering payload.

Event playload for dispatches event classes:

	// dispatching event class
	dispatcher.dispatch(new Event(subject, [..]))

	// event name: 'event'
	// event payload: event class itself

Please consider the event class chapter for further details about the generic event class

Event playload for lightweight mode:

	// dispatching simple event
	dispatcher.dispatch('event', [...])

	// event name: 'event'
	// event payload: [...]


### Event Class
This package provides an Event base class for convenience for those who wish to use just one event object throughout their application. It is suitable for most purposes straight out of the box, because it follows the standard observer pattern where the event object encapsulates an event ‘subject’, but has the addition of optional extra arguments.
The Event class provides a method "stopPropagation". To ask for the events propagation state please use the isPropagationStopped method. Any listener waiting to be processed for that event will not get notified by the event dispatcher.

For using the Event class provided by this package just apply

	const { Event } = require( "./dispatcher/dist" );

	const Event = new Event;


Provides Event class methods are:	

	__construct(subject, args)	Constructor takes the event subject and any arguments;
	getSubject() 								Get the subject;
	setArguments() 							Set event argument as key/value array
	getArguments() 							Get argument by key or any arguments if none is given
	hasArgument() 							Returns true if the argument key exists;


To take advantage of all provided event capabilities please extend from the packages Event class

	class CustomEvens extends Event
	{
	}


## Listeners
To take advantage of an existing event, you need to connect a listener to the dispatcher so that it can be notified when the event is dispatched. A call to the dispatcher’s listen() method associates a listener to an event. The listen() method takes up to two arguments:
* event name (string) that this listener wants to listen to;
* an event listener to be executed when the specified event is dispatched;


### Listener Callables
Event listeners can be provided in various configurations:

* as function. A listener provided as function is executed when the event gets dispatched

		dispatcher.listen('foo', (arg) => { ... do something ... }; );

* an object implementing an `__invoke` method. The invoke method is executed on the object when the event gets dispatched

		dispatcher.listen('foo', { ... __invoke() { ... do something ... } } );

* an array with an object as first and method as second argument. The method will get called on a dispatched event.

		dispatcher.listen('foo', [{ ... methodX() { ... do something ... } }, 'methodX'] );

* an array with a function as first and method as second argument. This configuration is supposed for lazy listeners while the function returns an object. The provided method will later be called on the object for a dispatched event.


### Wildcard Listeners
The event dispatcher provided by this package supports wildcard events for more generic listeners. E.g.
* a listener registered for order.created acts only on this event
* a listener registered for order.* acts on all events machting the dotted prefix notation like order.processed, order.closed



## Subscribers
The most common way to listen to an event is to register an event listener with the dispatcher. This listener can listen to one or more events and is notified each time those events are dispatched.
Another way to listen to events is via an event subscriber. An event subscriber is a javascript class that’s able to tell the dispatcher exactly which events it should subscribe on one or more listeners. A subscriber class must implement a getSubscribedEvents method and must return an object with event/listeners:

	class CustomSubscriber
	{
		...

    getSubscribedEvents() {
        return {
            'pre.foo': 'preFoo', 
            'post.foo': ['postFoo1', 'postFoo2']
        }
    }

    ...

    preFoo(payload, dispatcher) {}

    postFoo1(payload, dispatcher) {}

    postFoo2(payload, dispatcher) {}



The dispatcher invokes the registered methods if an event gets dispatched. The dispatcher allows for two listener arguments
* payload: event class itself or payload provided when registered an event via the listen method
* dispatcher: the dispatcher instance to allow for advanced use cases