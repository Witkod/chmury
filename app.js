var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var neo4j = require('neo4j-driver');
var cors = require('cors')

const actorApi = require('./actor');
const movieApi = require('./movie');



var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

// var dr = neo4j.driver('https://hobby-jgiciegnhcgngbkejagpohel.dbs.graphenedb.com:24780/db/data/', neo4j.auth.basic('user', 'b.0d718gbul7xm.JlzdcqX7VyssYtIc'));

const USER_PASS = `b.fs2rKZ2XCYCA.wRTuwOvwWxj8JJxM`;

var drriver = neo4j.driver('bolt://hobby-jgiciegnhcgngbkejagpohel.dbs.graphenedb.com:24787', neo4j.auth.basic('user2',USER_PASS), {encrypted: true});
var session = drriver.session();


app.use(cors());

app.use('/',express.static('./dist') );



app.post('/addActor', async function(req, res){
    const newActor = await actorApi.addActor(req.body, session);

    console.log('new', newActor);

    res.json(newActor);

    
})

app.post('/addMovie', async function(req, res){
    const newMovie = await movieApi.addMovie(req.body, session);

    res.json(newMovie);

    
})

app.get('/actors', async function(req, res){
    const response = await session.run( `MATCH (actor:Actor) RETURN actor`);


    const recordsJson = response.records.map(record => record.toObject().actor)
    // const newActor = await addActor(req.body);
    // MATCH (n1)-[r]->(n2) RETURN r, n1, n2 LIMIT 25
    // console.log('new', newActor);

    res.json(recordsJson);

    
})

app.get('/actor/:name', async function(req, res){
    const actor = await actorApi.getActor(req.param('name'), session);
   

    res.json(actor);

    
})

app.get('/movies', async function(req, res){
    const response = await session.run( `MATCH (movie:Movie) RETURN movie`);

    const recordsJson = response.records.map(record => record.toObject().movie)

    res.json(recordsJson);
})



app.post('/connectActor', async function(req, res){
    const {actorName, movieTitle} = req.body;

    await session.run( `MATCH (actor:Actor) WHERE actor.name = '${actorName}' MATCH (movie:Movie) WHERE movie.title = '${movieTitle}' CREATE (actor)-[:PlaysIn]->(movie)`);


    
    // MATCH (n1)-[r]->(n2) RETURN r, n1, n2 LIMIT 25
    console.log('done');

    res.json({result: 'relationCreated'});

    
})

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log('Server started on port 3000');
});