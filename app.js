'use strict';

var express = require("express");
var axios = require("axios");

const PORT = 3000;
const app = express();
const apiKey = 'R1KsBKXw3uuglqr3';
const clientId = 'azFF3TJCVUB52CHYw8GssO3htAbWW2ze3u8ZKkblI1zZdv7u';
const clientSecret = '4bAXqGTS78tJ6srYJiKIdsMiH2vawXG1ATJRDGriQQ9O1d5H';

var accessCode = '';
var accessToken = '';
var callBackUrl = "/oauthCallback";
var accessTokenUrl = 'https://hackaday.io/access_token';
var projectsUrl = 'http://api.hackaday.io/v1/projects';

app.set('view engine', 'ejs');

app.get(callBackUrl, (req, res) => {
  console.log("Entered Callback");
  accessCode = req.query.code;
  console.log('Request Code: ' + req.query.code);
  axios.get(accessTokenUrl, { params: { client_id: clientId, client_secret: clientSecret, code: accessCode, grant_type: 'authorization_code' } })
    .then((response) => {
      accessToken = response.data.access_token;
      getProducts(res);
    })
    .catch((error) => {
        console.log('Error occured: ' + error);
    })
});

function getProducts(res){
  axios.get(projectsUrl, { params: { api_key: apiKey }, headers: { 'Authorization': 'token ' + accessToken } })
    .then((response) => {
      console.log(response.data.projects);
      res.render('pages/index', {projects: response.data.projects, title: 'Supplyframe Projects'});
    })
    .catch((error) => {
        console.log('Error occured: ' + error);
    })
}

app.listen(PORT);