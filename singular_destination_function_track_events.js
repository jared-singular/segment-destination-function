// Learn more about destination functions API at
// https://segment.com/docs/connections/destinations/destination-functions

/**
 * Handle track event
 * @param  {SegmentTrackEvent} event
 * @param  {FunctionSettings} settings
 */
async function onTrack(event, settings) {
	// Learn more at https://segment.com/docs/connections/spec/track/
	// Common Specs: https://segment.com/docs/connections/spec/common/

	// Singular S2S Event EventEndpoint
	// Singular Event API Specs here: https://support.singular.net/hc/en-us/articles/360048588672-Server-to-Server-S2S-API-Endpoint-Reference#Event_Notification_Endpoint
	const singularEventEndpoint = 'https://s2s.singular.net/api/v1/evt?';
	const singularSDKKEY = settings.singularSdkKey;
	const singularSDKVersion = 'SegmentS2SCustomFunction';

	// Define Segment Integration Type and Get Segment Key Values
	// Note: This code only supports Track Events for Mobile and Web(JS)

	const segmentIntegrationType = event.context.library.name || '';
	console.log(segmentIntegrationType);
	if (
		typeof segmentIntegrationType !== 'undefined' &&
		typeof singularSDKKEY !== 'undefined'
	) {
		// Singular object for all query parameters to be sent on S2S Event.
		let params = {};

		// Singular Flag used to prevent sending events without a device identifier.
		let _sDeviceId = false;

		// Singular Event Timestamp used to backdate the actual event
		// Retrieved from Segment timestamp. See how Segment defines timestamp here: https://segment.com/docs/connections/spec/common/#context
		let _utime = event.timestamp || '';
		if (_utime !== '') {
			const dateToday = new Date(_utime);
			let timestamp = Date.parse(dateToday) / 1000;
			params['utime'] = timestamp;
		}

		params['a'] = singularSDKKEY;
		params['sdk_version'] = singularSDKVersion;
		params['custom_user_id'] = event.userId || '';
		params['ua'] = event.context.userAgent || '';
		params['lc'] = event.context.locale || '';
		params['n'] = event.event || 'segment_unknown';

		// Validation on IP Address Handling
		// If IP Address is not included, we will fallback to the IP of the Request
		let _ip = event.context.ip;
		if (typeof _ip === 'undefined' || _ip === '') {
			params['use_ip'] = 'True';
		} else {
			params['ip'] = _ip;
		}

		if (
			segmentIntegrationType === 'analytics-ios' ||
			segmentIntegrationType === 'analytics-android'
		) {
			params['i'] = event.context.app.namespace || 'segment.unknown.bundleId';
			params['ve'] = event.context.os.version || '';
			params['ma'] = event.context.device.manufacturer || '';
			params['mo'] = event.context.device.model || '';
		}

		if (segmentIntegrationType === 'analytics-ios') {
			params['p'] = 'iOS';
			let _idfa =
				event.properties.singularIDFA || event.context.device.advertisingId;
			let _idfv = event.properties.singularIDFV || event.context.device.id;

			// Learn more at https://segment.com/docs/connections/sources/catalog/libraries/mobile/ios/#ad-tracking-and-idfa
			if (typeof _idfa !== 'undefined' && _idfa.length == 36) {
				params['idfa'] = _idfa.toUpperCase();
				params['att_authorization_status'] = '3';
				_sDeviceId = true;
			} else {
				params['att_authorization_status'] = '0';
			}

			if (typeof _idfv !== 'undefined' && _idfv.length == 36) {
				params['idfv'] = _idfv.toUpperCase();
				_sDeviceId = true;
			}
		} else if (segmentIntegrationType === 'analytics-android') {
			params['p'] = 'Android';

			// Get Amazon Advertising Identifier (AMID) see: https://developer.amazon.com/docs/policy-center/advertising-id.html
			// Get Android AppSetID Identifier (ASID) see: https://developer.android.com/training/articles/app-set-id

			let _gaid =
				event.properties.singularGAID || event.context.device.advertisingId;
			let _asid = event.properties.singularASID;
			let _amid = event.properties.singularAMID;
			let _oaid = event.properties.singularOAID;

			if (typeof _gaid !== 'undefined' && _gaid.length == 36) {
				params['aifa'] = _gaid.toLowerCase();
				_sDeviceId = true;
			}

			if (typeof _asid !== 'undefiend' && _asid.length == 36) {
				params['asid'] = _asid.toLowerCase();
				_sDeviceId = true;
			}

			if (typeof _amid !== 'undefined' && _amid.length == 36) {
				params['amid'] = _amid.toLowerCase();
				_sDeviceId = true;
			}

			if (typeof _oaid !== 'undefined' && _oaid.length == 36) {
				params['oaid'] = _amid.toLowerCase();
				_sDeviceId = true;
			}
		} else if (segmentIntegrationType === 'analytics.js') {
			params['p'] = 'Web';

			// Get Singular Web SDK Identifier (SDID) see: https://support.singular.net/hc/en-us/articles/360039991491-Singular-Website-SDK-Native-Integration#Method_B_Advanced_Set_Singular_Device_ID_Manually
			let _sdid = event.properties.singularSDID;
			let _webBundleID = event.properties.singularWebBundleId;

			if (typeof _webBundleID !== 'undefined') {
				params['i'] = _webBundleID;
			} else {
				params['i'] = 'unknown_web_bundelId';
			}

			if (typeof _sdid !== 'undefined' && _sdid.length == 36) {
				params['sdid'] = _sdid.toLowerCase();
				_sDeviceId = true;
			}
		}

		// Handling Revenue Amount and Currency Event
		// Otherwise the event will not include revenue.
		// Any Event with Revenue and Amount in the Properties will be sent as a Revenue event to Singular

		let _revenue = event.properties.revenue;
		let _currency = event.properties.currency;
		if (typeof _revenue !== 'undefined' && typeof _currency !== 'undefined') {
			params['amt'] = _revenue;
			params['cur'] = _currency;
			params['is_revenue_event'] = 'true';
		}

		// Pass all Segement Properties into Singular Event Arguments here.
		let eventArgs = {};
		let _segmentProperties = event.properties || '';
		if (
			typeof _segmentProperties !== 'undefined' &&
			_segmentProperties !== ''
		) {
			for (let key in _segmentProperties) {
				eventArgs[key] = _segmentProperties[key];
			}
		}
		eventArgs['anonymousId'] = event.anonymousId || '';
		eventArgs['userId'] = event.userId || '';
		params['e'] = JSON.stringify(eventArgs);

		if (_sDeviceId === true) {
			let query = Object.keys(params)
				.map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
				.join('&');
			let url = singularEventEndpoint + query;
			console.log(url);

			let response;

			try {
				response = await fetch(url, {
					method: 'GET'
					//headers: {'Content-Type': 'application/json'},
					//body: JSON.stringify(event)
				});
			} catch (error) {
				// Retry on connection error
				throw new RetryError(error.message);
			}

			if (response.status >= 500 || response.status === 429) {
				// Retry on 5xx (server errors) and 429s (rate limits)
				throw new RetryError(`Failed with ${response.status}`);
			}
		}
	}
}

