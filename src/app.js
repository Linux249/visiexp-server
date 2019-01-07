import fs from 'fs';
import fetch from 'node-fetch';
import sharp from 'sharp';
import morgan from 'morgan';
import cors from 'cors';
import express from 'express';
import socketIo from 'socket.io';
import clusterfck from 'tayden-clusterfck';
import { compareAndClean } from './util/compareAndClean';
import { getRandomColor } from './util/getRandomColor';
import pythonRoute from './routes/python/index';
import svmRoute from './routes/svm';
import { colorTable } from './config/colors';
import { imgSizes } from './config/imgSizes';
import dataset from './routes/dataset';
import { mockDataLength, pythonApi } from './config/env';
import { buildLabels } from './util/buildLabels';
// import graphMock from './mock/graphSmall'
// import exampleGraph from './mock/example_graph'
// import exampleNodes from './mock/exampleNodes';
// import { mergeLinksToNodes } from "./util/mergeLinksToNodes";
// import buildTripel from './util/buildTripels';
// import { dataSet } from './config/datasets';
// import kdbush from 'kdbush';
// const kde2d = require('@stdlib/stdlib/lib/node_modules/@stdlib/stats/kde2d');
const exampleNodes = (process.env.NODE_ENV === 'development') ? require('../mock/2582_sub_wikiarts').default : {};

// const path = require('path');
// required for file serving
const app = express();


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


// Socket.io
const io = socketIo({ pingTimeout: 1200000, pingInterval: 300000 });
app.io = io;

const scaledPicsHash = {}; // scaled images in new archetecture 2

// const stringImgHash = {};       // normal (50,50) images in old architecture

const largeFileHash = {}; // the detailed images witch are loaded if needen

// let nodesStore = {};

// let clusterStore = null;


// set different image path for prod/dev mode
let imgPath = '';

if (process.env.NODE_ENV === 'development') {
    imgPath = `${__dirname}/../images/2582_sub_wikiarts/`;
    // imgPath = `/export/home/kschwarz/Documents/Data/CUB_200_2011/images_nofolders/`;
} else {
    imgPath = '/export/home/kschwarz/Documents/Data/Wikiart_artist49_images/';
}

if (process.env.NODE_ENV === 'development') {
    const timeFillImgDataCach = process.hrtime();
    // resizePics(imgPath, [110, 120, 130, 140, 150], exampleNodes)

    // fill scaledPicsHash

    console.time('fillImgDataCach');
    console.log(`fillImgDataCach of ${mockDataLength} files`);
    console.log(exampleNodes)

    // generate dummy nodes
    for (let n = 0; n < mockDataLength; n += 1) {
        const i = n % mockDataLength;
        const node = exampleNodes[i];
        const pics = {};
        // TODO prüfen ob sich bilder auch als raw() abspeichern lassen
        Promise.all(imgSizes.map((size) => {
            const path = `${imgPath}${size}/${node.name}.png`;

            return sharp(path)
                .raw()
                .toBuffer({ resolveWithObject: true })
                .then(pic => pics[size] = pic)
                .catch(e => {
                    console.error(e)
                    console.log({path})
                });
        })).then(() => {
            if (!(n % 100)) {
                const diffFillImgDataCach = process.hrtime(timeFillImgDataCach);
                console.log(`${n}/${mockDataLength} pics cached took: ${diffFillImgDataCach[0] + diffFillImgDataCach[1] / 1e9}s`);
            }
            scaledPicsHash[node.name] = pics;
            if (n + 1 === mockDataLength) console.log('fillImgDataCach end');
        });

        //  }));

        // const path = `${imgPath}${node.name}.jpg`;
        // const pic = sharp(path);
        // Promise.all(imgSizes.map(async (size) => {
        //     // const file = await readFile(iconPath);
        //     pics[size] = await pic
        //         .resize(size, size)
        //         .max()
        //         .overlayWith(
        //             Buffer.alloc(4),
        //             { tile: true, raw: { width: 1, height: 1, channels: 4 } },
        //         )
        //         .raw()
        //         .toBuffer({ resolveWithObject: true });
        // })).then(() => {
        //     if (!(n % 100)) {
        //         const diffFillImgDataCach = process.hrtime(timeFillImgDataCach);
        //         console.log(`${n}/${mockDataLength} pics cached took: ${diffFillImgDataCach[0] + diffFillImgDataCach[1] / 1e9}s`);
        //     }
        //     scaledPicsHash[node.name] = pics;
        //     if (n + 1 === mockDataLength) console.log('fillImgDataCach end');
        // });
    }
}

