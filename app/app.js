/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

const express = require('express'); // Express web server framework
const request = require('request'); // "Request" library
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const axios = require('axios');

const client_id = '1b83fcce67524a858a05fec2bfff28f9'; // Your client id
const client_secret = '6119312c41554d5e8a3d6c1f6e81c6e7'; // Your secret
const redirect_uri = 'http://localhost:8080/callback'; // Your redirect uri

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
let artistas = new Array();
let musiquinhas = '';
app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
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

      const options = {
        url: 'https://api.spotify.com/v1/me/top/artists',
        headers: { 'Authorization': 'Bearer ' + body.access_token },
        json: true
      };

      const options2 = {
        url: 'https://api.spotify.com/v1/me/player/recently-played',
        headers: { 'Authorization': 'Bearer ' + body.access_token },
        json: true
      };

      // use the access token to access the Spotify Web API
      request.get(options, function(error, response, body) {   
        //console.log(body);
        artistas = body.items.map(function(element){
          return element.name;
        });
        console.log(artistas);
        //console.log('/data?' + querystring.stringify(body));
        


        
      });
      request.get(options2,function(error,response,body) {
        musiquinhas = body.items[0].track.name;
        console.log(musiquinhas);



        //essa porra fode o rolê, entender onde por
        return res.redirect('/data?' +
          querystring.stringify(body));
      });
      
      
      
      // we can also pass the token to the browser to make requests from there

    }
    else {
      res.redirect('/#' +
      querystring.stringify({
        error: 'invalid_token'
      }));
    }
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
  let printatual = 'Artistas Topzeras dos ultimos 6 meses: '+'1.'+ artistas[0] + '\n' +
    '2.'+ artistas[1] + '\n' +
    '3.'+ artistas[2] + '\n' +
    '4.'+ artistas[3] + '\n' +
    '5.'+ artistas[4] + '\n' +
    '6.'+ artistas[5] + '\n' +
    '7.'+ artistas[6] + '\n' +
    '8.'+ artistas[7] + '\n' +
    '9.'+ artistas[8] + '\n' +
    '10.'+ artistas[9] + '\n' +
    '11.'+ artistas[10] + '\n' +
    '12.'+ artistas[11] + '\n' +
    '13.'+ artistas[12] + '\n' +
    '14.'+ artistas[13] + '\n' +
    '15.'+ artistas[14] + '\n' +
    '16.'+ artistas[15] + '\n' +
    '17.'+ artistas[16] + '\n' +
    '18.'+ artistas[17] + '\n' +
    '19.'+ artistas[18] + '\n' +
    '20.'+ artistas[19] + '\n' +
    'Ultima musica tocada nesse baralho:' + musiquinhas;
  console.log('here');
  res.send(printatual);
  //for(i=0;i<artistas.length;i++)res.send(artistas[i]);
  //res.send(req.query)
  //res.send(for(i=0;i<artistas.length;i++)artistas[i]);
    
})


console.log('Listening on 8080');
app.listen(8080);