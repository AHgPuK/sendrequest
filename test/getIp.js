let Promise = require('bluebird');
let SendRequest = require('../index');

let url = 'https://ifconfig.co';
// let url = 'https://google.com';

let proxy = 'http://178.128.231.201:3128/';

SendRequest({
	url: url,
	// proxy: proxy,
	isJsonParse: false,
})
.then(function(response) {

	let match = response.match(/code class=\"ip\">(.*?)<\/code>/);
	let ip = match && match[1];

	if (ip)
	{
		console.log(ip);
	}
	else
	{
		console.error(response);
	}

})
.catch(function(err) {

	console.error(err);

})