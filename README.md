## Weedmaps Scraper Module for Nest
Scrapes every strain on Weedmaps and helps you organize by price and location. It currently looks for ounces exclusively.

## Requirements
- MongoDB up and running
- Node

## Installation
```
git clone https://github.com/dsalehipour/nest-weedmaps.git
cd nest-hackernews
npm install
```
Also, make sure MongoDB is up and running. See [Install MongoDB](https://docs.mongodb.com/manual/installation/#mongodb-community-edition).

## Usage
1. Scrape Weedmaps by running `node index.js`
2. Copy data from the `mongo nest` collection to the top of the file "generate-strain-json.js"
  - Then add commas after each object by doing a find all for `/*` and then adding a comma after each object. Otherwise it will fail to run.
3. Generate a JSON file of strains/info by running `node generate-strain-json.js`
4. Import JSON of strains (weed-data.json) to Google Sheets or an editor of your choice.
  - Freeze the first row headers
  - Sort by price

## What's happening?
After running index.js, the workers (scraper bots) will go to the strains directory, scrape the 40 strains in the grid, store those scraped items in the database, and queue scraping jobs to those strains by their href. Then, it will paginate and scrape the next page of the strains directory.

Meanwhile, the other workers will pick the jobs in the queue, scrape the strain pages, and update the strain in the database by their href.

Try looking at the scraped data using mongo's native REPL:

```
mongo nest
> db.items.count()
> db.items.find().pretty()
```

Have fun.
