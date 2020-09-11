# Graduate Shadowing App

This is a simple web application to scrape Red Hatters' calendars to find customer meetings to tag along to. The implementation is all client-side, so no calendar data will pass through wherever the application is deployed (only between Google API and the browser).

## Setup

### Google API Credentials

You will need to create API credentials for the application to talk to the Google API.

1. Go to the [Google API Console](https://console.developers.google.com/apis) and create a new project.
2. Under credentials, click *Create Credentials* and choose *API key*. Copy the API key into the file *config/apiKey.example.js*.
3. Click on the newly created API key to edit it. Under *Application Restrictions* select *HTTP referrers (websites)* and add the URL of the shadowing application by clicking *Add an item*. Save the API key.
4. Under credentials, click *Create Credentials* and choose *OAuth client ID*. Under *Application Type* choose *Web application*. Add the application URL under *Authorised JavaScript origins*, and click *Create*.
5. Back on the *Credentials* page, copy the Client ID from your new OAuth client ID into the apiKey.example.js file.

### Edit config files

Inside the *config* folder, there are two files, *apiKey.example.js* and *calendars.example.txt*. Add the calendars/email addresses (that you would like the application to have pre-filled) to the *calendars.example.txt*. You should already have made changes to the *apiKey.example.js* file in the previous section. Now rename the two files to *calendars.txt* and *apiKey.js* respectively.

### Deploying to OpenShift

From the root of the repository:

1. Log into OpenShift using the `oc` command line tool
2. Create a new project
   ```
   oc new-project shadowing
   ```
3. Create the ConfigMaps from the config files
   ```
   oc create configmap shadowing --from-file config
   ```
4. Deploy the application
   ```
   oc apply -f openshift.yml
   ```
