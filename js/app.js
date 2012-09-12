/*
A strict MVVM implementation! All in one file to make it easier to follow along.

MVVM as defined in Knockout.js Documentation: (additional quotes throughout)

Model-View-View Model (MVVM) is a design pattern for building user interfaces. It
describes how you can keep a potentially sophisticated UI simple by splitting it
into three parts: MODEL, VIEW, and VIEWMODEL (MVVM).

--------------------------------------------------------------------------------
*/

Model = function (apiMap){
	var self = this;

	apiMap.forEach(function (prop) {
		self[prop.clientKey] = ko.observable(prop.default);
	});

	self.mapFromAPI = function (api) {
		apiMap.forEach(function (prop) {
			//convert "a.b.c" to api[a][b][c]
			prop.apiKey.split(".").forEach(function (piece, index) {
				if ( index == 0 && !api[piece] ) {
					//gracefully fail and warn if we try to map something
					//that we don't find in the API
					console.warn("'" + prop.clientKey
						+ "' -> '"+ prop.apiKey +"' not found in the API");
				} else if ( index == 0 && api[piece] ) {
					self[prop.clientKey](api[piece]);
				} else if ( self[prop.clientKey] ) {
					self[prop.clientKey](self[prop.clientKey]()[piece]);
				}
			});
		});
	}

	self.mapFromAPIUrl = function (url) {
		$.getJSON(url, self.mapFromAPI);
	}

	//self.save = fn () {} //POST updates to server
};

/*

MODEL: your application’s stored data. This data represents objects and operations
in your business domain (e.g., bank accounts that can perform money transfers) and
is independent of any UI. When using KO, you will usually make Ajax calls to some
server-side code to read and write this stored model data.

*/

Models = {};

Models.contact = new Model([
	{  clientKey: "name", apiKey: "Name", default: "" },
	{  clientKey: "phone", apiKey: "ContactMethods.Phone", default: "" },
	{  clientKey: "email", apiKey: "ContactMethods.Email", default: "" },
	{  clientKey: "dateOfBirth", apiKey: "DateOfBirth", default: ""  },
	{  clientKey: "favoriteColor", apiKey: "Interests.FavColor", default: ""  }
]);

Models.outlet = new Model([
	{  clientKey: "name", apiKey: "Name", default: "" },
	{  clientKey: "circulation", apiKey: "Circulation", default: "" },
	{  clientKey: "phone", apiKey: "ContactMethods.Phone", default: "" },
	{  clientKey: "email", apiKey: "ContactMethods.Email", default: ""  }
]);


/*--------------------------------------------------------------------------------

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

//Model to element mapping, left WET for understandability
ko.applyBindings(new ContactQuickStatsViewModel(), $("#contact-quick-stats")[0]);
ko.applyBindings(new OutletQuickStatsViewModel(), $("#outlet-quick-stats")[0]);


//Populating our Models from the server

//one JSON per Model...
Models.contact.mapFromAPIUrl("json/contact.js");

console.log("Simulating a slow API... Waiting 5 seconds to load Outlet.");

setTimeout(function () {
	Models.outlet.mapFromAPIUrl("json/outlet.js");
}, 5000);

//or one JSON for both models
//$.getJSON("json/combined.js", function (data) {
//	Models.contact.mapFromAPI(data.Contact);
//	Models.outlet.mapFromAPI(data.Outlet);
//});

/* update the logical model. the value is synced with any relevant View Model.
try these:

Models.outlet.name("National Enquirer")

Models.contact.name("Bill Brasky")

*/