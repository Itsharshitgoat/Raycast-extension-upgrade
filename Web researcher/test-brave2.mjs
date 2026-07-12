import { parse } from 'node-html-parser';
import fs from 'fs';

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
    fs.writeFileSync('brave.html', html);
    const root = parse(html);
    
    // Attempt multiple possible selectors
    const resultElements = root.querySelectorAll('.snippet, [data-type="web"]');
    console.log("Found result elements:", resultElements.length);
    
    const results = resultElements.map(el => {
      const a = el.querySelector('a');
      const title = a?.querySelector('.title')?.textContent?.trim() || a?.textContent?.trim();
      const url = a?.getAttribute('href');
      const snippet = el.querySelector('.snippet-content, .snippet-description, .heading + div')?.textContent?.trim();
      return { title, url, snippet };
    });
    console.log(results.slice(0, 3));
  } catch(e) {
    console.error(e);
  }
}
test();
