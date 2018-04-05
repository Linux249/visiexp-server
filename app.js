'use strict';
const express = require('express');
import fetch from 'node-fetch';
import { promisify } from 'util';
import sharp from 'sharp'
const path = require('path');
const cookieParser = require('cookie-parser');
const socket_io = require('socket.io');
const fs = require('fs'); // required for file serving
const app = express();
//import graphMock from './mock/graphSmall'
//import exampleGraph from './mock/example_graph'
import exampleNodes from './mock/exampleNodes';
//import { mergeLinksToNodes } from "./util/mergeLinksToNodes";
import { compareAndClean } from './util/compareAndClean';
import { getRandomColor } from './util/getRandomColor';
const kdbush = require('kdbush');

const clusterfck = require('tayden-clusterfck');
import buildTripel from './util/buildTripels';

const readFile = (path) =>
    new Promise((res, rej) => {
        fs.readFile(path, (err, data) => {
            if (err) {
                rej(err);
            } else {
                res(data);
            }
        });
    });


const colorTable = {
    0: '#ff3b14',
    1: '#1313ff',
    2: '#00ff0a',
    3: '#fffa00',
    4: '#ff00c0',
    5: '#04fff0',
    6: '#ff8685',
    7: '#858bff',
    9: '#7cff6d',
    10: '#fffe6f',
    11: '#ff6af1',
    12: '#85feff'
};


// Socket.io
const io = socket_io();
app.io = io;

const iconsFileHash = {};

const imagesFileHash = {};

let nodesStore = {};


/*app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))*/

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser())


//console.log(process.env.NODE_ENV === 'development')

app.use('/', express.static('public'));
//app.use('/api/v1/users', users)


// checking for allready used color

// set different image path for prod/dev mode
let imgPath = ""

if (process.env.NODE_ENV === 'development') {
    imgPath = `${__dirname}/images/`;
} else {
    imgPath = `/export/home/asanakoy/workspace/wikiart/images/`;
}

if(!fs.existsSync(imgPath)) new Error(`IMAGE PATH NOT EXISTS - ${imgPath}`)

