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

##### iOS
Implement the Segment iOS Library

CODE: Obj-C
```Obj-C
// Add the following code to your didFinishLaunchingWithOptions entry point:
SEGAnalyticsConfiguration *configuration = [SEGAnalyticsConfiguration configurationWithWriteKey:SEGMENTKEY];
    configuration.trackApplicationLifecycleEvents = NO; // Enable this to record certain application events automatically!
    configuration.recordScreenViews = YES; // Enable this to record screen views automatically!
    [SEGAnalytics setupWithConfiguration:configuration];
```
    
Add the following code to your App Immediately after the Singular SDK is Initialized. This code will store the current Device Advertising Identifiers in the Segment Identify Traits in a Singular element.

CODE: Obj-C
```Obj-C
// Set Segment Identify Traits for Singular
    NSString *segmentAnonymousId = [[SEGAnalytics sharedAnalytics] getAnonymousId];
    NSLog(@"Segment AnonymousId: %@", segmentAnonymousId);
    [[SEGAnalytics sharedAnalytics]
     identify: nil traits:@{ @"singular": @{ @"idfa": self.s_idfa, @"idfv": self.s_idfv, @"attStatus": self.att_state}}];
```

##### Android
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

##### Web
CODE: Javascript
```Javascript
// Add the following code to your didFinishLaunchingWithOptions entry point:
SEGAnalyticsConfiguration *configuration = [SEGAnalyticsConfiguration configurationWithWriteKey:SEGMENTKEY];
    configuration.trackApplicationLifecycleEvents = NO; // Enable this to record certain application events automatically!
    configuration.recordScreenViews = YES; // Enable this to record screen views automatically!
    [SEGAnalytics setupWithConfiguration:configuration];
```
    
Add the following code to your App Immediately after the Singular SDK is Initialized. This code will store the current Device Advertising Identifiers in the Segment Identify Traits in a Singular element.

CODE: Javascript
```Javascript
// Set Segment Identify Traits for Singular
    NSString *segmentAnonymousId = [[SEGAnalytics sharedAnalytics] getAnonymousId];
    NSLog(@"Segment AnonymousId: %@", segmentAnonymousId);
    [[SEGAnalytics sharedAnalytics]
     identify: nil traits:@{ @"singular": @{ @"idfa": self.s_idfa, @"idfv": self.s_idfv, @"attStatus": self.att_state}}];
```

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
Coming Soon!
