/*
A strict MVVM implementation! All in one file to make it easier to follow along.

MVVM as defined in Knockout.js Documentation: (additional quotes throughout)

Model-View-View Model (MVVM) is a design pattern for building user interfaces. It
describes how you can keep a potentially sophisticated UI simple by splitting it
into three parts: MODEL, VIEW, and VIEWMODEL (MVVM).

--------------------------------------------------------------------------------

MODEL: your application’s stored data. This data represents objects and operations
in your business domain (e.g., bank accounts that can perform money transfers) and
is independent of any UI. When using KO, you will usually make Ajax calls to some
server-side code to read and write this stored model data.

*/

Models.contact = new Model([
	{ clientKey: "name", apiKey: "Name", default: "" },
	{ clientKey: "phone", apiKey: "ContactMethods.Phone", default: "" },
	{ clientKey: "email", apiKey: "ContactMethods.Email", default: "" },
	{ clientKey: "dateOfBirth", apiKey: "DateOfBirth", default: ""  },
	{ clientKey: "favoriteColor", apiKey: "Interests.FavColor", default: ""  }
], {
	apiUrl: "json/contact.js"
	//,params: { id: 102 }
});

Models.outlet = new Model([
	{ clientKey: "name", apiKey: "Name", default: "" },
	{ clientKey: "circulation", apiKey: "Circulation", default: "" },
	{ clientKey: "phone", apiKey: "ContactMethods.Phone", default: "" },
	{ clientKey: "email", apiKey: "ContactMethods.Email", default: ""  }
], {
	apiUrl: "json/combined.js",
	apiNode: "Outlet"
});


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
	var self = this;

	//notice we only care about a subset of the Models properties in each view,
	//we have a one-to-one relationship with Views and View Models
	self.name = Models.contact.name;
	self.phone = Models.contact.phone;
	self.email = Models.contact.email;
	self.bornAgo = ko.computed(function () {
		return $.timeago(Models.contact.dateOfBirth());
	});
	//however, we are explicit in our Model references because we DO NOT want to
	//limit ourselves to a one-to-one relationship with View Models and Models.
	//we could have several View Models that represent some subset of
	//our Models (ContactQuickStats, ContactEmailForm...)
	self.outletName = Models.outlet.name;
}

OutletQuickStatsViewModel = function () {
	var self = this;

	self.name = Models.outlet.name;
	self.circulation = ko.computed(function () {
		//formatting logic belongs in the client side View Model when possible.
		return parseInt(Models.outlet.circulation()).toFormattedString();
	});
}

/* update the logical model. the value is synced with any relevant View Model.
try these:

Models.outlet.name("National Enquirer")

Models.contact.name("Bill Brasky")

*/

/*--------------------------------------------------------------------------------

THE MAGIC SAUCE. DOM to ViewModel mappings. The only thing the implementor
really needs to tell us. Behind the scenes, this:

	-Applies knockout bindings to DOM elements
	-Finds out which Models are being used in your ViewModels, and queues
		them up for AJAX load (only loads each unique resource once)

*/

Ropes({
	"#contact-quick-stats": ContactQuickStatsViewModel,
	"#outlet-quick-stats": OutletQuickStatsViewModel
})
