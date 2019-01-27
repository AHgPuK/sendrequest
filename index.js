var Promise = require('bluebird');

var Http = require('http');
var Https = require('https');
var Zlib = require('zlib');
var Iconv = require('iconv-lite');
Iconv.skipDecodeWarning = true;
var URL = require('url');

var TAG = 'sendRequest:';

var SendRequestHelper = function(params) {

	params = params || {};

	var options = params.options;
	var postData = params.postData;
	var callback = params.callback;

	if (!options)
	{
		if (callback != null){
			var err = new Error(TAG + "no options in params");
			callback(err, null);
		}

		return;
	}

	if (options.url)
	{
		let urlParser = URL.parse(options.url);

		options.host = urlParser.hostname;
		options.path = urlParser.path;
		options.port = urlParser.port;
		options.protocol = options.protocol || urlParser.protocol;
		delete options.url;
	}

	if (options.proxy)
	{
		let path = URL.format(options);

		options.headers = options.headers || {};
		options.headers.Host = options.host;
		options.path = path;

		let proxyObject = URL.parse(options.proxy);
		options.protocol = proxyObject.protocol;
		options.host = proxyObject.hostname;
		options.port = proxyObject.port;
	}

	options.timeout = options.timeout || 1000 * 60 * 5;

	var handler = Https;

	if(options.protocol == 'http:')
	{
		handler = Http;
	}

	var data = postData || '';

	if(data.constructor == Object)
	{
		// Need to convert an object to string
		try
		{
			data = JSON.stringify(data);
		}
		catch (e)
		{
			data = '';
			console.error(TAG, 'Cannot parse data:', data);
		}

		options.headers = options.headers || {};
		options.headers['Content-Length'] = Buffer.byteLength(data);
	}

	if (!options.method)
	{
		options.method = (data) ? 'POST' : 'GET';
	}

	var responseFunction = function(res) {
		//res.setEncoding('utf-8');

		var chunks = [];

		res.socket.on('error', function (error) {
			// reject(error);
			req.abort();
		});

		res.on('data', function(data) {

			if (options.isCancelled && options.isCancelled() == true)
			{
				req.abort();
				return;
			}

			chunks.push(data);
		});

		res.on('end', function() {

			if (options.isCancelled && options.isCancelled() == true)
			{
				req.abort();
				return;
			}

			if (res.statusCode >= 300 && res.statusCode < 400)
			{
				var args = {
					options: Object.assign({}, params.options),
					postData: params.postData,
					callback: params.callback,
				}

				var location = res.headers.location;

				try
				{
					// let urlTest = 'https://uae.souq.com/qa-ar/Ø§Ø¨Ù-Ø§ÙÙÙÙ-8-plus-ÙØ¹-ÙØ§ÙØ³-ØªØ§ÙÙ-64-Ø¬ÙØ¬Ø§-Ø§ÙØ¬ÙÙ-Ø§ÙØ±Ø§Ø¨Ø¹-Ø§Ù-ØªÙ-Ø§Ù-Ø±ÙØ§Ø¯Ù-24051424/i/';
					if (Lib.isASCII(location) == false)
					{
						location = Iconv.decode(location, 'utf8');
					}
				}
				catch (e)
				{
				}

				let newLocationObject = URL.parse(location);

				for (let key in {
					host: true,
					path: true,
					port: true,
					protocol: true,
				})
				{
					let val = newLocationObject[key];

					if (val)
					{
						args.options[key] = val;
					}
				}

				if (args.options.headers && args.options.headers.Host)
				{
					args.options.headers.Host = args.options.host;
				}

				SendRequestHelper(args);

				return;
			}

			var buffer = Buffer.concat(chunks);

			if (res.headers['content-encoding'] == 'gzip')
			{
				try
				{
					buffer = Zlib.unzipSync(buffer);
				}
				catch (err)
				{
					callback(err, null);
					return;
				}
			}

			var responseEncoding = options.responseEncoding;
			var charsetRegex = /charset\s?=\s?(?:\"|'|\s)?(.*?)(\"|\s|$|\/|>|')/;

			if (!responseEncoding)
			{
				var contentType = res.headers['content-type'] || '';
				var match = contentType.match(charsetRegex);
				// responseEncoding = match && match[1];
			}

			if (!responseEncoding)
			{
				// Extract charset from html
				var match = buffer.toString().match(charsetRegex);
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

			try
			{
				resultObject = Iconv.decode(buffer, responseEncoding);
			}
			catch (e)
			{
				console.error(TAG, e);
			}

			if (resultObject == '')
			{
				try
				{
					resultObject = Iconv.decode(buffer, 'utf8');
				}
				catch (e)
				{
					console.error(TAG, e);
				}
			}

			var isJsonParse = true;

			if ('isJsonParse' in options)
			{
				isJsonParse = !!options.isJsonParse;
			}

			if (isJsonParse)
			{
				try {
					resultObject = JSON.parse(resultObject);
				}
				catch(e)
				{
					console.error(TAG + 'error: ', e.stack, "options:", options, "resultObject:", resultObject);
				}
			}

			// res.removeAllListeners('data');
			// res.removeAllListeners('end');
			// res.removeAllListeners('error');
			// req.removeAllListeners('error');

			if (callback != null)
			{
				if (options.isFullResponse == true)
				{
					resultObject = {
						finalUrl: URL.format(options),
						response: res,
						body: resultObject
					}
				}

				callback(null, resultObject);
			}

			return;
		});

		res.on('error', function(err){

			// res.removeAllListeners('data');
			// res.removeAllListeners('end');
			// res.removeAllListeners('error');
			// req.removeAllListeners('error');

			if (callback != null)
			{
				callback(err);
			}
			else
			{
				console.error(TAG + 'error: ' + e);
			}

		})
	}

	var req = null;

	if (Lib.isASCII(options.path) == false)
	{
		options.path = encodeURI(options.path);
	}
	
	try
	{
		req = handler.request(options, responseFunction);
	}
	catch (e)
	{
		callback(e, null);
		return;
	}

	req.on('socket', function(socket) {
		socket.on('error', function (error) {
			// reject(error);
			req.abort();
		});
	});

	req.on('error', function(e) {
		// req.removeAllListeners('error');
		if (callback == null)
		{
			console.error(TAG + 'error: ' + e);
		}
		else
		{
			callback(e, null);
		}
	});

	req.on('abort', function(e) {
		// req.removeAllListeners('abort');
		if (callback == null)
		{
			console.error(TAG + 'error: ' + e);
		}
		else
		{
			callback(e, null);
		}
	});

	if (options.timeout)
	{
		req.setTimeout(options.timeout, function() {
			req.abort();
		});
	}

	try
	{
		req.write(data);
		req.end();
	}
	catch (e)
	{
		console.error(TAG + e);
	}
}

let SendRequestWithPromise = function(options, postData) {

	return Promise.fromCallback(function(cb) {
		SendRequestHelper(
		{
			options: options,
			postData: postData,
			callback: cb
		}
		);
	});

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

	return Lib.waitForResultWithPromiseLimitIterations(function() {

		return SendRequestWithPromise(options, postData)
		.then(function(response) {

			if (options.isCancelled && options.isCancelled() == true)
			{
				return {};
			}

			if (typeof response === 'string' && response.length > 0)
			{
				return response;
			}

			if (typeof response === 'object')
			{
				let error = response && response.status && response.status.error || 0;

				if (error === 0)
				{
					return response;
				}
			}

			console.warn('Retying...');

			return Promise.delay(200).then(function() {
				return Promise.resolve(null);
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
				throw err || new Error(TAG + ': Limit iterations reached');
			}

			count++;

			return func(count);
		});
	},

}
