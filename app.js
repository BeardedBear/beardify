var request = require('request'); // "Request" library

var client_id = 'a05f4302858d402d873bee3d1d5e166c'; // Your client id
var client_secret = '38ed1201776d4ba2a6bbd1f1c5f57939'; // Your secret

// your application requests authorization
var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
        'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
    },
    form: {
        grant_type: 'client_credentials'
    },
    json: true
};

request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
    }
});

