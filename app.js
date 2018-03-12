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
    for(let i = 0; i<100; i++) {
        const node = nodes[i]
        const iconPath = `${__dirname}/icons/${node.name}.jpg`
        fs.readFile(iconPath, function(err, buf){
            // TODO handle error
            node.iconExists = true
            node.buffer =  buf.toString('base64');
            socket.emit('node', node);
            console.log('node is send: ' + node.name);
        });
    }

    socket.on("requestImage", function(imageName) {
        console.log("requestImage")
        console.log(imageName)
        if(imageName) {
            const iconPath = `${__dirname}/images/${imageName}.jpg`
            fs.readFile(iconPath, function(err, buf){
                // TODO handle error
                socket.emit('receiveImage', {name: imageName, buffer: buf.toString('base64')});
            });
        }
    })
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
