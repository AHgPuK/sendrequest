let Promise = require('bluebird');
let SendRequest = require('../index');

let url = 'https://uae.souq.com/qa-ar/Ø§Ø¨Ù-Ø§ÙÙÙÙ-8-plus-ÙØ¹-ÙØ§ÙØ³-ØªØ§ÙÙ-64-Ø¬ÙØ¬Ø§-Ø§ÙØ¬ÙÙ-Ø§ÙØ±Ø§Ø¨Ø¹-Ø§Ù-ØªÙ-Ø§Ù-Ø±ÙØ§Ø¯Ù-24051424/i/';

let proxy = 'http://213.222.244.150:52862';

SendRequest({
	url: url,
	headers: {
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:65.0) Gecko/20100101 Firefox/65.0'
	},
	// proxy: proxy,
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
		console.error(result.body);
	}

})
.catch(function(err) {

	console.error(err);

})