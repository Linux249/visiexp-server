const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const socket_io    = require( "socket.io" );
const users = require('./routes/users')
const fs = require('fs'); // required for file serving
const app = express()
import graph from './mock/graphSmall'
import { mergeLinksToNodes } from "./util/mergeLinksToNodes";
// Socket.io
const io = socket_io();
app.io = io;

//

const nodes = mergeLinksToNodes(graph.nodes, graph.links)
console.log(nodes)


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())

app.use('/api/v1/users', users)


// socket.io events

io.on( "connection", function( socket )
{
    console.log( "A user connected" );
    //console.log(socket)
    for(let i = 0; i<3; i++) {
        const node = nodes[i]
        const imagePath = `${__dirname}/icons/${node.name}.jpg`
        fs.readFile(imagePath, function(err, buf){
            node.image = true
            node.buffer =  buf.toString('base64'),
            socket.emit('image', node);
            console.log('image file is send: ' + node.name);
        });
    }
});

module.exports = app;

// Or a shorter version of previous lines:
//
//    var app = require( "express"   )();
//    var io  = app.io = require( "socket.io" )();
//    io.on( "connection", function( socket ) {
//        console.log( "A user connected" );
//    });
//    module.exports = app;
