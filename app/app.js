/**
 * This was done with the help of the Spotify API
 * https://developer.spotify.com/web-api/
 */

const express = require('express');
const request = require('request');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const axios = require('axios');

//const optionsX = require('./options');

const client_id = '1b83fcce67524a858a05fec2bfff28f9';
const client_secret = '6119312c41554d5e8a3d6c1f6e81c6e7';
const redirect_uri = 'http://localhost:8080/callback';

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
const generateRandomString = function(length) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const stateKey = 'spotify_auth_state';

const app = express();

app.use(express.static(__dirname + '/public'))
   .use(cookieParser());

app.get('/login', function(req, res) {

  const state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  const scope = 'user-read-private user-read-email user-top-read user-library-read user-read-recently-played';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

let artJ = {
  'artistas':{'recentes':{},
              'meio':{},
              'geral':{}},
  'musicas':{'recentes':{},
              'meio':{},
              'geral':{}},
  'ultimatocada':''
};
app.get('/callback', function(req, res) {
  const data = {
    artists: {
      recents: [],
      middle: [],
      general: []
    },
    tracks: {
      recents: [],
      middle: [],
      general: []
    },
    lastMusic: ''
  }
  const code = req.query.code || null;
  const state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    return res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  }
  res.clearCookie(stateKey);

  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: redirect_uri,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {

      function makeOptions(url){
        return {
          method: 'GET',
          headers: { 'Authorization': 'Bearer ' + body.access_token },
          json: true,
          url: url
        }
      };
      function formatData(data, index){
        return `${index + 1}. ${data.name}`;
      }
      axios(makeOptions('https://api.spotify.com/v1/me/top/artists?time_range=short_term'))
        .then((result)=> {
          data.artists.recents = result.data.items.map(formatData);
          return axios(makeOptions('https://api.spotify.com/v1/me/top/artists?time_range=medium_term'))
        }).then((result)=> {
          data.artists.middle = result.data.items.map(formatData);;
          return axios(makeOptions('https://api.spotify.com/v1/me/top/artists?time_range=long_term'))
        }).then((result)=> {
          data.artists.general = result.data.items.map(formatData);;
          return axios(makeOptions('https://api.spotify.com/v1/me/top/tracks?time_range=short_term'))
        }).then((result)=> {
          data.tracks.recents = result.data.items.map(formatData);;
          return axios(makeOptions('https://api.spotify.com/v1/me/top/tracks?time_range=medium_term'))
        }).then((result)=> {
          data.tracks.middle = result.data.items.map(formatData);;
          return axios(makeOptions('https://api.spotify.com/v1/me/top/tracks?time_range=long_term'))
        }).then((result)=>{
          data.tracks.general = result.data.items.map(formatData);;
          return axios(makeOptions('https://api.spotify.com/v1/me/player/recently-played?limit=10'))
        }).then((result)=>{
          data.lastMusic = result.data.items.map((track, index)=> `${index + 1}. ${track.track.name}`);;
          return res.send(data);
        }).catch((error)=> res.send(error));
    }
    else return res.redirect(`/#${querystring.stringify({ error: 'invalid_token' })}`);
  });

});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});


app.get('/data', (req, res) => {
  console.log('information sent.'); //debug
  res.send(artJ);
})

console.log('Listening on 8080');
app.listen(8080);
