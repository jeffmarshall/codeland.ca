
/**
 * Module dependencies.
 */

var config = require('./config.local');
var express = require('express');
var http = require('http');
var path = require('path');

var stripe = require("stripe")(
  config.stripe_sk
);

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.bodyParser())
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.post('/api/pay', function(req, res){
  var token = req.body.token;

  stripe.charges.create({
    amount: 2000,
    currency: 'cad',
    card: token,
    description: 'job posting',
    metadata: { username: req.body.username }
  }, function(error, charge){
    if (error){ return res.json({ error: error }) }

    return res.json(charge);
  });
});

app.all('*', function(req, res){
  res.render('index', {
    stripe_pk: config.stripe_pk,
    db_host: config.db_host,
    db_name: config.db_name
  });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
