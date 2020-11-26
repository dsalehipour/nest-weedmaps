const fs = require('fs');
const path = require('path');
const Item = require('node-nest/lib/db/item').default;

// Find all strains in Mongo that finished scraping
module.exports = function runAfterScraping(callback) {
  Item.find({ routeWeight: 80 }, (err, strains) => {
    // Final object we return at the end.
    // Array of strains and the price for all available quantities at a specific dispensary.
    const strainPrices = [];
    let csvFormat = 'Strain Name, Gram, Eighth, Quad, Half, Ounce, Dispensary, Location\n';

    // For each strain in San Francisco, collect the price for each quantity.
    // {
    //   name: 'Bubba Kush',
    //   gram: 10,
    //   eighth: 35,
    //   quad: 70,
    //   half: 120,
    //   ounce: 220,
    //   dispensary: 'SPARC',
    //   location: 'San Francisco'
    // }
    strains.forEach((strainRaw) => {
      const strain = strainRaw.toObject();

      // Dispensary info
      const strainName = strain.name;
      const dispensaries = strain.dispensaries;

      // Match strain quantity to price
      dispensaries.forEach((dispensary) => {
        const prices = dispensary.prices;
        const priceAmounts = {};

        const whitelistedCities = [
          'San Francisco',
          'Oakland',
          'South San Francisco',
          'Daly City',
        ];
        if (prices.length && whitelistedCities.indexOf(dispensary.location) >= 0) {
          prices.forEach((cell) => {
            priceAmounts[cell.type] = cell.price;
          });

          // Gather the strain's commerce info for JSON
          const strainInfo = {
            name: strainName,
            gram: priceAmounts.gram ? priceAmounts.gram : '',
            eighth: priceAmounts.eighth ? priceAmounts.eighth : '',
            quad: priceAmounts.quad ? priceAmounts.quad : '',
            half: priceAmounts.half ? priceAmounts.half : '',
            ounce: priceAmounts.ounce ? priceAmounts.ounce : '',
            dispensary: dispensary.name,
            location: dispensary.location,
          };

          // Gather the strain's commerce info for CSV
          csvFormat += [  // eslint-disable-line prefer-template
            strainInfo.name,
            strainInfo.gram,
            strainInfo.eighth,
            strainInfo.quad,
            strainInfo.half,
            strainInfo.ounce,
            strainInfo.dispensary,
            strainInfo.location,
          ].join(',') + '\n';

          // Add the strain's commerce info into the final array
          strainPrices.push(strainInfo);
        }
      });
    });

    // Create a JSON file with the strain prices (weed-data.json)
    fs.writeFile(path.resolve(__dirname, 'weed-data.json'), JSON.stringify(strainPrices, null, 2), (err) => {
      if (err) {
        console.log(err);
        return;
      }
      fs.writeFile(path.resolve(__dirname, 'weed-data.csv'), csvFormat, (err) => {
        if (err) {
          console.log(err);
          return;
        }
        callback();
      });
    });
  });
};
ww