var Item = require('node-nest/lib/db/item').default;

// Find all strains in Mongo that finished scraping
module.exports = function runAfterScraping(callback){
    Item.find({routeWeight:80},function(err,strains){

        // Final object we return at the end.
        // Array of strains and the price for all available quantities at a specific dispensary.
        var strainPrices = [];
        var csvFormat = 'Strain Name, Gram, Eighth, Quad, Half, Ounce, Dispensary, Location,' + '\n';

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
            strain = strain.toObject();

            // Dispensary info
            var strainName = strain.name;
            var dispensaries = strain.dispensaries;

            // Match strain quantity to price
            dispensaries.forEach(function(dispensary) {
                var prices = dispensary.prices;
                var priceAmounts = {};

                if(prices.length && (dispensary.location === "San Francisco" || dispensary.location === "Oakland" || dispensary.location === "South San Francisco" || dispensary.location === "Daly City")) {
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
                                return;
                        }
                        return priceAmounts;
                    });

                    // Gather the strain's commerce info for JSON
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

                    // Gather the strain's commerce info for CSV
                    csvFormat += [strainInfo.name,
                                strainInfo.gram,
                                strainInfo.eighth,
                                strainInfo.quad,
                                strainInfo.half,
                                strainInfo.ounce,
                                strainInfo.dispensary,
                                strainInfo.location
                            ].join(',') + '\n';

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
            fs.writeFile(path.resolve(__dirname, 'weed-data.csv'), csvFormat, function(err) {
                if(err) {
                    console.log(err);
                    return;
                }
                callback();
            });
        });
    });
}