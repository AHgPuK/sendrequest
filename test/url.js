var URL = require('url');



// let url = 'https://www.google.com/v1/v2/file.html?q1=v1&q2=v2#h1=hv1';
//
// // let urlParsed = URL.parse(url);
// let urlParsed = new URL.URL(url);
//
// console.log(JSON.stringify(urlParsed, null, 4));
//
// // urlParsed.pathname = urlParsed.path;
// urlParsed.path = '/v3/v4/file2.html?q1=v1&q2=v2#h1=hv1';
// delete urlParsed.pathname;
//
// console.log(URL.format(urlParsed));
// console.log(urlParsed.href);
// console.log(urlParsed.toString());
//
// console.log(new URL.URL(urlParsed));


let updateUrlObjByPath = function(obj)
{
	let href = `${obj.protocol}//${obj.hostname}${obj.path}`;

	let newUrlObj = URL.parse(href);

	return newUrlObj;
}

let urlO = {
	protocol: 'https:',
	hostname: 'www.google.com',
	path: '/v1/v2/file.html?q1=v1&q2=v2#h1=hv1'
}

urlO = updateUrlObjByPath(urlO);

let url = URL.format(urlO);

console.log(url)