
/**
 * Module dependencies.
 */

var config = require('./config.local');
var express = require('express');
var http = require('http');
var path = require('path');
var nano = require('nano')('http://'+ config.db_host);

var codeland_db = nano.use('codeland');
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

  codeland_db.insert(job, function(couchdb_error, couchdb_response){
    if (couchdb_error) return res.json({
      couchdb_error: {
        message: couchdb_error.message
      }
    });

    stripe.charges.create({
      amount: 2000,
      currency: 'cad',
      card: token,
      description: 'job posting',
      metadata: {
        username: req.body.username,
        job_id: couchdb_response.id
      }
    }, function(stripe_error, charge){
      if (stripe_error){
        codeland_db.destroy(couchdb_response.id, couchdb_response.rev);
        return res.json({ stripe_error: stripe_error })
      }

      job._id = couchdb_response.id;
      job._rev = couchdb_response.rev;
      job.stripe_payment_id = charge.id;
      codeland_db.insert(job);

      return res.json({
        charge: charge,
        job_id: job._id
      });
    });
  })
});

app.all('*', function(req, res){
  res.render('index', {
    stripe_pk: config.stripe_pk,
    db_host: config.db_host,
    db_name: config.db_name,
    cities: config.cities
  });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
