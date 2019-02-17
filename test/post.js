let Promise = require('bluebird');
let SendRequest = require('../index');

SendRequest({
	url: 'http://api.zafficsys.com/geturls',
	headers: {
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:65.0) Gecko/20100101 Firefox/65.0',
		"Accept-Encoding": "gzip, deflate, br",
	},
	json: true,
	gzip: true,
	isFullResponse: true,
}, {
	url: 'https://deals.souq.com/ae-en/?q=eyJzIjoiYmVzdCIsImYiOnsiaWRfdHlwZV9pdGVtIjpbIjMzIl19fQ%3D%3D',
	"API-Key": '5abb5fa369141f61b7111fa8',
	fetch: {
		"url": "https://deals.souq.com/ae-en/?q=eyJzIjoiYmVzdCIsImYiOnsiaWRfdHlwZV9pdGVtIjpbIjMzIl19fQ%3D%3D",
		"cssSelector": ".column.column-block",
		"isInvertResult": false,
		"tags": [
			{
				"name": "url",
				"selector": ".img-link",
				"getterPuppeteer": "getAttribute(href)",
				"getterCheerio": "attr(href)",
				"isResolveUrl": true
			},
			{
				"name": "title",
				"selector": "a[title]",
				"getterPuppeteer": "innerText.trim()",
				"getterCheerio": "text().trim()",
				"isWarnWhenMissing": true
			},
			{
				"name": "image",
				"selector": "img",
				"getterPuppeteer": "getAttribute(data-src)",
				"getterCheerio": "attr(data-src)",
				"isResolveUrl": true
			},
			{
				"name": "price",
				"selector": ".price .is.block.sk-clr1",
				"getterPuppeteer": "innerText.trim()",
				"getterCheerio": "text().trim()",
				"regex": "[0-9,.]+",
				"isWarnWhenMissing": true
			},
			{
				"name": "priceWas",
				"selector": ".price .was.block",
				"getterPuppeteer": "innerText.trim()",
				"getterCheerio": "text().trim()",
				"regex": "[0-9,.]+",
				"isWarnWhenMissing": true
			},
			{
				"name": "currency",
				"selector": ".is.block.sk-clr1",
				"getterPuppeteer": "innerText.trim()",
				"getterCheerio": "text().trim()",
				"regex": "[^0-9\\s]+[.]?[^0-9\\s]+",
				"isWarnWhenMissing": true
			}
		]
	}
})
.then(function(result) {

	console.log('Final url:', result.finalUrl);

	// console.log('Headers:', result.response.headers);
	console.log(result.body.result);

})
.catch(function(err) {

	console.error(err);

})