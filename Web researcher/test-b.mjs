import scraper from 'gimirick-brave-search-scraper';
async function test() {
  try {
    const results = await scraper.search('test search');
    console.log(results);
  } catch(e) {
    console.error(e);
  }
}
test();
