const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const socket_io    = require( "socket.io" );
const fs = require('fs'); // required for file serving
const app = express()
//import graphMock from './mock/graphSmall'
import exampleGraph from './mock/example_graph'
//import { mergeLinksToNodes } from "./util/mergeLinksToNodes";
import { compareAndClean } from "./util/compareAndClean";

//const mockedNodes = mergeLinksToNodes(graphMock.nodes, graphMock.links)

// Socket.io
const io = socket_io();
app.io = io;

const fileHash = {}

let nodesStore = {}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
//app.use(cookieParser())


//console.log(process.env.NODE_ENV === 'development')

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
        let updatedNodes = data || {}
        console.log(data)

        // save nodes for comparing
        if(Object.keys(updatedNodes).length) nodesStore = updatedNodes

        // TODO convert data to graph again
        if(process.env.NODE_ENV === 'development') {
            for(let i = 0; i < 100; i++) {
                const node = exampleGraph[i]
                node.index = i      // !important -
                if(!node.x && !node.y) {
                    node.x = Math.random()*40 -20
                    node.y = Math.random()*40 -20
                }

                const iconPath = `${__dirname}/icons/${node.name}.jpg`

                if(fileHash[node.name]) {
                    node.buffer = fileHash[node.name]
                    socket.emit('node', node);
                } else {
                    fs.readFile(iconPath, function(err, buf){
                        // TODO handle error
                        //node.iconExists = true
                        const buffer = buf.toString('base64');
                        fileHash[node.name] = buffer
                        node.buffer =  buffer
                        socket.emit('node', node);
                        console.log('node is send: ' + node.name);

                        if(!node.links) {
                            console.log(node)
                            throw new Error()
                        }
                    });
                }
            }

        // PRODUCTION MODE
        } else {
            const spawn = require('child_process').spawn
            const py = spawn('python', ['pythonAdapter.py'])
            let dataFromPy = '' // datastring

            // read from python stream
            py.stdout.on('data', function(data){
                dataFromPy += data.toString()
            });

            // python output ends
            py.stdout.on('end', function(){
                const nodes = JSON.parse(dataFromPy)
                console.log("nodes from python")
                console.log(nodes)
                console.log(typeof nodes)

                nodesStore = nodes

                Object.values(nodes).map((node, i) =>  {
                    node.index = i  // TODO remove
                    const iconPath = `${__dirname}/icons/${node.name}.jpg`
                    fs.readFile(iconPath, function(err, buf){

                        // TODO file hash
                        // TODO handle error
                        node.buffer =  buf.toString('base64');
                        console.log('node is send: ' + node.name);
                        socket.emit('node', node);
                    });
                })

            });

            updatedNodes = compareAndClean(nodesStore, updatedNodes)

            py.stdin.write(JSON.stringify(updatedNodes));
            py.stdin.end();

        }

    })

    socket.on('disconnect', function() {
        console.log("disconnect: ", socket.id);
    });
});

module.exports = app;

