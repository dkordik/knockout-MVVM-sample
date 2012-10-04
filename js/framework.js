window.Model = function (apiMap, options) {
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
				if ( index == 0 ) {
					if ( api[piece] ) {
						self[prop.clientKey](api[piece]);
					} else {
						//gracefully fail and warn if we try to map something
						//that we don't find in the API
						console.warn("'" + prop.clientKey + "' -> '" + prop.apiKey
							+ "' not found in the API");
					}
				} else if ( self[prop.clientKey] ) {
					self[prop.clientKey](self[prop.clientKey]()[piece]);
				}
			});
		});
	}

	//self.save = fn () {} //POST updates to server
};

window.Models = {};

// EXAMPLE of defining a Model:

// Models.foo = new Model([
// 	{ clientKey: "name", apiKey: "Name", default: "" },
// 	{ clientKey: "phone", apiKey: "ContactMethods.Phone", default: "" }
// ], {
// 	apiUrl: "SOME/JSON/URL"
// });


Models._loadQueue = [];

Models.using = function (models) {
	//add models to the load queue
	Models._loadQueue = Models._loadQueue.concat(models);
}

Models._load = function () {
	var urlIndex = {}

	//maps endpoints to models that use them, one to many
	//
	// { 
	// 	 "foo.com/data1.json": [model1, model2...],
	// 	 "foo.com/data2.json": [model3] 
	// }
	//
	//using an index like this means we are only hitting each unique
	//endpoint once, no matter how many models reference them

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
