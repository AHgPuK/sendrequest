var Url = require('url');


// let url = 'https://sa.awok.com:443/earphones-headsets/jbl_under_armour_sport_wireless_heart_rate_heart_monitoring_wireless_bluetooth_in_ear_headphones_/dp-1392329/русс';
let url = 'https://uae.souq.com:443/ae-ar/ابل-ايفون-7-بلس-مع-فيس-تايم-128-جيجا-الجيل-الرابع-ال-تي-اي-ذهبي-وردي-11526707/i/';
console.log(url);

let obj = new Url.URL(url);

if (url.indexOf(`https://${obj.host}:443/`) == 0)
{
	url = url.replace(':443', '');
}

console.log(obj.href);
console.log(url);



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









// let updateUrlObjByPath = function(obj)
// {
// 	let href = `${obj.protocol}//${obj.hostname}${obj.path}`;
//
// 	let newUrlObj = URL.parse(href);
//
// 	return newUrlObj;
// }
//
// let urlO = {
// 	protocol: 'https:',
// 	hostname: 'www.google.com',
// 	path: '/v1/v2/file.html?q1=v1&q2=v2#h1=hv1'
// }
//
// urlO = updateUrlObjByPath(urlO);
//
// let url = URL.format(urlO);
//
// console.log(url)