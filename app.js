// const dotenv = require('dotenv').config();
// const http = require('http');
// const hostname = '127.0.0.1';
// const port = 4000;
const SpotifyWebApi = require('spotify-web-api-node');
const fs = require('fs');
const dotenv = require('dotenv').config();

// Create the api object with the credentials
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

// const server = http.createServer((req, res) => {
//     res.statusCode = 200;
//     res.setHeader('Content-Type', 'text/plain');
//     res.end('Hello World\n');
// });

// server.listen(port, hostname, () => {
//     console.log(process.env.API_KEY)
// });

spotifyApi.clientCredentialsGrant().then(
    function (data) {
        console.log(data.body.access_token)
    },
    function (err) {
        console.log('Something went wrong when retrieving an access token', err);
    },
);
