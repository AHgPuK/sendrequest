var Promise = require('bluebird');
var Request = require('request');
var Url = require('url');
var BrotliDecompress = require('brotli/decompress');

// var Zlib = require('zlib');
var Iconv = require('iconv-lite');
Iconv.skipDecodeWarning = true;

var TAG = 'sendRequest:';

var SendRequest = function(options) {

	return new Promise(function(fulfill, reject) {

		var req = Request(options, function(error, res, body) {

			if (error)
			{
				reject(error);
				return;
			}

			if (options.json == true)
			{
				if (!body)
				{
					console.warn(`${TAG} Expected json, received null.`);
					fulfill();
					return;
				}

				if (!(body.constructor == Object || body.constructor == Array))
				{
					let message = (res.statusCode !== 200) ? `${res.statusCode}: ${res.statusMessage}` : body.constructor.name;

					console.warn(`${TAG} Expected json, received ${message} from ${options.url}.`);
					fulfill({
						status: {
							error: res.statusCode,
							message: res.statusMessage,
						},
					});
					return;
				}
			}

			body = Lib.decodeBody(res, options);

			if (options.isFullResponse)
			{
				let finalUrl = res.request.uri.href;
				let urlObj = new Url.URL(finalUrl);

				if (finalUrl.indexOf(`https://${urlObj.host}:443/`) == 0)
				{
					finalUrl = finalUrl.replace(':443', '');
				}

				if (finalUrl.indexOf(`http://${urlObj.host}:80/`) == 0)
				{
					finalUrl = finalUrl.replace(':80', '');
				}

				if (Lib.isASCII(finalUrl) == false)
				{
					finalUrl = Iconv.decode(finalUrl, 'utf8');
				}

				finalUrl = decodeURI(finalUrl);

				fulfill({
					finalUrl: finalUrl,
					response: res,
					body: body,
				})
			}
			else
			{
				fulfill(body);
			}
		})

		if (options.isCancelled)
		{
			req.on('data', function() {

				if (options.isCancelled() == true)
				{
					req.abort();
					fulfill({});
				}

			});
		}

		req.end();
	})

}

/**
 *
 * @param {Object} options
 * @param {string} options.url - Url
 * @param {string} options.host - Host
 * @param {Object} postData
 * @returns {*}
 */

module.exports = function(options, postData) {

	let retries = isNaN(options.retries) ? 2 : options.retries;

	if (postData)
	{
		options.body = postData;

		if (!options.method)
		{
			options.method = 'POST';
		}
	}

	if (!options.encoding)
	{
		options.encoding = null;
	}

	// let location = options.url;
	//
	// if (Lib.isASCII(location) == false)
	// {
	// 	location = Iconv.decode(location, 'utf8');
	//
	// 	if (options.url != location)
	// 	{
	// 		options.url = location;
	// 	}
	//
	if (Lib.isASCII(options.url) == false)
	{
		options.url = encodeURI(options.url);
	}
	// }

	return Lib.waitForResultWithPromiseLimitIterations(function(counter) {

		return SendRequest(options)
		.then(function(response) {

			if (options.isCancelled && options.isCancelled() == true)
			{
				return {
					isRetry: false,
				};
			}

			if (typeof response === 'string' && response.length > 0)
			{
				return {
					isRetry: false,
					response
				};
			}

			if (typeof response === 'object')
			{
				let error = response && response.status && response.status.error || 0;

				if (error === 0)
				{
					return {
						isRetry: false,
						response
					};
				}
			}

			let delay = 0;

			if (counter < retries + 1)
			{
				console.warn('Retrying...');

				delay = options.delayBetweenRetries || 200;
			}

			return Promise.delay(delay)
			.then(function() {
				return Promise.resolve({
					isRetry: true,
					response: response,
				});
			});

		})

	}, retries);


}

/**
 *
 * @type {{isASCII: (function(*=): boolean), waitForResultWithPromise: (function(*=)), doNext: (handler: TimerHandler, timeout?: number, ...arguments: any[]) => number, waitForResultWithPromiseLimitIterations: (function(*, *, *=): *)}}
 */

let Lib = {

	isASCII: function(str) {
		return /^[\x00-\x7F]*$/.test(str);
	},

	doNext: setTimeout,

	waitForResultWithPromise: function(func) {
		var promise = new Promise(function(fulfill, reject) {
			var loopFunc = function() {
				Promise.resolve()
				.then(function() {
					return func();
				})
				.then(function(result) {
					if (result)
					{
						fulfill(result);
						return;
					}

					Lib.doNext(loopFunc);
				})
				.catch(function(err) {
					reject(err);
				})
			}

			loopFunc();

		})

		return promise;
	},

	waitForResultWithPromiseLimitIterations: function(func, limit, err) {

		var TAG = 'waitForResultWithPromiseLimitIterations';
		var count = 0;
		var internalErr = null;

		return Lib.waitForResultWithPromise(function() {

			if (count > limit)
			{
				if (internalErr && internalErr.constructor != Error)
				{
					const temp = err || new Error(TAG + ': Limit iterations reached');
					internalErr = Object.assign(temp, internalErr);
				}

				throw internalErr || err || new Error(TAG + ': Limit iterations reached');
			}

			count++;

			return func(count)
			.then(({isRetry, response}) => {

				if (isRetry)
				{
					internalErr = response;
					return
				}

				return response;
			})
			.catch(err => {
				internalErr = err;
			});
		});
	},

	decodeBody: function(res, options) {

		if (!res.body)
		{
			return res.body;
		}

		var contentEncoding = res.headers['content-encoding'];

		if (contentEncoding == 'br')
		{
			res.body = BrotliDecompress(res.body);
		}

		var responseEncoding = options.responseEncoding;
		var charsetRegex = /charset\s?=\s?(?:\"|'|\s)?(.*?)(\"|\s|$|\/|>|')/;

		if (!responseEncoding)
		{
			var contentType = res.headers['content-type'] || '';
			var match = contentType.match(charsetRegex);
			responseEncoding = match && match[1];
		}

		if (!responseEncoding)
		{
			// Extract charset from html
			var match = res.body.toString().match(charsetRegex);
			responseEncoding = match && match[1];
		}

		if (!responseEncoding)
		{
			responseEncoding = 'utf8';
		}

		if (responseEncoding && responseEncoding.indexOf(',') > 0)
		{
			responseEncoding = responseEncoding.split(',')[0];
		}

		var resultObject = '';

		if (res.body.constructor == Object || res.body.constructor == Array)
		{
			resultObject = res.body;
		}
		else
		{
			try
			{
				resultObject = Iconv.decode(res.body, responseEncoding);
			}
			catch (e)
			{
				console.error(TAG, e);
				resultObject = res.body;
			}

			if (resultObject == '')
			{
				try
				{
					resultObject = Iconv.decode(res.body, 'utf8');
				}
				catch (e)
				{
					console.error(TAG, e);
				}
			}
		}

		return resultObject;
	},

}

let getHrefFromUrlObject = function(obj)
{
	let host = obj.host;

	if (!host)
	{
		host = `${obj.hostname}`;

		if (obj.port)
		{
			host += `:${obj.port}`;
		}
	}

	return `${obj.protocol}//${host}${obj.path}`;
}
