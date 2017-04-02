const childProcess = require('child_process');
const Nest = require('node-nest');
const Job = require('node-nest/lib/db/queue').default;
const Item = require('node-nest/lib/db/item').default;
const runAfterScraping = require('./runAfterScraping');

/**
 * Gets the strain pricess array from a dispensory row.
 *
 * @param  {Object} $   Cheerio-wrapped object containing the page's HTML.
 * @param  {Object} row Dispensory entry.
 * @return {Array}      Strain prices array.
 */
function getStrainPricesFromDispensoryRow($, row) {
  const strainPrices = [];
  $(row).find('.strain-at-dispensary-prices').each((index, cell) => {
    if (
      $(cell).find('.strain-at-dispensary-price').text()
      && $(cell).find('.strain-at-dispensary-type').text()
    ) {
      strainPrices.push({
        price: $(cell).find('.strain-at-dispensary-price').text(),
        type: $(cell).find('.strain-at-dispensary-type').text(),
      });
    }
  });
  return strainPrices;
}

const nest = new Nest();

nest.addRoute({
  // This is the route ID
  key: 'weedmaps-strains',

  // Route url strings are passed to lodash's 'template' function.
  // @see https://lodash.com/docs#template
  //
  // You can also provide a function that should return the newly built URL
  //
  // the scraping state is available in the URL generator function's scope
  // we can use the "state.currentPage" property to enable pagination
  url: 'https://weedmaps.com/strains?page=<%= state.currentPage %>',

  scraper($) {
    // You should return an object with the following properties:
    // - items:       `Array` Items to save in the database.
    // - jobs:        `Array` New scraping jobs to add to the scraper worker queue
    // - hasNextPage: `Boolean` If true, Nest will scrape the "next page"
    const data = {
      items: [],
      jobs: [],
    };

    // The HTML is already loaded and wrapped with Cheerio in '$',
    // meaning you can get data from the page, jQuery style.

    // for each article
    $('a.strain-card').each((i, row) => {
      // create superficial hackernews article items in the database
      data.items.push({
        key: $(row).attr('href'), // this is the only required property
        name: $(row).find('.strain-name').text(),
        href: $(row).attr('href'),
      });

      data.jobs.push({
        routeId: 'weedmaps-strain-page', // this is the only required property
        query: {
          href: $(row).attr('href'),
        },
      });
    });

    data.hasNextPage = !!data.items.length;

    // Nest will save the objects in 'data.items' and queue jobs in 'data.jobs'
    // Nest won't repeat URLs that have already been scraped
    return data;
  },
});

nest.addRoute({
  priority: 80,

  // This is the route ID
  key: 'weedmaps-strain-page',

  // Route url strings are passed to lodash's 'template' function.
  // @see https://lodash.com/docs#template
  //
  // You can also provide a function that should return the newly built URL
  //
  // the scraping state is available in the URL generator function's scope
  // we can use the "state.currentPage" property to enable pagination
  url: 'https://weedmaps.com<%= query.href %>',

  scraper($, context) {
    // You should return an object with the following properties:
    // - items:       `Array` Items to save in the database.
    // - jobs:        `Array` New scraping jobs to add to the scraper worker queue
    // - hasNextPage: `Boolean` If true, Nest will scrape the "next page"
    const strain = {};

    const data = {
      items: [strain],
    };

    strain.key = context.location.href.replace('https://weedmaps.com', '');

    // The HTML is already loaded and wrapped with Cheerio in '$',
    // meaning you can get data from the page, jQuery style.

    // for each dispensary
    strain.dispensaries = $('a.strain-at-dispensary').map((i, row) => {
      const dispensary = {};

      dispensary.name = $(row).find('.strain-at-dispensary-name').text().replace(/\n/g, '').trim();
      dispensary.location = $(row).find('.strain-at-dispensary-city').text().replace(/(\b\d+(?:[.,]\d+)?\b(?!(?:[.,]\d+)|(?:\s*(?:%|percent))))/g, '').replace(/\n/g, '').replace(/ mi/g, '').trim();
      dispensary.distance = $(row).find('.strain-at-dispensary-city').text().replace(/[A-Za-z]/g, '').replace(/\n/g, '').replace(/ mi/g, '').trim();
      dispensary.prices = getStrainPricesFromDispensoryRow($, row);
      return dispensary;
    }).get();

    // Nest will save the objects in 'data.items' and queue jobs in 'data.jobs'
    // Nest won't repeat URLs that have already been scraped
    return data;
  },
});

// Remove data from Mongo and start Nest
Item.remove({}, () => {
  Job.remove({}, () => {
    nest.queue('weedmaps-strains');
    nest.start().catch((err) => console.error(err));
  });
});

let done = false;
setInterval(() => {
  Job.find({ 'state.finished': false }, (err, unfinishedJobsCount) => {
    if (done) { return; }
    if (err) { console.log(err); return; }
    if (unfinishedJobsCount.length === 0) {
      done = true;
      nest.stop();
      setTimeout(() => {
        runAfterScraping(() => {
          console.log('DONE');
          childProcess.exec('/Applications//Numbers.app/Contents/MacOS/Numbers /Users/darius/nest-weedmaps/weed-data.csv');
          // process.exit(0);
        });
      }, 1000);
    }
  });
}, 1000);
