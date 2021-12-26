const https = require('https');
const path = require('path');
const fs = require('fs');

function fetch(url) {
  console.log(`Fetch: ${url}`);
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve(JSON.parse(data));
      });
    }).on("error", reject);
  });
}

function fetchProducts(products) {
  const [product] = products;
  if (!product) return;
  setTimeout(() => {
    fetch(`https://endoflife.date/api/${product}.json`).then((res) => {
      writeJson(`${product}.json`, res);
      fetchProducts(products.slice(1));
    });
  }, 1000);
}

function writeJson(filename, data) {
  fs.writeFile(path.join(__dirname, 'data', filename), JSON.stringify(data), (err) => {
    if (err) throw err;
  });
}

fs.readFile(path.join(__dirname, 'data', 'all.json'), 'utf-8', (err, data) => {
  if (err) throw err;
  fetchProducts(JSON.parse(data));
});
