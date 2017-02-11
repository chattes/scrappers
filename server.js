const express = require('express')
const fs = require('fs')
const request = require('request')
const cheerio = require('cheerio')
const app = express()
const router = express.Router()
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors')
const jsdom = require('jsdom')
const xmovies = require('./controllers/xmovies8')
const hfl4u = require('./controllers/hindifilmlinks')


app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());

//Scrape URL -hindifilmlinks4U
router.get('/hfl4u/link', hfl4u.scrapeHFLM)
router.get('/xmovies/scrape', xmovies.listMovies) //Done
router.get('/xmovies/play', xmovies.playMovie) //Stuck at real-Debrid Parsing


app.use(router)
app.listen('3030')
console.log('Magic happens on port 3030')
exports = module.exports = app