io.on('connection', function (socket) {
    console.log('A user connected: ', socket.id);
    console.log('# sockets connected', io.engine.clientsCount);

    socket.on('requestImage', async function (data) {
        //console.log("requestImage")
        //console.log(data.name)
        const name = data.name;
        if (name) {
            try {
                let buffer;
                if (imagesFileHash[name]) {
                    buffer = imagesFileHash[name];
                } else {
                    const imagePath = `${imgPath}${name}.jpg`;
                    const file = await readFile(imagePath);
                    buffer = file.toString('base64');
                    imagesFileHash[name] = buffer;
                }
                socket.emit('receiveImage', {
                    name,
                    buffer,
                    index: data.index
                });
                console.log('Image is send: ' + name);
            }
            catch (err) {
                console.error(err);
            }

        } else {
            console.error('that shoud now happen - report please!!! (requests image withoutname');
        }


    });

    socket.on('updateNodes', async function (data) {
        console.log('updateNodes from client');
        //console.log(typeof data)
        //console.log(data)

        // first time data is empty (the client should send a empty object {})
        let updatedNodes = data; //|| {}
        ///if(typeof updatedNodes !== 'object') updatedNodes = JSON.parse(updatedNodes)
        //updatedNodes = JSON.parse(updatedNodes)

        // the nodes object for mutating data before sending
        let nodes = {};

        // the data, on the first time an empty object is
        // in production mode send to the server
        // in dev mode ...




        //build tripel from data
        console.log('buildTripel');
        const tripel = buildTripel(updatedNodes);
        console.log({ tripel });
        if (tripel) console.log(tripel);


        // before they should be cleaned and compared with maybe old data
        let time = process.hrtime();
        updatedNodes = compareAndClean(nodesStore, updatedNodes);
        let diff = process.hrtime(time);
        console.log(`CopareAndClean took ${diff[0] + diff[1] / 1e9} seconds`);


        if (process.env.NODE_ENV === 'development') {
            const count = 800; //Object.keys(exampleNodes).length //
            console.log('nodes generated from mock #: ' + count);

            const mockDataLength = Object.keys(exampleNodes).length;
            // generate dummy nodes
            for (let n = 0; n < count; n++) {
                const i = n % mockDataLength;
                nodes[n] = exampleNodes[i];
            }
        } else {
            console.log('get nodes from python');

            try {
                let time = process.hrtime();
                const res = await fetch('http://localhost:8000/nodes', {
                    method: 'POST',
                    header: { 'Content-type': 'application/json' },
                    body: JSON.stringify({
                        nodes: updatedNodes,
                        tripel
                    })
                });
                // there are only nodes comming back from here
                nodes = await res.json();
                let diff = process.hrtime(time);
                console.log(`getNodesFromPython took ${diff[0] + diff[1] / 1e9} seconds`);
            } catch (err) {
                console.error('error - get nodes from python - error');
                console.error(err);
            }
        }

        const nodeDataLength = Object.keys(nodes).length;

        // store data data for comparing later
        nodesStore = nodes;
        //console.log("this nodes are stored")
        //console.log(nodesStore)

        // add default cluster value (max cluster/zooming)
        /*Object.values(nodes)
            .forEach((node, i) => node.cluster = nodeDataLength);*/

        // starting the clustering
        console.log('start clustering');
        let timeCluster = process.hrtime();
        const points = Object.values(nodes)
            .map((n, i) => {
                const point = [n.x, n.y];   // array with properties is ugly!
                point.id = i;
                point.x = n.x;
                point.y = n.y;
                return point;
            });

        const kdtree = kdbush(points, n => n.x, n => n.y)

        //const smallBox = kdtree.range(-3, -3, 3, 3)//.map(id => nodes[id])
        //console.log(smallBox)
        //const middlebox = index.range(-10, -10, 10, 10).map(id => nodes[id])
        const hcCluster = clusterfck.hcluster(points);

        const clusters = [];
        for (let i = 1; i <= nodeDataLength; i += 10) clusters.push(hcCluster.clusters(i));

        clusters.forEach(cluster => {
            //console.log(`### ${cluster.length} Clusters:`)
            const countCluster = cluster.length;
            cluster.forEach((clust, i) => {
                const agentId = clust[0].id;
                // the user can change the amount of clusters
                if (!nodes[agentId].cluster) nodes[agentId].cluster = countCluster;
                //console.log(`${i}. first items has id: ${clust[0].id}`)
            });
        });
        let diffCluster = process.hrtime(timeCluster);
        console.log(`add cluster took ${diffCluster[0] + diffCluster[1] / 1e9} seconds`);

        // saving used colorKeys
        const colorKeyHash = {};

        // saving used colors for labels
        const colorHash = {};

        // doing everything for each node and send it back
        Promise.all(Object.values(nodes)
            .map(async (node, i) => {

                // that this is not inside !!! DONT FORGET THIS
                node.index = i;
                node.positives = [];
                node.negatives = [];
                //console.log(node.cluster); // TODO sometimes this is undefined - why and how to handle?

                // setting color based on label
                if (colorHash[node.label]) {
                    node.color = colorHash[node.label];
                } else {
                    const index = Object.keys(colorHash).length;
                    colorHash[node.label] = colorTable[index];
                    node.color = colorHash[node.label];
                }

                // get a unique color for each node as a key
                while (true) {
                    const colorKey = getRandomColor();
                    if (!colorKeyHash[colorKey]) {
                        node.colorKey = colorKey;
                        colorKeyHash[colorKey] = node;
                        break;
                    }
                }

                const iconPath = `${imgPath}${node.name}.jpg`;

                try {
                    if (iconsFileHash[node.name]) {
                        node.buffer = iconsFileHash[node.name];
                    } else {
                        const file = await readFile(iconPath);
                        let buffer = file.toString('base64');
                        /*buffer = await sharp(buffer)
                            .resize(200, 200)
                            .max()
                            .toFormat('jpeg')
                            .toBuffer()*/
                        iconsFileHash[node.name] = buffer;//.toString('base64')
                        node.buffer = buffer;

                    }
                    socket.emit('node', node);
                    //console.log('node is send: ' + node.name);
                } catch (err) {
                    console.log('Node was not send cause of missing image - how to handle?');
                    console.error(err);
                }


            })
        ).then(() => {
            console.log("all nodes send")
            //console.log(a)
            socket.emit("allNodesUpdated")
            socket.emit('updateKdtree', kdtree)
        })


        // sending back the labels and the colors
        socket.emit('updateLabels', colorHash);
        console.log('color labels send');


        /*
        // TODO convert data to graph again
        if(process.env.NODE_ENV === 'development') {
            console.log("get mock data")
            // console.log(Object.keys(nodesStore).length)

            // reset nodes
            nodes = {}
            // generate dummy nodes
            for(let i = 0; i < 10; i++) {
                nodes[i] = exampleNodes[i]

            }


            // empty in first time starting

            // saving used colors
            const colorKeyHash = {};

            const colorHash = {}

            Object.values(updatedNodes).forEach(node => {

                if(colorHash[node.label]) {
                    node.color = colorHash[node.label]
                } else {
                    const index = Object.keys(colorHash).length
                    colorHash[node.label] = colorTable[index]
                    node.color = colorHash[node.label]
                }


                while(true) {
                    const colorKey = getRandomColor();
                    if (!colorKeyHash[colorKey]) {
                        node.colorKey = colorKey;
                        colorKeyHash[colorKey] = node;
                        return;
                    }
                }
            });

            socket.emit("updateLabels", colorHash)

            nodesStore = updatedNodes

            for(let i = 0; i < Object.keys(updatedNodes).length; i++) {
                const node = updatedNodes[i]
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
                    try {
                        fs.readFile(iconPath, function(err, buf){
                            if(err) {
                                console.error(err)
                                return
                            }
                            //node.iconExists = true
                            const buffer = buf.toString('base64');
                            fileHash[node.name] = buffer
                            node.buffer =  buffer
                            socket.emit('node', node);
                            console.log('node is send: ' + node.name);

                        })
                    } catch (err) {
                        console.error(err)
                    }

                }
            }

        // PRODUCTION MODE
        }
        else {
            console.log("send data to python api")
            // console.log(Object.keys(nodesStore).length)

            //updatedNodes = compareAndClean(nodesStore, updatedNodes)



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
                            node.index = i

                            // add colorKey
                            while(true) {
                                const colorKey = getRandomColor();
                                if (!colorsKeyHash[colorKey]) {
                                    node.colorKey = colorKey;
                                    colorsKeyHash[colorKey] = node;
                                    break;
                                }
                            }

                            // add label color
                            if(colorHash[node.label]) {
                                node.color = colorHash[node.label]
                            } else {
                                const index = Object.keys(colorHash).length
                                colorHash[node.label] = colorTable[index]
                                node.color = colorHash[node.label]
                            }

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

                        socket.emit("updateLabels", colorHash)
                    })
            } catch(err) {
                console.error(err)
            }
        }
        */
    });

    socket.on('disconnect', function () {
        console.log('disconnect: ', socket.id);
    });
});

module.exports = app;

