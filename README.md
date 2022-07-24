# Custom Segment Destination Function for Singular Hybrid Integrations
## Description
This solution is used for Hybrid Integrations with Segment and enables Segment to send Track Events to Singular using the Singular Server-to-Server REST API. This solution is not NOT to be used with the formal Singular integrations published on the Segment Help Center. This allows for the capture of specific identifiers used by Singular's SDK in some instances which are not supported by the Segment Mobile Libraries. 

> **Note**
> Being a custom solution, this code snippet is provided as a working example and allows the developer full control to update or modify the content and behavior as desired. Due to theflexibility of this solution, the Singular Support team is not responsible for maintenance of this code. The developer implementing this solution must consult the Segment and Singular documentation to troubleshoot issues if they arise.

> **Warning**
> Due to the Hybrid nature of this integration it is recommended to disable the Segment *Application Lifecycle Events*. These are disabled in the Initialization of the Segment SDK. The Singular SDK will automatically track Sessions and these events are not needed.

- Coming Soon: Enabling the passing of Web events to Singular.

### Requirements
- The Singular SDK must be natively implemented in the Advertiser App. This solution is not to be used if you are using the Segment Device Mode Integration.
- The Segment Mobile SDK must be Intialized before the Singular SDK
- Segment Track events must not be enabled until the Singular SDK is Initialized and the Identify Code snippet is invoked.


### Implementation Steps
#### Step 1
Add support in your Mobile Apps and Web App

<details><summary>CLICK for iOS</summary>
iOS - Implement the Segment iOS Library

CODE: Obj-C
```Obj-C
// Add the following code to your didFinishLaunchingWithOptions entry point:
SEGAnalyticsConfiguration *configuration = [SEGAnalyticsConfiguration configurationWithWriteKey:SEGMENTKEY];
    configuration.trackApplicationLifecycleEvents = NO; // Enable this to record certain application events automatically!
    configuration.recordScreenViews = YES; // Enable this to record screen views automatically!
    [SEGAnalytics setupWithConfiguration:configuration];
```
    
Add the IDFA, IDFV, and ATT status as Segment Track event properties for all of the Segment Track Events. 

CODE: Obj-C
```Obj-C
// Set Segment Properties Example
// DO NOT CHANGE the nameing convention used in the example, as it matches the keys in the Custom Function Script.   
[[SEGAnalytics sharedAnalytics] track:@"EventName"
                                properties:@{ @"singularIDFA": self.s_idfa,
                                              @"singularIDFV": self.s_idfv,
                                              @"singularATT": self.att_state
                                              }];
```
</details>

<details><summary>CLICK for Android</summary>
Android - Implement the Segment Android Library
    
CODE: Java
```Java
// We recommend initializing the client in your Application subclass.
// Read More here: https://segment.com/docs/connections/sources/catalog/libraries/mobile/android/#step-2-initialize-the-client
Analytics analytics = new Analytics.Builder(getApplicationContext(), Constants.SEGMENTKEY)
                .recordScreenViews() // Enable this to record screen views automatically!
                .build();
```
    
Add the following code to your App Immediately after obtaining your Device Identifiers. This code will store the current Device Advertising Identifiers in the Segment Identify Traits in a Singular element. Retreive the Android AppSetID, and Google Advertising ID in the App prior to Segment or Singular SDK Initialization. 
- See How to retreive the AppSetId: https://developer.android.com/training/articles/app-set-id
- See how to Retrieve the Google Advertising Id: https://developer.android.com/training/articles/ad-id
> **Note** 
> Obtaining these identifiers usually requires a mmethod outside of the main thread. You may need to invoke the following Segment code in the same method.

CODE: Java
```Java
Analytics.with(getApplicationContext()).identify(new Traits().putValue("singularGAID",GAID));
Analytics.with(getApplicationContext()).identify(new Traits().putValue("singularASID",ASID));
```
</details>

<details><summary>CLICK for Web</summary>
Web - Implement the Segment Javascript Library

Follow the Segment guide to add the Analytics.js library to your website. Read More here: https://segment.com/docs/connections/sources/catalog/libraries/website/javascript/quickstart/
    
