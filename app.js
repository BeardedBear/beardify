// var request = require('request'); // "Request" library

// var client_id = 'a05f4302858d402d873bee3d1d5e166c'; // Your client id
// var client_secret = '38ed1201776d4ba2a6bbd1f1c5f57939'; // Your secret

// // your application requests authorization
// var authOptions = {
//     url: 'https://accounts.spotify.com/api/token',
//     headers: {
//         'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
//     },
//     form: {
//         grant_type: 'client_credentials'
//     },
//     json: true
// };

// request.post(authOptions, function (error, response, body) {
//     if (!error && response.statusCode === 200) {

//     }
// });


var SpotifyWebApi = require('spotify-web-api-node');



// var scopes = ['user-read-private', 'user-read-email', 'user-modify-playback-state'],
//     redirectUri = 'https://example.com/callback',
//     clientId = 'a05f4302858d402d873bee3d1d5e166c',
//     state = 'some-state-of-my-choice';

// // Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
// var spotifyApi = new SpotifyWebApi({
//     redirectUri: redirectUri,
//     clientId: clientId
// });

// // Create the authorization URL
// var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);

// // https://accounts.spotify.com:443/authorize?client_id=a05f4302858d402d873bee3d1d5e166c&response_type=code&redirect_uri=https://example.com/callback&scope=user-read-private%20user-read-email%20user-modify-playback-state&state=some-state-of-my-choice
// console.log(authorizeURL);


var clientId = 'a05f4302858d402d873bee3d1d5e166c',
    clientSecret = '38ed1201776d4ba2a6bbd1f1c5f57939';

// Create the api object with the credentials
var spotifyApi = new SpotifyWebApi({
    clientId: clientId,
    clientSecret: clientSecret
});

// Retrieve an access token.
spotifyApi.clientCredentialsGrant().then(
    function (data) {
        console.log('The access token expires in ' + data.body['expires_in']);
        console.log('The access token is ' + data.body['access_token']);
        console.log(data)

        // Save the access token so that it's used in future calls
        spotifyApi.setAccessToken(data.body['access_token']);
    },
    function (err) {
        console.log('Something went wrong when retrieving an access token', err);
    }
);
