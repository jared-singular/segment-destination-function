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
  // Singular Event API Specs here: https://support.singular.net/hc/en-us/articles/360048588672-Server-to-Server-S2S-API-Endpoint-Reference#Event_Notification_Endpoint

  // Singular SDK API Key
  // Retrieve from the Singular SDK Page Here: https://app.singular.net/?user=#/sdk
  const _sdkkey = 'YOURSDKKEY_5c7f106a';
  
  // Singular S2S Event _sEventEndpoint
  const _sEventEndpoint = 'https://s2s.singular.net/api/v1/evt?'; 
  
  // Singular object for all query parameters to be sent on S2S Event.
  let params = {};
  
  // Singular Flag used to prevent sending events without a device identifier.
  let _sDeviceId = false; 

  // Advertising Device Identifiers
  let _gaid = event.context.device.advertisingId || '',
      _andi = event.context.device.id || '',
      _idfa = event.context.device.advertisingId || '',
      _idfv = event.context.device.id || '';

  // Singular Device Identifiers
  // Need to set in the App using Segment SDK once the Segement SDK Intializes. Store values in the context.singular.
  // See: 

  // Get Amazon Advertising Identifier (AMID) see: https://developer.amazon.com/docs/policy-center/advertising-id.html
  // Get Android AppSetID Identifier (ASID) see: https://developer.android.com/training/articles/app-set-id 
  // Get Singular Web SDK Identifier (SDID) see: https://support.singular.net/hc/en-us/articles/360039991491-Singular-Website-SDK-Native-Integration#Method_B_Advanced_Set_Singular_Device_ID_Manually
  
  let _asid = event.context.singular.appSetId || '', 
      _amid = event.context.singular.amazonId || '',
      _sdid = event.context.singular.webSDID || '',
      _webBundleID = event.context.singular.webBundleId || '';

  // Singular Event Timestamp
  // Used to backdate the actual event
  // See how Segment defines timestamp here: https://segment.com/docs/connections/spec/common/#context
  let _utime = event.timestamp || '';
  if(_utime !== ''){
  	const dateToday = new Date(_utime);
	  let timestamp = Date.parse(dateToday)/1000;
    params["utime"] = timestamp;
  }

  let _n = event.event || 'segment_unknown';
  params["a"] = _sdkkey;
  params["n"] = _n;
  params["ve"] = event.context.os.version || '';
  params["sdk_version"] = 'SegmentS2S_CustomFunction';
  params["custom_user_id"] = event.userId || '';
  params["ua"] = event.context.userAgent || '';
  params["ma"] = event.context.device.manufacturer || '';
  params["mo"] = event.context.device.model || '';
  params["lc"] = event.context.locale || '';
    
  // Handling Revenue Event - Event Names must be explictly included for the revenue to be received by Singular.
  // Otherwise the event will not include revenue.
  // Capture Revenue Event Amount and Currency from Segment Order Completed
  
  if(_n === 'Order Completed'){
  	let _revenue = event.properties.revenue || '';
  	let _currency = event.properties.currency || '';
  	if(_revenue !== '' && _currency !== ''){
  		params["amt"] = _revenue;
  		params["cur"] = _currency;
  		params["is_revenue_event"] = 'true';
  	}
  }
  
  // Pass all Segement Properties into Singular Event Arguments here.
  let eventArgs = {};
  let _segmentProperties = event.properties || '';
  if(_segmentProperties !== ''){
  	for (let x in _segmentProperties) {
   		eventArgs[x] = _segmentProperties[x];
	  }	
  } 
  eventArgs["anonymousId"] = event.anonymousId || '';
  eventArgs["userId"] = event.userId || '';
  params["e"] = JSON.stringify(eventArgs);
  
  // Validation on IP Address Handling
  // If IP Address is not included, we will fallback to the IP of the Request
  let _ip = event.context.ip || '';
  if(_ip === ''){
  	params["use_ip"] = 'True';
  } else {
  	params["ip"] = _ip;
  }

  // Get Device Platform and define the Device Identifiers to use on the Request.
  // Singular only supports Android, iOS, and Web
  let _p = event.context.device.type || 'Web';
  if(_p !== ''){
  	if(_p.toLowerCase() === 'android'){
  		if(_gaid && _gaid.length == 36){
  			_gaid = _gaid.toLowerCase();
  			params["aifa"] = _gaid || '';
  			_sDeviceId = true;
  		} 
  	
  	if(_asid && _asid.length == 36){
  		_asid = _asid.toLowerCase();
  		params["asid"] = _asid || '';
  		_sDeviceId = true;
  	}

  	if(_amid && _amid.length == 36){
  		_amid = _amid.toLowerCase();
  		params["amid"] = _amid || '';
  		_sDeviceId = true;
  	}
  	params["i"] = event.context.app.namespace || 'segment.unknown.bundleId';
  	params["p"] = 'Android';
  	params["andi"] = _andi || '';

  	} else if(_p.toLowerCase() === 'ios'){
    	// Learn more at https://segment.com/docs/connections/sources/catalog/libraries/mobile/ios/#ad-tracking-and-idfa
  		if(_idfa && _idfa.length == 36){
  			_idfa = _idfa.toUpperCase();
  			params["idfa"] = _idfa || '';
      		_sDeviceId = true;
  		} 
  		
  		if(_idfv && _idfv.length == 36){
  			_idfv = _idfv.toUpperCase();
  			params["idfv"] = _idfv || '';
  			_sDeviceId = true;
  		}
  		params["i"] = event.context.app.namespace || 'segment.unknown.bundleId';
  		params["p"] = 'iOS';
    	let adTrackingEnabled = event.context.device.adTrackingEnabled;
  		if(adTrackingEnabled !== true){
      		params["att_authorization_status"] = '0';
    	} else {
      		params["att_authorization_status"] = '3';
    	}
  	} else {
  		if(_sdid !== '' && _webBundleID !== ''){
  			if(_sdid && _sdid.length == 36){
  				_sdid = _sdid.toLowerCase();
  				params["sdid"] = _sdid;
  				_sDeviceId = true;
  			}

  			_i = event.context.page.url;
  			if(_i.indexOf("http:") !== -1){
    			_i = _i.split("/")[2];
    		}
  			params["i"] = _webBundleID;
  			params["p"] = 'Web';
  		}

  	}
  }

  let query = Object.keys(params)
    .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
    .join('&');
  let url = _sEventEndpoint + query;
  console.log(url);

  if(_sDeviceId === true){
  	let response;

  	try {
    	response = await fetch(url,
    	{
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