CODE: Javascript
```Javascript
// Your Script will look something like this:
<script>
  !function(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","once","off","on","addSourceMiddleware","addIntegrationMiddleware","setAnonymousId","addDestinationMiddleware"];analytics.factory=function(e){return function(){var t=Array.prototype.slice.call(arguments);t.unshift(e);analytics.push(t);return analytics}};for(var e=0;e<analytics.methods.length;e++){var key=analytics.methods[e];analytics[key]=analytics.factory(key)}analytics.load=function(key,e){var t=document.createElement("script");t.type="text/javascript";t.async=!0;t.src="https://cdn.segment.com/analytics.js/v1/" + key + "/analytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n);analytics._loadOptions=e};analytics._writeKey="ZaFli4dfqQyJ8BOMumCCi4ZLVLG2LOwQ";;analytics.SNIPPET_VERSION="4.15.3";
  analytics.load("ZaFli4dfqQyJ8BOMumCCi4ZLVLG2LOwQ");
  analytics.page();
  }}();
</script>
```
    
Add the following code to your App Immediately after the Singular SDK is Initialized. This code will store the current Device Advertising Identifiers in the Segment Identify Traits in a Singular element.

CODE: Javascript
```Javascript
// Coming soon
```
</details>

#### Step 2
Setup a Custom Destination Function in Segment

In Segment's UI:
1. Click our your Workspace
- Click "Catalog" in the left navigation
- Click "Functions" in the top menu
- Click "New Function"
- Click "Destination" and then "Build"
2. Copy the provided Javascript Function into the Function Code box
- Click "Settings" in the top menu, and then "Add Setting"
- Label the Setting as "Singular SDK Key"
- Leave the Type set to "String"
- toggle on the "Required" and "Sensitive" options.
- Click Add Setting

You will be prompted to enter your Singular SDK Key from here:

3. From the Functions screen Click the Function, and choose "+ Connect Destination"
- Select the Sources for which this Destination should be enabled.

### Testing
Using the Destination Function UI in Segment and the Singular SDK Console in the Singular UI, you may test the Javascript Function.
1. Use one of the following Sample Segment Payload for Testing. 
2. Update your "writeKey" in the Sample Payload
3. Copy the appropriate device identifier for use in the Singular SDK Console and activate listening
4. Click the "Run" button in the Segment UI.
5. Wait for the Event to display in the Singular SDK Console.

<details><summary>CLICK for iOS Sample Payload</summary>

CODE: JSON
```JSON
    {
  "anonymousId": "4BC485A2-2EFC-426B-A21F-3F2DEEE8B270",
  "channel": "server",
  "context": {
    "app": {
      "build": "1",
      "name": "Sample ObjC",
      "namespace": "ios.sample.app.objc",
      "version": "2.0"
    },
    "device": {
      "id": "6F9BF4A0-D7CC-475A-9918-54E04D67482B",
      "manufacturer": "Apple",
      "model": "iPhone12,3",
      "name": "iPhone",
      "type": "ios"
    },
    "ip": "104.220.18.50",
    "library": {
      "name": "analytics-ios",
      "version": "4.1.6"
    },
    "locale": "en-US",
    "network": {
      "carrier": "T-Mobile",
      "cellular": false,
      "wifi": true
    },
    "os": {
      "name": "iOS",
      "version": "15.6"
    },
    "screen": {
      "height": 812,
      "width": 375
    },
    "timezone": "America/Los_Angeles",
    "traits": {}
  },
  "event": "Purchase",
  "integrations": {},
  "messageId": "6BCEE4A2-9741-4679-90AC-5EF897A301A2",
  "originalTimestamp": "2022-07-24T15:53:44.725Z",
  "projectId": "aoh5D6cBsUUDAAW5eMH3br",
  "properties": {
    "singularATT": "(3) Authorized",
    "singularIDFA": "2A4999C7-7E75-473B-A13B-8859EAE5D9C0",
    "singularIDFV": "6F9BF4A0-D7CC-475A-9918-54E04D67482B",
    "revenue":"29.95",
    "currency":"USD"
  },
  "receivedAt": "2022-07-24T15:54:14.904Z",
  "sentAt": "2022-07-24T15:54:14.659Z",
  "timestamp": "2022-07-24T15:53:44.970Z",
  "type": "track",
  "version": 2,
  "writeKey": "YOUR WRITE KEY"
}
```
</details>  
    
