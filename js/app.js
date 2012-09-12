/* 
A strict MVVM implementation! All in one file to make it easier to follow along.

MVVM as defined in Knockout.js Documentation: (additional quotes throughout)

Model-View-View Model (MVVM) is a design pattern for building user interfaces. It
describes how you can keep a potentially sophisticated UI simple by splitting it
into three parts: MODEL, VIEW, and VIEWMODEL (MVVM).

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
	//API-provided properties that we'll never use can be omitted here
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
	//API-provided properties that we'll never use can be omitted here
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

	//notice we only care about a subset of the Models properties in each view,
	//we DO have a one-to-one relationship with Views and View Models
	self.name = Models.contact.name;
	self.phone = Models.contact.phone;
	self.email = Models.contact.email;
	self.bornAgo = ko.computed(function () {
		return $.timeago(Models.contact.dateOfBirth());
	});
	//we are explicit in our Model references because we DO NOT want to limit
	//ourselves to a one-to-one relationship with View Models and Models.
	//we could have several Views/View Models that represent
	//some subset of our Models (ContactQuickStats, ContactEmailForm...)
	self.outletName = Models.outlet.name;
}

OutletQuickStatsViewModel = function () {
	self = this;

	self.name = Models.outlet.name;
	self.circulation = ko.computed(function () {
		//formatting logic belongs in the View Model.
		return parseInt(Models.outlet.circulation()).toFormattedString();
	});
}


//--------------------------------------------------------------------------------

//KNOCKOUT/CONTROLLERS?

Models = {};

Models.contact = new ContactModel();
Models.outlet = new OutletModel();

//Populating our Models from the server

//Model to element mapping, left WET for understandability
ko.applyBindings(new ContactQuickStatsViewModel(), $("#contact-quick-stats")[0]);
ko.applyBindings(new OutletQuickStatsViewModel(), $("#outlet-quick-stats")[0]);

//one JSON per Model...
Models.contact.mapFromAPIUrl("json/contact.js");
console.log("Simulating a slow API... Waiting 5 seconds to load Outlet.");
setTimeout(function () {
	Models.outlet.mapFromAPIUrl("json/outlet.js");
}, 5000);

//or one JSON for both models
// $.getJSON("json/combined.js", function (data) {
// 	Models.contact.mapFromAPI(data.Contact);
// 	Models.outlet.mapFromAPI(data.Outlet);
// });

/* update the logical model. the value is synced with any relevant View Model.
try these:

Models.outlet.name("National Enquirer")

Models.contact.name("Bill Brasky")

*/