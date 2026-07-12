import { parse } from 'node-html-parser';

async function test() {
  try {
    const res = await fetch('https://search.brave.com/search?q=test+search', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    });
    const html = await res.text();
    console.log(html.substring(0, 1000));
    console.log("length:", html.length);
  } catch(e) {
    console.error(e);
  }
}
test();