<details><summary>CLICK for Android Sample Payload</summary>

CODE: JSON
```JSON
    {
  "anonymousId": "4BC485A2-2EFC-426B-A21F-3F2DEEE8B270",
  "channel": "server",
  "context": {
    "app": {
      "build": "1",
      "name": "Sample ObjC",
      "namespace": "ios.sample.app.objc",
      "version": "2.0"
    },
    "device": {
      "id": "6F9BF4A0-D7CC-475A-9918-54E04D67482B",
      "manufacturer": "Apple",
      "model": "iPhone12,3",
      "name": "iPhone",
      "type": "ios"
    },
    "ip": "104.220.18.50",
    "library": {
      "name": "analytics-ios",
      "version": "4.1.6"
    },
    "locale": "en-US",
    "network": {
      "carrier": "T-Mobile",
      "cellular": false,
      "wifi": true
    },
    "os": {
      "name": "iOS",
      "version": "15.6"
    },
    "screen": {
      "height": 812,
      "width": 375
    },
    "timezone": "America/Los_Angeles",
    "traits": {}
  },
  "event": "Purchase",
  "integrations": {},
  "messageId": "6BCEE4A2-9741-4679-90AC-5EF897A301A2",
  "originalTimestamp": "2022-07-24T15:53:44.725Z",
  "projectId": "aoh5D6cBsUUDAAW5eMH3br",
  "properties": {
    "singularATT": "(3) Authorized",
    "singularIDFA": "2A4999C7-7E75-473B-A13B-8859EAE5D9C0",
    "singularIDFV": "6F9BF4A0-D7CC-475A-9918-54E04D67482B",
    "revenue":"29.95",
    "currency":"USD"
  },
  "receivedAt": "2022-07-24T15:54:14.904Z",
  "sentAt": "2022-07-24T15:54:14.659Z",
  "timestamp": "2022-07-24T15:53:44.970Z",
  "type": "track",
  "version": 2,
  "writeKey": "YOUR WRITE KEY"
}
```
</details>  

<details><summary>CLICK for Web Sample Payload</summary>

CODE: JSON
```JSON
    {
  "_metadata": {
    "bundled": [
      "Segment.io"
    ],
    "bundledIds": [],
    "unbundled": []
  },
  "anonymousId": "5d7e9c75-cee0-4e01-9714-3db67d871caf",
  "channel": "client",
  "context": {
    "campaign": {},
    "ip": "74.125.210.177",
    "library": {
      "name": "analytics.js",
      "version": "next-1.39.1"
    },
    "locale": "en-US",
    "page": {
      "path": "/render2",
      "referrer": "https://gtm-msr.appspot.com/render?id=GTM-5M6P9MH",
      "search": "?id=GTM-5M6P9MH",
      "title": "gtm-msr",
      "url": "https://gtm-msr.appspot.com/render2?id=GTM-5M6P9MH"
    },
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36"
  },
  "event": "Order Completed",
  "integrations": {},
  "messageId": "ajs-next-fe03a1d53ce5864987388e42d40175fe",
  "originalTimestamp": "2022-07-24T01:41:04.535Z",
  "projectId": "je5kRCsesHUphNViZpWqtT",
  "properties": {
    "currency": "USD",
    "product": "Sample",
    "revenue": "14.99",
    "singularSDID": "b7990740-9ca3-469d-8bde-d3d652ba035f",
    "singularWebBundleId": "com.singular.jared"
  },
  "receivedAt": "2022-07-24T01:41:06.240Z",
  "sentAt": "2022-07-24T01:41:04.554Z",
  "timestamp": "2022-07-24T01:41:06.221Z",
  "type": "track",
  "userId": null,
  "version": 2
}
```
</details>  
