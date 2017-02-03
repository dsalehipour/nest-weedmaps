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
// Array of strains and the price for all available quantities at a specific dispensary.
var strainPrices = [];

// For each strain in San Francisco, find the price for each quantity, and place it inside an array.
//{
//  name: "Bubba Kush",
//  gram: 10,
//  eighth: 35,
//  quad: 70,
//  half: 120,
//  ounce: 220,
//  dispensary: "SPARC",
//  location: "San Francisco"
//}
strains.forEach(function(strain) {

    // Dispensary info
    var strainName = strain.name;
    var dispensaries = strain.dispensaries;

    // Match strain quantity to price
    dispensaries.forEach(function(dispensary) {
        var prices = dispensary.prices;
        var priceAmounts = {};

        if(prices && dispensary.location === "San Francisco") {
            prices.forEach(function(cell) {
                var quantityPrice = cell["price"];

                switch (cell["type"]) {
                    case "gram":
                        priceAmounts.gram = quantityPrice;
                        break;
                    case "eighth":
                        priceAmounts.eighth = quantityPrice;
                        break;
                    case "quad":
                        priceAmounts.quad = quantityPrice;
                        break;
                    case "half":
                        priceAmounts.half = quantityPrice;
                        break;
                    case "ounce":
                        priceAmounts.ounce = quantityPrice;
                        break;
                    default:
                        console.log("default");
                }
                return priceAmounts;
            });

            // Gather the strain's commerce info
            var strainInfo = {
                name: strainName,
                gram: priceAmounts.gram ? priceAmounts.gram : '',
                eighth: priceAmounts.eighth ? priceAmounts.eighth : '',
                quad: priceAmounts.quad ? priceAmounts.quad : '',
                half: priceAmounts.half ? priceAmounts.half : '',
                ounce: priceAmounts.ounce ? priceAmounts.ounce : '',
                dispensary: dispensary.name,
                location: dispensary.location
            };

            // Add the strain's commerce info into the final array
            strainPrices.push(strainInfo);
        };
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
