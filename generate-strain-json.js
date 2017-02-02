// To clear ObjectId unknown error
var ObjectId = function(a) { return a; }

// JSON copied from your `mongo nest` database
var strains = [

// Example data scraped from Weedmaps
/* 1 */
{
    "_id" : ObjectId("5891cca13820085e64f94075"),
    "key" : "/strains/chocolope-2",
    "routeWeight" : 80,
    "routeId" : "weedmaps-strain-page",
    "href" : "/strains/chocolope-2",
    "name" : "Chocolope",
    "__v" : 0,
    "dispensaries" : [ 
        {
            "name" : "Silver State Relief",
            "location" : "Sparks",
            "distance" : "187.4",
            "prices" : [ 
                {
                    "price" : "12",
                    "type" : "gram"
                }, 
                {
                    "price" : "35",
                    "type" : "eighth"
                }, 
                {
                    "price" : "65",
                    "type" : "quad"
                }, 
                {
                    "price" : "120",
                    "type" : "half"
                }, 
                {
                    "price" : "230",
                    "type" : "ounce"
                }
            ]
        },
        {
            "name" : "Mercy Wellness of Cotati",
            "location" : "Cotati",
            "distance" : "42.6",
            "prices" : [ 
                {
                    "price" : "13",
                    "type" : "gram"
                }, 
                {
                    "price" : "40",
                    "type" : "eighth"
                }
            ]
        }, 
        {
            "name" : "All Natural Inc.",
            "location" : "Shingle Springs",
            "distance" : "100.2",
            "prices" : []
        },  
        {
            "name" : "Green Cure Delivery",
            "location" : "San Francisco",
            "distance" : "4.2",
            "prices" : [ 
                {
                    "price" : "20",
                    "type" : "gram"
                }, 
                {
                    "price" : "60",
                    "type" : "eighth"
                }, 
                {
                    "price" : "110",
                    "type" : "quad"
                }, 
                {
                    "price" : "220",
                    "type" : "half"
                }, 
                {
                    "price" : "375",
                    "type" : "ounce"
                }
            ]
        },
        {
            "name" : "Top Shelf Delivery",
            "location" : "Yuba City",
            "distance" : "101.5",
            "prices" : [ 
                {
                    "price" : "90",
                    "type" : "gram"
                }
            ]
        }
    ]
},

/* 2 */
{
    "_id" : ObjectId("5891cca13820085e64f94080"),
    "key" : "/strains/granddaddy-purple",
    "routeWeight" : 80,
    "routeId" : "weedmaps-strain-page",
    "href" : "/strains/granddaddy-purple",
    "name" : "Granddaddy Purple",
    "__v" : 0,
    "dispensaries" : [ 
        {
            "name" : "Garden of Eden",
            "location" : "Hayward",
            "distance" : "17.4",
            "prices" : [ 
                {
                    "price" : "15",
                    "type" : "gram"
                }, 
                {
                    "price" : "50",
                    "type" : "eighth"
                }, 
                {
                    "price" : "100",
                    "type" : "quad"
                }
            ]
        }, 
        {
            "name" : "Shakes",
            "location" : "San Francisco",
            "distance" : "5.8",
            "prices" : [ 
                {
                    "price" : "40",
                    "type" : "eighth"
                }, 
                {
                    "price" : "75",
                    "type" : "quad"
                }
            ]
        }
    ]
}];

// Final object we return at the end.
// Array of strains and the price for an ounce at a specific dispensary.
var strainPrices = [];

// Locate strains in San Francisco, that are sold in ounces.
// For each strain find the price for an ounce, and place it inside an array.
//{
//	name: "Bubba Kush",
//	price: 200,           <----- for the ounce
//	dispensary: "SPARC",
//	location: "San Francisco"
//}
strains.forEach(function(e) {

	// Dispensary info
	var strainName = e.name;
	var dispensaries = e.dispensaries;

	// Select the strain quantity (ounce)
	dispensaries.forEach(function(e) {
		var pricesCount = e.prices.length;
		var lastSize = pricesCount - 1;
		var ounce = e.prices[lastSize];

		if(pricesCount && ounce["type"] === "ounce" && e.location === "San Francisco") {

			// Gather the strain's commerce info
			var strainInfo = {
				name: strainName,
				price: ounce.price,
				dispensary: e.name,
				location: e.location
			};

			// Add the strain's commerce info into the final array
			strainPrices.push(strainInfo);
		}

	});
});

// Create a JSON file with the strain prices (weed-data.json)
var fs = require('fs');
var path = require('path');

fs.writeFile(path.resolve(__dirname, 'weed-data.json'), JSON.stringify(strainPrices, null, 2), function(err) {
	if(err) {
		console.log(err);
		return;
	}
	console.log('DONE');
});
