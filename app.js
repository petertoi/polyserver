var compression = require('compression')
var express = require( 'express' );
var app = express(compression());
var bodyParser = require( 'body-parser' );
var Vectorizer = require( './vectorizer' );

app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( bodyParser.json() );

app.use( function( req, res, next ) {
	res.header( 'Access-Control-Allow-Origin', '*' );
	res.header( 'Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept' );
	next();
} );

app.get( '/', function( req, res ) {
	res.send( { status: 'ok' } );
} );

app.get( '/convert', function( req, res, done ) {
	var v = new Vectorizer();

	v.url = req.query.url || req.params.url || req.body.url || '';
	v.cutoff = req.query.cutoff || req.params.cutoff || req.body.cutoff || 5000;
	v.threshold = req.query.threshold || req.params.threshold || req.body.threshold || 40;

	var ip = req.headers[ 'x-forwarded-for' ] || req.connection.remoteAddress;

	var format = req.query.format || req.params.format || req.body.format || 'json';

	console.log( 'Got request for "' + v.url + '", cutoff=' + v.cutoff + ', threshold=' + v.threshold + ', format=' + format + ' from ' + ip );
	v.go( function() {
		if ( v.error ) {
			res.send( {
				error: v.error,
			}, 400 );
		} else {
			if ( 'svg' === format ) {
				var polygons = [];
				for( var tri of v.tris ) {
					var rgb = tri.r.toString( 16 ) + tri.g.toString( 16 ) + tri.b.toString( 16 );
					polygons.push( `<polygon points="${ tri.x0 },${ tri.y0 } ${ tri.x1 },${ tri.y1 } ${ tri.x2 },${ tri.y2 }" fill="#${ rgb }" />` );
				}

				var svg = `<svg viewBox="0 0 ${v.width} ${v.height}" xmlns="http://www.w3.org/2000/svg">${ polygons.join( '\n' ) }</svg>`;
				res.send( svg );
			} else {
				res.send( {
					url: v.url,
					cutoff: v.cutoff,
					width: v.width,
					height: v.height,
					tris: v.tris,
				} );
			}
		}
	} );
} );

var server = app.listen( 3000, function() {
	var host = server.address().address;
	var port = server.address().port;

	console.log( 'Example app listening at http://%s:%s', host, port );
} );

var jsonFormat = function( data ) {

};

var svgFormat = function( data ) {

};

var htmlFormat = function( data ) {

};