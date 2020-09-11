var GoogleAuth;
var SCOPE = 'https://www.googleapis.com/auth/calendar.readonly';

const googleInit = function() {

    // Initialize the gapi.client object, which app uses to make API requests.
    gapi.client.init({
        'apiKey': API_KEY,
        'clientId': CLIENT_ID,
        'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'], // discovery document for version 3 of Google Calendar API.
        'scope': SCOPE
    }).then(function () {
        GoogleAuth = gapi.auth2.getAuthInstance();

        // Listen for sign-in state change, and run updateSigninStatus function
        GoogleAuth.isSignedIn.listen(setSigninStatus);

        // Set initial sign-in state
        var user = GoogleAuth.currentUser.get();
        setSigninStatus();

    });
}

const signInOut = function() {
    if (GoogleAuth.isSignedIn.get()) {
        // User is authorized and has clicked "Sign out" button.
        GoogleAuth.signOut();
    } else {
        // User is not signed in, so sign in
        GoogleAuth.signIn();
    }
}

const revokeAccess = function() {
    GoogleAuth.disconnect();
}

const setSigninStatus = function() {
    var user = GoogleAuth.currentUser.get();
    var isAuthorized = user.hasGrantedScopes(SCOPE);
    if (isAuthorized) {
        $('#authorise').html('Sign out');
        $('#revoke').css('display', 'inline-block');
        $('#filter-tab').tab('show');
    } else {
        $('#authorise').html('Authorise');
        $('#revoke').css('display', 'none');
    }
}