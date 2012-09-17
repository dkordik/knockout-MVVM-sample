/*
A strict MVVM implementation! All in one file to make it easier to follow along.

MVVM as defined in Knockout.js Documentation: (additional quotes throughout)

Model-View-View Model (MVVM) is a design pattern for building user interfaces. It
describes how you can keep a potentially sophisticated UI simple by splitting it
into three parts: MODEL, VIEW, and VIEWMODEL (MVVM).

--------------------------------------------------------------------------------
*/

Model = function (apiMap, options) {
	var self = this;

	if (options && options.apiUrl) { self.apiUrl = options.apiUrl; }
	if (options && options.apiNode) { self.apiNode = options.apiNode; }

	//IMPORTANT! We initialize our properties right away so a View Model that
	//maps to this Model always has something to bind to, even when we haven't
	//populated our models yet, say, via AJAX
	apiMap.forEach(function (prop) {
		self[prop.clientKey] = ko.observable(prop.default);
	});

	self.mapFromAPI = function (api) {
		if (self.apiNode) {
			api = api[self.apiNode];
		}
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

	//self.save = fn () {} //POST updates to server
};

Models = {};

Models._loadQueue = [];

Models.using = function (models) {
	//add models to the load queue
	Models._loadQueue = Models._loadQueue.concat(models);
}

Models._load = function () {
	var urlIndex = {}
	//maps endpoints to models that use them, one to many
	//{ 
	//	"foo.com/data1.json": [model1, model2...],
	//	"foo.com/data2.json": [model3] 
	//}
	Models._loadQueue.forEach(function (model) {
		if (!urlIndex[model.apiUrl]) {
			urlIndex[model.apiUrl] = [];
		}
		urlIndex[model.apiUrl].push(model);
	});
	Models._loadQueue = [];

	//then loads each endpoint and maps to the necessary models
	$.each(urlIndex, function (url, models) {
		$.getJSON(url, function (data) {
			$.unique(models).forEach(function (model) {
				model.mapFromAPI(data);	
			});
		});
	});
}


/*

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
	self = this;
	Models.using([Models.contact, Models.outlet]);

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
	self = this;
	Models.using([Models.outlet]);

	self.name = Models.outlet.name;
	self.circulation = ko.computed(function () {
		//formatting logic belongs in the client side View Model when possible.
		return parseInt(Models.outlet.circulation()).toFormattedString();
	});
}


//--------------------------------------------------------------------------------

//Model to element mapping, left WET for understandability
ko.applyBindings(new ContactQuickStatsViewModel(), $("#contact-quick-stats")[0]);
ko.applyBindings(new OutletQuickStatsViewModel(), $("#outlet-quick-stats")[0]);


//Populating our Models from the server

Models._load();

/* update the logical model. the value is synced with any relevant View Model.
try these:

Models.outlet.name("National Enquirer")

Models.contact.name("Bill Brasky")

*/