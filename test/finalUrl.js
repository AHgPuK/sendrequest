let Promise = require('bluebird');
let SendRequest = require('../index');

let url = 'https://uae.souq.com/ae-en/oneplus-6t-dual-sim-128gb-8gb-ram-4g-lte-thunder-purple-76024800033/u/';

SendRequest({
	url: url,
	headers: {
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:65.0) Gecko/20100101 Firefox/65.0'
	},
	isJsonParse: false,
	isFullResponse: true,
})
.then(function(result) {

	console.log('Final url:', result.finalUrl);

	let match = result.body.match(/code class=\"ip\">(.*?)<\/code>/);
	let ip = match && match[1];

	if (ip)
	{
		console.log(ip);
	}
	else
	{
		// console.error(result.body);
	}

})
.catch(function(err) {

	console.error(err);

})