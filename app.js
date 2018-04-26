
const express = require('express');

import fetch from 'node-fetch';
import { promisify } from 'util';
import sharp from 'sharp';

const path = require('path');
const cookieParser = require('cookie-parser');
const socket_io = require('socket.io');
const fs = require('fs');
// required for file serving
const app = express();
// import graphMock from './mock/graphSmall'
// import exampleGraph from './mock/example_graph'
// import exampleNodes from './mock/exampleNodes';
import exampleNodes from './mock/graph_3000';
// import { mergeLinksToNodes } from "./util/mergeLinksToNodes";
import { compareAndClean } from './util/compareAndClean';
import { getRandomColor } from './util/getRandomColor';

const kdbush = require('kdbush');

const clusterfck = require('tayden-clusterfck');

import buildTripel from './util/buildTripels';

const readFile = path =>
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
    0: '#e23511',
    1: '#1212d3',
    2: '#00cf09',
    3: '#9111ff',
    4: '#ff00c0',
    5: '#04fff0',
    6: '#ff8685',
    9: '#7cff6d',
    10: '#fffe6f',
    11: '#ff6af1',
    12: '#85feff',
};


// Socket.io
const io = socket_io({ pingTimeout: 120000, pingInterval: 30000 });
app.io = io;

const iconsFileHash = {};

const imagesFileHash = {};

let nodesStore = {};


/* app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false })) */

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser())


// console.log(process.env.NODE_ENV === 'development')

app.use('/', express.static('public'));
// app.use('/api/v1/users', users)

// set different image path for prod/dev mode
let imgPath = '';

if (process.env.NODE_ENV === 'development') {
    imgPath = `${__dirname}/images/images_3000/`;
} else {
    imgPath = '/export/home/asanakoy/workspace/wikiart/images/';
}

if (!fs.existsSync(imgPath)) new Error(`IMAGE PATH NOT EXISTS - ${imgPath}`);

io.sockets.on('connection', (socket) => {
    console.log('A user connected: ', socket.id);
    console.log('# sockets connected', io.engine.clientsCount);

    socket.on('requestImage', async (data) => {
        // console.log("requestImage")
        // console.log(data.name)
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
                    index: data.index,
                });
                console.log(`Image is send: ${name}`);
            } catch (err) {
                console.error(err);
            }
        } else {
            console.error('that shoud now happen - report please!!! (requests image withoutname');
        }
    });

    socket.on('updateNodes', async (data) => {
        console.log('updateNodes from client');
        // console.log(typeof data)
        // console.log(data)

        // first time data is empty (the client should send a empty object {})
        let updatedNodes = data; // || {}
        // /if(typeof updatedNodes !== 'object') updatedNodes = JSON.parse(updatedNodes)
        // updatedNodes = JSON.parse(updatedNodes)

        // the nodes object for mutating data before sending
        let nodes = {};

        // labels are scanned on serverside
        const labels = [];

        // build tripel from data
        console.log('buildTripel');
        const tripel = buildTripel(updatedNodes);
        console.log({ tripel });
        if (tripel) console.log(tripel);


        // before they should be cleaned and compared with maybe old data
        const time = process.hrtime();
        updatedNodes = compareAndClean(nodesStore, updatedNodes);
        const diff = process.hrtime(time);
        console.log(`CopareAndClean took ${diff[0] + diff[1] / 1e9} seconds`);


        if (process.env.NODE_ENV === 'development') {
            const mockDataLength = Object.keys(exampleNodes).length;

            const count = mockDataLength;
            console.log(`nodes generated from mock #: ${count}`);

            // generate dummy nodes
            for (let n = 0; n < count; n++) {
                const i = n % mockDataLength;
                nodes[n] = exampleNodes[i];
            }
        } else {
            console.log('get nodes from python');

            try {
                const time2 = process.hrtime();
                const res = await fetch('http://localhost:8000/nodes', {
                    method: 'POST',
                    header: { 'Content-type': 'application/json' },
                    body: JSON.stringify({
                        nodes: updatedNodes,
                        tripel,
                    }),
                });
                // there are only nodes comming back from here
                nodes = await res.json();
                const diff2 = process.hrtime(time2);
                console.log(`getNodesFromPython took ${diff2[0] + diff2[1] / 1e9} seconds`);
            } catch (err) {
                console.error('error - get nodes from python - error');
                console.error(err);
            }
        }

        const nodeDataLength = Object.keys(nodes).length;

        // store data data for comparing later
        nodesStore = nodes;
        // console.log("this nodes are stored")
        // console.log(nodesStore)

        // add default cluster value (max cluster/zooming)
        Object.values(nodes)
            .forEach((node, i) => node.cluster = nodeDataLength);

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

        // const kdtree = kdbush(points, n => n.x, n => n.y)
        // console.log("finish kdtree")

        //const smallBox = kdtree.range(-3, -3, 3, 3)//.map(id => nodes[id])
        //console.log(smallBox)
        //const middlebox = index.range(-10, -10, 10, 10).map(id => nodes[id])
        const hcCluster = clusterfck.hcluster(points);
        console.log("finish hccluster")

        const clusters = [];
        for (let i = 1; i <= nodeDataLength; i += 100) clusters.push(hcCluster.clusters(i));
        console.log("finish clusters")
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
        console.log(`end clustering: ${diffCluster[0] + diffCluster[1] / 1e9} seconds`);

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

                if (!node.cluster) node.cluster = nodeDataLength;

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

                // labels
                if (process.env.NODE_ENV === 'development') {
                    const n = node.index % 5;
                    node.labels = [];
                    for (let i = 1; i <= n; i++) node.labels.push(`label_${i}`);
                }

                node.labels.forEach(label => (labels.indexOf(label) === -1) && labels.push(label));


                const iconPath = `${imgPath}${node.name}.jpg`;

                try {
                    if (iconsFileHash[node.name]) {
                        node.buffer = iconsFileHash[node.name];
                    } else {
                        const file = await readFile(iconPath);
                        // let buffer = file//.toString('base64');
                        const buffer = await sharp(file)
                            .resize(50, 50)
                            .max()
                            .toFormat('jpg')
                            .toBuffer();
                        node.buffer = `data:image/jpg;base64,${buffer.toString('base64')}`; // save for faster reload TODO test with lots + large image
                        iconsFileHash[node.name] = node.buffer;
                    }

                    socket.compress(false).emit('node', node, (nodeId) => {
                        // console.log("nodecount callback")
                        // console.log(what)
                    });

                    if ((i + 1) % 100 === 0) {
                        console.log(`node is send: ${node.name} #${node.index}`);
                        socket.compress(false).emit('nodesCount', node.index);
                    }
                } catch (err) {
                    console.log('Node was not send cause of missing image - how to handle?');
                    console.error(err);
                }
            })).then(() => {
            console.log(`all ${Object.keys(nodes).length} nodes send`);
            // console.log(a)
            socket.emit('allNodesUpdated');

            // socket.emit('updateKdtree', kdtree)

            // sending back the labels and the colors
            socket.emit('updateLabels', labels);
            console.log('color labels send');
        });
    });

    socket.on('disconnect', (reason) => {
        console.log('disconnect: ', socket.id);
        console.log('# sockets connected', io.engine.clientsCount);
        console.log(`reason: ${reason}`);
    });
    socket.on('reconnection', (data) => {
        console.log(`recconected: ${socket.id}`);
        console.log(data);
    });
});

module.exports = app;

