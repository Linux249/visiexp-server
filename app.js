const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const socket_io    = require( "socket.io" );
const users = require('./routes/users')
const fs = require('fs'); // required for file serving
const app = express()
import graphMock from './mock/graphSmall'
import { mergeLinksToNodes } from "./util/mergeLinksToNodes";
// Socket.io
const io = socket_io();
app.io = io;

//


//console.log(nodes)


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())


app.use("/", express.static("public"))
//app.use('/api/v1/users', users)

/*
app.use('/python', (req, res) => {
    const spawn = require('child_process').spawn
    const py = spawn('python', ['pythonAdapter.py'])
    const dataFromNode = graph
    let dataFromPy = '' // datastring

    py.stdout.on('data', function(data){
        const string = data.toString()
        console.log(string)
        dataFromPy += string
    });

    py.stdout.on('end', function(){
        console.log('Sum of numbers=');
        console.log(typeof dataFromPy);
        console.log(JSON.parse(dataFromPy));
        res.send(dataFromPy)
    });

    py.stdin.write(JSON.stringify(dataFromNode));
    py.stdin.end();
})

*/

// socket.io events

io.on( "connection", function( socket )
{
    console.log( "A user connected: ", socket.id );
    console.log('# sockets connected', io.engine.clientsCount);
    //console.log(socket)
    /*for(let i = 0; i<10; i++) {
        const node = nodes[i]
        node.index = i
        const iconPath = `${__dirname}/icons/${node.name}.jpg`
        fs.readFile(iconPath, function(err, buf){
            // TODO handle error
            node.iconExists = true
            node.buffer =  buf.toString('base64');
            socket.emit('node', node);
            console.log('node is send: ' + node.name);
        });
    }
    */
    socket.on("requestImage", function(data) {
        console.log("requestImage")
        console.log(data.name)
        if(data.name) {
            const iconPath = `${__dirname}/images/${data.name}.jpg`
            fs.readFile(iconPath, function(err, buf){
                // TODO handle error
                socket.emit('receiveImage', {name: data.name, buffer: buf.toString('base64'), index: data.index});
            });
        }
    })

    socket.on('updateNodes', function(data){
        console.log("updateNodes")
        console.log(data)

        // TODO convert data to graph again

        const spawn = require('child_process').spawn
        const py = spawn('python', ['pythonAdapter.py'])
        let dataFromPy = '' // datastring

        py.stdout.on('data', function(data){
            const string = data.toString()
            //console.log(string)
            dataFromPy += string
        });


        py.stdout.on('end', function(){
            const graph = JSON.parse(dataFromPy)
            console.log(graph)
            console.log(typeof graph)
            console.log((graph))
            // there is a response from the python script
            if(Object.keys(graph).length) {
                //TODO convert ????
                const nodes = mergeLinksToNodes(graph.nodes, graph.links)
                nodes.map((node, i) =>  {
                    node.index = i
                    const iconPath = `${__dirname}/icons/${node.name}.jpg`
                    fs.readFile(iconPath, function(err, buf){
                        // TODO handle error
                        node.iconExists = true
                        node.buffer =  buf.toString('base64');
                        socket.emit('node', node);
                        console.log('node is send: ' + node.name);
                    });
                })
            } else {
                const nodes = mergeLinksToNodes(graphMock.nodes, graphMock.links)
                for(let i = 0; i < 200; i++) {
                    const node = nodes[i]
                    node.index = i
                    const iconPath = `${__dirname}/icons/${node.name}.jpg`
                    fs.readFile(iconPath, function(err, buf){
                        // TODO handle error
                        node.iconExists = true
                        node.buffer =  buf.toString('base64');
                        socket.emit('node', node);
                        console.log('node is send: ' + node.name);
                    });
                }
            }

        });

        py.stdin.write(JSON.stringify(data));
        py.stdin.end();

    })

    socket.on('disconnect', function() {
        console.log("disconnect: ", socket.id);
    });
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
