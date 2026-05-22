// Global variables to track when each script is fully loaded
let tokenClient;
let gapiInited = false;
let gIsInited = false; // Keep this to safely handle async loading speeds

const API_KEY = 'AIzaSyAzYkNSQHsce0jeeDWRj345QkZDnbTLQxQ';
const CLIENT_ID = '1049186851076-f4hrd8ctndsjod5bp0kf6uc96svpa6c2.apps.googleusercontent.com';
const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly openid profile';

async function gapiLoaded() {
  gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
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
      await fetchAndRenderUserInfo();
      updateSignInStatus(true);
    },
    error_callback: (err) => {   
      console.warn("Silent auth failed:", err.type);
      updateSignInStatus(false);
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
      await fetchAndRenderUserInfo();
    }
  }
}

async function fetchAndRenderUserInfo() {
  try {
    const currentToken = gapi.client.getToken();
    if (!currentToken || !currentToken.access_token) {
      throw new Error('No active access token found');
    }

    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${currentToken.access_token}` }
    });

    if (!response.ok) throw new Error('Token invalid or expired');

    const userInfo = await response.json();
    const userName = userInfo.given_name || userInfo.name;
    updateSignInStatus(true, userName);
  } catch (e) {
    console.error("Auth validation error:", e);
    gapi.client.setToken(null);
    updateSignInStatus(false);
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
      gapi.client.setToken(null);
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