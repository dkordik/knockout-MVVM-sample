/* 
A strict MVVM implementation! All in one file to make it easier to follow along.

MVVM as defined in Knockout.js Documentation:

Model-View-View Model (MVVM) is a design pattern for building user interfaces. It
describes how you can keep a potentially sophisticated UI simple by splitting it
into three parts:

MODEL: your application’s stored data. This data represents objects and operations
in your business domain (e.g., bank accounts that can perform money transfers) and
is independent of any UI. When using KO, you will usually make Ajax calls to some
server-side code to read and write this stored model data.

VIEW MODEL: a pure-code representation of the data and operations on a UI. For
example, if you’re implementing a list editor, your view model would be an object
holding a list of items, and exposing methods to add and remove items.

Note that this is not the UI itself: it doesn’t have any concept of buttons or 
display styles. It’s not the persisted data model either - it holds the unsaved
data the user is working with. When using KO, your view models are pure JavaScript
objects that hold no knowledge of HTML. Keeping the view model abstract in this
way lets it stay simple, so you can manage more sophisticated behaviors without
getting lost.

VIEW: a visible, interactive UI representing the state of the view model. It
displays information from the view model, sends commands to the view model
(e.g., when the user clicks buttons), and updates whenever the state of the view
model changes.

When using KO, your view is simply your HTML document with declarative bindings to
link it to the view model. Alternatively, you can use templates that generate HTML
using data from your view model.
*/

//--------------------------------------------------------------------------------

/*
MODEL: your application’s stored data. This data represents objects and operations
in your business domain (e.g., bank accounts that can perform money transfers) and
is independent of any UI. When using KO, you will usually make Ajax calls to some
server-side code to read and write this stored model data.
*/
// /KNOCKOUT/MODELS

ContactModel = function () {
	var self = this;
	//all of the values we ever care about w/ contacts on the client
	//not ALL of the API provided properties are here.
	self.name = ko.observable("");
	self.phone = ko.observable("");
	self.email = ko.observable("");
	self.dateOfBirth = ko.observable("");

	self.mapFromAPI = function (api) {
		//API to Model mapping. take what we want, how we want it.
		self.name(api.Name);
		self.phone(api.ContactMethods.Phone);
		self.email(api.ContactMethods.Email);
		self.dateOfBirth(api.DateOfBirth);
	}

	self.mapFromAPIUrl = function (url) {
		$.getJSON(url, function (data) {
			self.mapFromAPI(data);
		});
	}

	//self.save = fn () {} //POST updates to server
}

OutletModel = function () {
	var self = this;
	//all of the values we ever care about w/ outlets on the client
	//not ALL of the API provided properties are here.
	self.name = ko.observable("");
	self.circulation = ko.observable(0);
	self.phone = ko.observable("");
	self.email = ko.observable("");

	self.mapFromAPI = function (api) {
		//API to Model mapping. take what we want, how we want it.
		self.name(api.Name);
		self.circulation(api.Circulation);
		self.phone(api.ContactMethods.Phone);
		self.email(api.ContactMethods.Email);
	}

	//don't abstract this method, it is clearer when WET
	self.mapFromAPIUrl = function (url) {
		$.getJSON(url, function (data) {
			self.mapFromAPI(data);
		});
	}

	//self.save = fn () {} //POST updates to server
}

//--------------------------------------------------------------------------------

/*
VIEW MODEL: a pure-code representation of the data and operations on a UI. For
example, if you’re implementing a list editor, your view model would be an object
holding a list of items, and exposing methods to add and remove items.

Note that this is not the UI itself: it doesn’t have any concept of buttons or 
display styles. It’s not the persisted data model either - it holds the unsaved
data the user is working with. When using KO, your view models are pure JavaScript
objects that hold no knowledge of HTML. Keeping the view model abstract in this
way lets it stay simple, so you can manage more sophisticated behaviors without
getting lost.
*/
// /KNOCKOUT/VIEWMODELS

ContactQuickStatsViewModel = function () {
	self = this;

	//notice we don't care about a subset of the Models properties in each view
	self.name = Models.contact.name;
	self.phone = Models.contact.phone;
	self.email = Models.contact.email;
	self.bornAgo = ko.computed(function () {
		return $.timeago(Models.contact.dateOfBirth());
	});
	//we are explicit in our model references because we don't want to restrict
	//ourselves to a one-to-one Model/ViewModel relationship
	self.outletName = Models.outlet.name;
}

OutletQuickStatsViewModel = function () {
	self = this;

	self.name = Models.outlet.name;
	self.circulation = ko.computed(function () {
		//formatting logic belongs in the ViewModel.
		return parseInt(Models.outlet.circulation()).toFormattedString();
	});
}

//--------------------------------------------------------------------------------
//utils.js

if (!Number.prototype.toFormattedString) {
    Number.prototype.toFormattedString = function() {
        return this.toString()
	        .split('').reverse().join('')
	        .match(/(.{1,3})/g).join(',')
	        .split('').reverse().join('');
    };
}

if (!String.prototype.toNumber) {
    String.prototype.toNumber = function() {
        return parseInt(this);
    };
}


//--------------------------------------------------------------------------------

//KNOCKOUT/CUSTOMBINDINGS

// via http://knockoutjs.com/examples/animatedTransitions.html
// Here's a custom Knockout binding that makes elements shown/hidden via jQuery's fadeIn()/fadeOut() methods
// Could be stored in a separate utility library
ko.bindingHandlers.fadeVisible = {
    init: function(element, valueAccessor) {
        // Initially set the element to be instantly visible/hidden depending on the value
        var value = valueAccessor();
        $(element).toggle(ko.utils.unwrapObservable(value)); // Use "unwrapObservable" so we can handle values that may or may not be observable
    },
    update: function(element, valueAccessor) {
        // Whenever the value subsequently changes, slowly fade the element in or out
        var value = valueAccessor();
        ko.utils.unwrapObservable(value) ? $(element).fadeIn() : $(element).fadeOut();
    }
};


//--------------------------------------------------------------------------------

//KNOCKOUT/CONTROLLERS?

Models = {};

Models.contact = new ContactModel();
Models.outlet = new OutletModel();

//Populating our Models from the server

//one JSON per Model...
// Models.contact.mapFromAPIUrl("json/contact.js");
// Models.outlet.mapFromAPIUrl("json/outlet.js");

//or one JSON for both models
$.getJSON("json/combined.js", function (data) {
	Models.contact.mapFromAPI(data.Contact);
	Models.outlet.mapFromAPI(data.Outlet);
});


//Model to element mapping, left WET for understandability
ko.applyBindings(new ContactQuickStatsViewModel(), $("#contact-quick-stats").get(0));
ko.applyBindings(new OutletQuickStatsViewModel(), $("#outlet-quick-stats").get(0));


/* update the logical model. the value is synced with any relevant viewModel.
try these:

Models.outlet.name("National Enquirer")

Models.contact.name("Bill Brasky")

*/
