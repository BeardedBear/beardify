const SpotifyWebApi = require('spotify-web-api-node');
const fs = require('fs');

const clientId = 'a05f4302858d402d873bee3d1d5e166c',
    clientSecret = '38ed1201776d4ba2a6bbd1f1c5f57939';

// Create the api object with the credentials
const spotifyApi = new SpotifyWebApi({
    clientId: clientId,
    clientSecret: clientSecret
});

// Retrieve an access token.
spotifyApi.clientCredentialsGrant().then(
    function (data) {
        fs.writeFileSync(
            'public/token.json',
            JSON.stringify({ token: data.body['access_token'] })
        );
    },
    function (err) {
        console.log('Something went wrong when retrieving an access token', err);
    }
);

