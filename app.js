'use strict';

var express = require("express");
var axios = require("axios");
const open = require('open');

const PORT = 3000;
const app = express();
const apiKey = 'R1KsBKXw3uuglqr3';
const clientId = 'azFF3TJCVUB52CHYw8GssO3htAbWW2ze3u8ZKkblI1zZdv7u';
const clientSecret = '4bAXqGTS78tJ6srYJiKIdsMiH2vawXG1ATJRDGriQQ9O1d5H';

var accessToken = '';
var appResponse = '';
var callBackUrl = "/oauthCallback";
var accessTokenUrl = 'https://hackaday.io/access_token';
var projectsUrl = 'http://api.hackaday.io/v1/projects';
var usersUrl = 'http://api.hackaday.io/v1/users/batch';
var singleUserUrl = 'http://api.hackaday.io/v1/users/';

app.set('view engine', 'ejs');

app.get('/GetUserData', (request, response) => {
  var ownerId = request.query.ownerId;
  axios.get(singleUserUrl + ownerId, { params: { api_key: apiKey }, headers: { 'Authorization': 'token ' + accessToken } })
  .then((result) => {
    response.send(result.data);
  });
});

app.get('/', () => {
  open('https://hackaday.io/authorize?response_type=code&client_id=' + clientId);
});

app.get(callBackUrl, (request, response) => {
  appResponse = response;
  var accessCode = request.query.code;
  axios.get(accessTokenUrl, { params: { client_id: clientId, client_secret: clientSecret, code: accessCode, grant_type: 'authorization_code' } })
  .then((result) => {
    accessToken = result.data.access_token;
    GetProducts();
  })
  .catch((error) => {
    appResponse.render('pages/error', { error: error , title: 'Error Occured' });
  });
});

function GetProducts(){
  return axios.get(projectsUrl, { params: { api_key: apiKey }, headers: { 'Authorization': 'token ' + accessToken } })
  .then((result) => {
    GetUsers(result.data.projects);
  }).catch((error) => {
    appResponse.render('pages/error', { error: error , title: 'Error Occured' });
  });
}

function GetUsers(projects) {
  var userIds  = [];
  
  for(var key in projects)
    userIds.push(projects[key].owner_id);

  return axios.get(usersUrl, { params: { api_key: apiKey, ids: userIds.join(',') }, headers: { 'Authorization': 'token ' + accessToken } })
  .then((result) => {
    var pageData = BuildPageData(projects, result.data.users);
    appResponse.render('pages/index', { pageData: pageData, title: 'Supplyframe Projects' });
  })
  .catch((error) => {
    appResponse.render('pages/error', { error: error , title: 'Error Occured' });
  });
}

function BuildPageData(projects, users){
  var pageData = [];
  
  for(var key in projects){
    var pageRow = {};
    
    pageRow['name'] = projects[key].name;
    pageRow['summary'] = projects[key].summary;
    pageRow['image_url'] = projects[key].image_url;
    pageRow['url'] = projects[key].url;
    pageRow['owner_name'] = GetUserInfo(projects[key].owner_id, users).screen_name;
    pageRow['owner_id'] = projects[key].owner_id;

    pageData.push(pageRow);
  }
  return pageData;
}

function GetUserInfo(userId, users){
  for(var key in users){
    if(users[key].id == userId)
      return users[key];
  }
}

app.listen(PORT);