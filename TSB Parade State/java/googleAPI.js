// Global variables to track when each script is fully loaded
let tokenClient;
let gapiInited = false;
let gIsInited = false; // Keep this to safely handle async loading speeds

const API_KEY = 'AIzaSyAzYkNSQHsce0jeeDWRj345QkZDnbTLQxQ';
const CLIENT_ID = '1049186851076-f4hrd8ctndsjod5bp0kf6uc96svpa6c2.apps.googleusercontent.com';
const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly';

async function gapiLoaded() {
  gapi.load('client', intializeGapiClient);
}

async function intializeGapiClient() {
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: [DISCOVERY_DOC],
  });
  gapiInited = true;
  checkAuthReady();
}

async function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: async (resp) => {
      if (resp.error !== undefined) {
        throw (resp);
      }

      gapi.client.setToken(resp); 
      updateSignInStatus(true);
    },
  });
  gIsInited = true;
  checkAuthReady();
}

// This helper function safely fires only when both scripts are 100% ready
async function checkAuthReady() {
  if (gapiInited && gIsInited) {
    const token = gapi.client.getToken();
    if (token === null) {
      tokenClient.requestAccessToken({ prompt: 'none' });
    }
    else
    {
      try {
        const userInfo = await gapi.client.oauth2.userinfo.get();
        const userName = userInfo.result.given_name || userInfo.result.name;
        updateSignInStatus(true, userName);
        return;
      } catch (e) {
        console.error(e);
      }
    }
    updateSignInStatus(token !== null);
  }
}

function updateSignInStatus(isSignedIn, userName = null) {
  var btn = document.getElementById("SignIn");
  var welcomeText = document.getElementById("WelcomeMessage");

  if (!btn) 
    return;

  if (isSignedIn) {
    console.log("User signed in. Fetching spreadsheet data...");
    if (welcomeText && userName)
    {
      welcomeText.textContent = `Welcome, ${userName}!`;
    }

    btn.textContent = "Log Out";
  } else {
    console.log("User signed out.");
    if (welcomeText)
    {
      welcomeText.textContent = "";
    }

    btn.textContent = "Sign In";
    
  }
}

function handleSignInClick() {
  const token = gapi.client.getToken();
  if (token === null) {
    tokenClient.requestAccessToken({ prompt: 'select_account' });
    return;
  }

  handleSignOutClick();
}

function handleSignOutClick() {
  const token = gapi.client.getToken();
  if (token !== null) {
    google.accounts.oauth2.revoke(token.access_token, () => {
      gapi.client.setToken('');
      updateSignInStatus(false);
    });
  }
}

// function read_data() {
//   var params = {
//     spreadsheetId: '1vylevO7L00uoj69y0ScnPj6W2CorNUCZRtflnUsOMZo',
//     range: 'HonourRoll!A2:B',
//   };

//   var request = gapi.client.sheets.spreadsheets.values.get(params);
//   request.then(function(response) {
//     console.log(response.result);
//   }, function(reason) {
//     console.error('error: ' + reason.result.error.message);
//   });
// }