/**
 * Handle identify event
 * @param  {SegmentIdentifyEvent} event
 * @param  {FunctionSettings} settings
 */
async function onIdentify(event, settings) {
	// Learn more at https://segment.com/docs/connections/spec/identify/
	throw new EventNotSupported('identify is not supported');
}

/**
 * Handle group event
 * @param  {SegmentGroupEvent} event
 * @param  {FunctionSettings} settings
 */
async function onGroup(event, settings) {
	// Learn more at https://segment.com/docs/connections/spec/group/
	throw new EventNotSupported('group is not supported');
}

/**
 * Handle page event
 * @param  {SegmentPageEvent} event
 * @param  {FunctionSettings} settings
 */
async function onPage(event, settings) {
	// Learn more at https://segment.com/docs/connections/spec/page/
	throw new EventNotSupported('page is not supported');
}

/**
 * Handle screen event
 * @param  {SegmentScreenEvent} event
 * @param  {FunctionSettings} settings
 */
async function onScreen(event, settings) {
	// Learn more at https://segment.com/docs/connections/spec/screen/
	throw new EventNotSupported('screen is not supported');
}

/**
 * Handle alias event
 * @param  {SegmentAliasEvent} event
 * @param  {FunctionSettings} settings
 */
async function onAlias(event, settings) {
	// Learn more at https://segment.com/docs/connections/spec/alias/
	throw new EventNotSupported('alias is not supported');
}

/**
 * Handle delete event
 * @param  {SegmentDeleteEvent} event
 * @param  {FunctionSettings} settings
 */
async function onDelete(event, settings) {
	// Learn more at https://segment.com/docs/partners/spec/#delete
	throw new EventNotSupported('delete is not supported');
}

/**
 * Handle delete event
 * @param  {SegmentDeleteEvent} event
 * @param  {FunctionSettings} settings
 */
async function onDelete(event, settings) {
	// Learn more at https://segment.com/docs/partners/spec/#delete
	throw new EventNotSupported('delete is not supported');
}
