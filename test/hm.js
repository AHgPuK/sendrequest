let SendRequest = require('../index');

SendRequest({
	url: 'http://localhost:81/geturls',
	// url: 'http://api.zafficsys.com/geturls',
	retries: 1,
	json: true,
}, {
	"API-Key": "5abb5fa369141f61b7111fa8",
	"fetch": {
		"url" : "https://ae.hm.com/en/shop-promotion/--concept-basics-classic_collection-DENIM-DIVIDED-everyday",
		"userAgent" : "Googlebot/2.1 (+http://www.googlebot.com/bot.html)",
		"cssSelector": ".c-products__item",
		"isInvertResult": false,
		"isUseJavascript": true,
		"afterLoad": async function(page) {

			// await page.reload({
			// 	waitUntil: 'networkidle0'
			// });

			await Lib.scrollBrowserPage(page, 100);

			let finishAt = new Date().getTime() + 5000;

			for (var i = 0; i < 1000; i++)
			{
				if (new Date().getTime() > finishAt)
				{
					break;
				}

				var isFinished = await page.evaluate(() => {

					var productCount = document.querySelectorAll('.c-products__item').length;
					var imagesCount = document.querySelectorAll('.c-products__item img.b-lazy.b-loaded[src]').length;

					if (imagesCount == productCount)
					{
						return true;
					}

					return false;
				});

				if (isFinished)
				{
					break;
				}

				await Promise.delay(200);
			}

		} + '',
		"browserOptions": {
			waitUntil: 'networkidle0'
		},
		"limit": 20,
		"tags": [
			{
				"name": "url",
				"selector": ".product-selected-url",
				"getterPuppeteer": "getAttribute(href)",
				"getterCheerio": "attr(href)",
				"isResolveUrl": true
			},
			{
				"name": "title",
				"selector": ".product-selected-url",
				"getterPuppeteer": "innerText.trim()",
				"getterCheerio": "text().trim()",
				"isWarnWhenMissing": true,
			},
			{
				"name": "image",
				"selector": ".alshaya_search_mainimage > img",
				"getterPuppeteer": "getAttribute(src)",
				"getterCheerio": "attr(src)",
				"isResolveUrl": true
			},
			{
				"name": "price",
				"selector": '.special--price .price-amount',
				"getterPuppeteer": "innerText.trim()",
				"getterCheerio": "text().trim()",
				"regex": "[0-9,.٬]+$",
				"isWarnWhenMissing": true,
			},
			{
				"name": "priceWas",
				"selector": '.has--special--price .price-amount',
				"getterPuppeteer": "innerText.trim()",
				"getterCheerio": "text().trim()",
				"regex": "[0-9,.٬]+$",
				"isWarnWhenMissing": true,
			},
			{
				"name": "currency",
				"selector": '.special--price .price-currency',
				"getterPuppeteer": "innerText.trim()",
				"getterCheerio": "text().trim()",
				// "regex": "[^0-9\\s]+[.]?[^0-9\\s]+",
				"isWarnWhenMissing": true,
			},
		]
	}
}
)
.then(function(res) {

	console.log(res);

})
.catch(function(err) {

	console.error(err);
})