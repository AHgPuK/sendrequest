let Promise = require('bluebird');
let SendRequest = require('../index');

// let url = 'https://uae.souq.com/ae-en/oneplus-6t-dual-sim-128gb-8gb-ram-4g-lte-thunder-purple-76024800033/u/';
// let url = 'http://google.com';
// let url = 'https://sa.awok.com/dp-1392329';
let url = 'https://uae.souq.com:443/ae-ar/ابل-ايفون-7-بلس-مع-فيس-تايم-128-جيجا-الجيل-الرابع-ال-تي-اي-ذهبي-وردي-11526707/i/';

let proxy = 'http://213.222.244.150:52862';

SendRequest({
	url: url,
	headers: {
		"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
		"Accept-Encoding": "gzip, deflate, br",
		"Accept-Language": "en-US,en;q=0.5",
		"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:66.0) Gecko/20100101 Firefox/66.0"
	},
	json: false,
	isFullResponse: true,
	gzip: true,
	// proxy: proxy,
})
.then(function(result) {

	console.log('Final url:', result.finalUrl);

	// console.log('Headers:', result.response.headers);

	let match = result.body.match(/code class=\"ip\">(.*?)<\/code>/);
	let ip = match && match[1];

	if (ip)
	{
		console.log(ip);
	}
	else
	{
		console.error(result.body.substr(0, 100));
	}

})
.catch(function(err) {

	console.error(err);

})