/* app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false })) */

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: false, limit: '5mb' }));
app.use(morgan('dev'));
app.use(cors());


// console.log(process.env.NODE_ENV === 'development')


// app.use('/api/v1/users', users)
// TODO add python in route name and change frontend usage
app.use('/api/v1/', pythonRoute);
app.use('/api/v1/svm/', svmRoute);
app.use('/api/v1/dataset/', dataset);
app.use('/api', express.static('images'));
app.use('/', express.static('public'));
/* app.get('/images/!*', (req, res) => {
    console.log(req.path)
    res.send()
}) */

// / catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('URL Not Found');
    err.status = 404;
    next(err);
});

app.use((err, req, res) => {
    res.status(err.status || 500);
    res.json({
        errors: {
            message: err.message,
            error: {},
        },
    });
});

if (!fs.existsSync(imgPath)) throw Error(`IMAGE PATH NOT EXISTS - ${imgPath}`);

io.sockets.on('connection', (socket) => {
    console.log('A user connected: ', socket.id);
    console.log('# sockets connected', io.engine.clientsCount);


    socket.on('requestImage', async (data) => {
        // console.log("requestImage")
        // console.log(data.name)
        const { name } = data;
        if (name) {
            try {
                let buffer;
                if (largeFileHash[name]) {
                    buffer = largeFileHash[name];
                } else {
                    const imagePath = `${imgPath}${name}.jpg`;
                    const file = await readFile(imagePath);
                    buffer = file.toString('base64');
                    largeFileHash[name] = buffer;
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
        console.log('updateNodes');
        // console.log(data);

        let updatedNodes = {};

        // HINT The data should never by empty - inital nodes comes from getNodes
        const { nodes } = data;
        // categories can but don't have to change
        let categories;

        if (process.env.NODE_ENV === 'development') {
            // TODO generate random x, y for new nodes
            const l = Object.keys(nodes).length;
            Object.keys(nodes).forEach((i) => {
                const node = nodes[i];
                if (i > 0 && i < l - 1) {
                    node.x += Math.random() >= 0.5 ? node.x * 0.1 : -node.x * 0.1;
                    node.y += Math.random() >= 0.5 ? node.y * 0.1 : -node.y * 0.1;
                }
                updatedNodes[i] = node;
            });
            // just test if categories change will happen correctly
            categories = ['kat1', 'kat2', 'kat3'];
        } else {
            try {
                const time2 = process.hrtime();
                const res = await fetch(`http://${pythonApi}:8000/nodes`, {
                    method: 'POST',
                    header: { 'Content-type': 'application/json' },
                    body: JSON.stringify({ nodes }),
                });
                // there are only nodes comming back from here
                const result = await res.json();
                updatedNodes = result.nodes;
                // TODO build
                categories = data.categories;
                const diff2 = process.hrtime(time2);
                console.log(`getNodesFromPython took ${diff2[0] + diff2[1] / 1e9} seconds`);
            } catch (err) {
                console.error('error - get nodes from python - error');
                console.error(err);
            }
        }

        // build labels - labels are scanned on serverside
        const labels = categories ? buildLabels(categories, nodes) : undefined;

        // if new categories comes from server than send new labels back
        // TODO NAMING categories suits mutch bedder maybe?
        if (labels) socket.emit('updateLabels', labels);

        socket.emit('updateEmbedding', { nodes: updatedNodes }, (confirm) => {
            console.log(confirm);
        });
    });

    socket.on('getNodes', async (data) => {
        console.log('updateNodes from client');
        // console.log(typeof data)
        // console.log(data)

        // first time data is empty (the client should send a empty object {})
        let updatedNodes = data.nodes; // || {}
        // /if(typeof updatedNodes !== 'object') updatedNodes = JSON.parse(updatedNodes)
        // updatedNodes = JSON.parse(updatedNodes)

        // the nodes object for mutating data before sending
        let nodes = {};
        let categories = [];

        // build tripel from data
        // console.log('buildTripel');
        // const tripel = buildTripel(updatedNodes);
        // console.log({ tripel });
        // if (tripel) console.log(tripel);


        // before they should be cleaned and compared with maybe old data
        const time = process.hrtime();
        updatedNodes = compareAndClean({}, updatedNodes);
        const diff = process.hrtime(time);
        console.log(`CopareAndClean took ${diff[0] + diff[1] / 1e9} seconds`);


        if (process.env.NODE_ENV === 'development') {
            // const mockDataLength = 50 //Object.keys(exampleNodes).length;

            console.log(`nodes generated from mock #: ${mockDataLength}`);

            // generate dummy nodes
            for (let n = 0; n < mockDataLength; n += 1) {
                const i = n % mockDataLength;
                nodes[n] = exampleNodes[i];
            }

            // dummy categorys
            categories = ['kat1', 'kat2', 'kat3'];
        } else {
            console.log('get nodes from python');

            try {
                const time2 = process.hrtime();
                const res = await fetch(`http://${pythonApi}:8000/nodes`, {
                    method: 'POST',
                    header: { 'Content-type': 'application/json' },
                    body: JSON.stringify({
                        nodes: updatedNodes,
                        // tripel,
                    }),
                });
                // there are only nodes comming back from here
                const data = await res.json();
                nodes = data.nodes;
                categories = data.categories;
                const diff2 = process.hrtime(time2);
                console.log(`getNodesFromPython took ${diff2[0] + diff2[1] / 1e9} seconds`);
            } catch (err) {
                console.error('error - get nodes from python - error');
                console.error(err);
            }
        }


        const nodeDataLength = Object.keys(nodes).length;
        socket.emit('totalNodesCount', nodeDataLength);

        // labels
        if (process.env.NODE_ENV === 'development') {
            const n = categories.length;
            Object.values(nodes).forEach((node) => {
                node.labels = [];
                for (let i = 0; i < n; i++) node.labels.push(Math.random() >= 0.5 ? `${categories[i]}_label_${i}` : null);
            });
        }


        // build labels - labels are scanned on serverside
        const labels = buildLabels(categories, nodes);


        // store data data for comparing later
        // nodesStore = nodes;
        // console.log("this nodes are stored")
        // console.log(nodesStore)

        // add default cluster value (max cluster/zooming)
        Object.values(nodes).forEach(node => node.cluster = nodeDataLength);

        // starting the clustering
        console.log('start clustering');
        const timeCluster = process.hrtime();
        const points = Object.values(nodes)
            .map((n, i) => {
                const point = [n.x, n.y]; // array with properties is ugly!
                point.id = i;
                point.x = n.x;
                point.y = n.y;
                return point;
            });

        //const kdtree = kdbush(points, n => n.x, n => n.y)
        //console.log("finish kdtree")

            // const smallBox = kdtree.range(-3, -3, 3, 3)//.map(id => nodes[id])
            // console.log(smallBox)
            // const middlebox = index.range(-10, -10, 10, 10).map(id => nodes[id])
        const hcCluster = clusterfck.hcluster(points);
        console.log('finish hccluster');

        const zoomStages = 20;
        const nodesPerStage = Math.round(nodeDataLength / zoomStages) || 1; // small #nodes can result to 0
        // loop trough the zoomstages
        for (let i = nodesPerStage; i <= nodeDataLength; i += nodesPerStage) {
            hcCluster.clusters(i).forEach((cluster) => {
                // TODO why the first one? this is realy bad!
                const agentId = cluster[0].id; // first value in cluster is represent
                if (nodes[agentId].cluster > i) nodes[agentId].cluster = i;
            });
            console.log(`Building ${i} clusters finished`);
        }
        console.log('finish clusters');

        const diffCluster = process.hrtime(timeCluster);
        console.log(`end clustering: ${diffCluster[0] + diffCluster[1] / 1e9} seconds`);
        // clusterStore = nodes;
        // }

        /*
            CLUSTERING - kmeans performance test
         */
        const points2 = Object.values(nodes)
            .map((n, i) => {
                const point = [n.x, n.y]; // array with properties is ugly!
                return point;
            });

        console.log('start clustering kmeans');
        console.time('cluster kmeans')
        const timeCluster2 = process.hrtime();



        const cluster2 = clusterfck.kmeans(points2, 20);



        const diffCluster2 = process.hrtime(timeCluster2);
        console.timeEnd('cluster kmeans')
        console.log(`end clustering kmeans: ${diffCluster2[0] + (diffCluster2[1] / 1e9)} seconds`);


        /*
       // calc kernel density estimation
       const timeKde = process.hrtime();


       const x = [];
       const y = [];
       Object.values(nodes).forEach((node) => {
           x.push(node.x);
           y.push(node.y);
       });

       const out = kde2d(x, y, {
           xMin: -20,
           xMax: 20,
           yMin: -20,
           yMax: 20,
           // 'h': [ 0.01, 255 ], // bandwith - schätze damit kann man die range der dichte angeben
           // 'n': 5 // default 25 - was ist das
       });
        // console.log(out)
        // console.log(out.z)


        const diffKde = process.hrtime(timeKde);
        console.log(`end kde: ${diffKde[0] + diffKde[1] / 1e9} seconds`);
        */

        // saving used colorKeys
        const colorKeyHash = {};

        // saving used colors for label
        const colorHash = {};

        const timeStartSendNodes = process.hrtime();

        // doing everything for each node and send it back
        Promise.all(Object.values(nodes).map(async (node, index) => {
            // that this is not inside !!! DONT FORGET THIS
            // console.time('map' + i)
            // console.log("start")
            node.index = index;
            // node.positives = [];
            // node.negatives = [];

            // catch if there is no rank
            if (!node.rank && node.rank !== 0) node.rank = -1;

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


            // TODO das muss noch implementiert werden
            if (!node.clique) node.clique = [1, 2, 3];
            if (!node.rank) node.rank = 0.5;

            const iconPath = `${imgPath}${node.name}.jpg`;

            node.pics = {};
            node.cached = false; // this is interesting while performance messearuing
            node.url = `/images_3000/${node.name}.jpg`;

            try {
                if (scaledPicsHash[node.name]) {
                    // node.buffer = iconsFileHash[node.name].buffer;
                    node.pics = scaledPicsHash[node.name];
                    // node.buffer = stringImgHash[node.name];
                    nodes.cached = true;
                } else {
                    // const file = await readFile(iconPath);
                    // console.log(file);
                    // const buffer = await sharp(file)
                    //     .resize(50, 50)
                    //     .max()
                    //     .toFormat('jpg')
                    //     .toBuffer();
                    // node.buffer = `data:image/jpg;base64,${buffer.toString('base64')}`;
                    // stringImgHash[node.name] = node.buffer; // save for faster reload TODO test with lots + large image

                    // new architecture 2

                    await Promise.all(imgSizes.map(async (size) => {
                        node.pics[size] = await sharp(iconPath)
                            .resize(size, size)
                            .max()
                            .overlayWith(
                                Buffer.alloc(4),
                                { tile: true, raw: { width: 1, height: 1, channels: 4 } },
                            )
                            .raw()
                            .toBuffer({ resolveWithObject: true });
                    }));
                    scaledPicsHash[node.name] = node.pics;

                    // new archetecture 1
                    /* await Promise.all(arr.map(async (size) => {
                            const buffer = await sharp(file)
                                .resize(size, size)
                                .max()
                                .toFormat('jpg')
                                .toBuffer();
                            node.pics[size] = `data:image/jpg;base64,${buffer.toString('base64')}`; // save for faster reload TODO test with lots + large image
                        })); */
                }

                socket.compress(false).emit('node', node);
                // console.timeEnd('map' + i)
                // if(!node.pics) console.log("HJEQWERIHWQR")

                if ((index + 1) % 100 === 0) {
                    const diffStartSendNodes = process.hrtime(timeStartSendNodes);
                    console.log(`node is send: ${node.name} #${node.index} after: ${diffStartSendNodes[0] + diffStartSendNodes[1] / 1e9}s`);
                    // socket.compress(false).emit('nodesCount', node.index);
                }
            } catch (err) {
                console.log('Node was not send cause of missing image - how to handle?');
                console.error(err);
                console.log(node.index);
            }
        })).then(() => {
            const diffStartSendNodes = process.hrtime(timeStartSendNodes);
            console.log(`all ${nodeDataLength} nodes send after: ${diffStartSendNodes[0] + diffStartSendNodes[1] / 1e9}s`);
            // console.log(a)
            socket.emit('allNodesSend');

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

