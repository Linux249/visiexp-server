const express = require('express')
import fetch from 'node-fetch';
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
        //console.log("requestImage")
        //console.log(data.name)
        if(data.name) {
            const iconPath = `${__dirname}/images/${data.name}.jpg`
            fs.readFile(iconPath, function(err, buf){
                // TODO handle error
                socket.emit('receiveImage', {name: data.name, buffer: buf.toString('base64'), index: data.index});
            });
        }
    })

    socket.on('updateNodes', function(data){
        console.log("updateNodes from client")
        console.log(typeof data)
        console.log(data)
        let updatedNodes = data || {}
        if(typeof updatedNodes !== 'object') updatedNodes = JSON.parse(updatedNodes)
        //updatedNodes = JSON.parse(updatedNodes)



        // TODO convert data to graph again
        if(process.env.NODE_ENV === 'development') {
            console.log("get mock data")
            // console.log(Object.keys(nodesStore).length)

            updatedNodes = compareAndClean(nodesStore, updatedNodes)


            nodesStore = updatedNodes

            for(let i = 0; i < 100; i++) {
                const node = updatedNodes[i] || exampleGraph[i]
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
        } else if(false) {
            const spawn = require('child_process').spawn
            const py = spawn('python', ['pythonAdapter.py'])
            let dataFromPy = '' // datastring

            // read from python stream
            py.stdout.on('data', function(data){
                dataFromPy += data.toString()
            });

            // python output ends
            py.stdout.on('end', function(){
                console.log("nodes from python")
                console.log(dataFromPy)
                dataFromPy = dataFromPy.split('$$$')[1]
                console.log(dataFromPy)
                let nodes = JSON.parse(dataFromPy)
                console.log(nodes)
                console.log(typeof nodes)

                // check if the updatedNodes are not empty what they are on first time
                if(Object.keys(nodesStore).length) {
                    nodes = compareAndClean(nodesStore, nodes)
                }

                // store nodes from python
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



            //py.stdin.write(JSON.stringify(updatedNodes));
            py.stdin.end();

        } else if (false) {
            console.log("send data to python socket")
        } else {
            console.log("send data to python api")
            // console.log(Object.keys(nodesStore).length)

            updatedNodes = compareAndClean(nodesStore, updatedNodes)

            try {



                fetch('http://localhost:8000/nodes', {
                    method: 'POST',
                    header: { 'Content-type': 'application/json'},
                    body: JSON.stringify(updatedNodes)
                })
                    .then(res => res.json())
                    .then(data => {
                        console.log("nodes received from python")
                        console.log(data)
                        const nodes = data
                        // check if the updatedNodes are not empty what they are on first time
                        // store nodes from python
                        nodesStore = nodes

                        Object.values(nodes).map((node, i) =>  {
                            node.index = i  // TODO remove
                            const iconPath = `${__dirname}/icons/${node.name}.jpg`
                            fs.readFile(iconPath, function(err, buf){
                                if(err) console.log(err)
                                else {
                                    // TODO file hash
                                    // TODO handle error
                                    node.buffer =  buf.toString('base64');
                                    console.log('node is send: ' + node.name);
                                    socket.emit('node', node);
                                }
                            });
                        })
                    })
            } catch(err) {
                console.error(err)
            }

        }

    })

    socket.on('disconnect', function() {
        console.log("disconnect: ", socket.id);
    });
});

module.exports = app;

