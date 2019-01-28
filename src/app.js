import fs from 'fs';
// import { promises as fsP } from 'fs';
// import path from 'path';
// import fetch from 'node-fetch';
// import sharp from 'sharp';
import morgan from 'morgan';
import cors from 'cors';
import express from 'express';
import socketIo from 'socket.io';
// import clusterfck from 'tayden-clusterfck';
// import { compareAndClean } from './util/compareAndClean';
// import { getRandomColor } from './util/getRandomColor';
import pythonRoute from './routes/python/index';
import svmRoute from './routes/svm';
// import { colorTable } from './config/colors';
// import { imgSizes } from './config/imgSizes';
import imgPath from './config/imgPath';
import dataset from './routes/dataset';
// import { mockDataLength } from './config/env';
// import { buildLabels } from './util/buildLabels';
// import graphMock from './mock/graphSmall'
// import exampleGraph from './mock/example_graph'
// import exampleNodes from './mock/exampleNodes';
// import { mergeLinksToNodes } from "./util/mergeLinksToNodes";
// import buildTripel from './util/buildTripels';
// import { dataSet } from './config/datasets';
// import { pythonApi } from './config/pythonApi';
import requestImage from './socket/requestImage';
import updateEmbedding from './socket/updateEmbedding';
import getNodes from './socket/getNodes';
// import kdbush from 'kdbush';
// const kde2d = require('@stdlib/stdlib/lib/node_modules/@stdlib/stats/kde2d');


// const path = require('path');
// required for file serving
const app = express();


/*
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
*/


// TODO: Read dataset and check if all images are created corectly - otherwise stop app and tell user to resize pics
// TODO resize will work off all datasets
// loop through each dataset and check
// 1. folder structure is similar to imageSizes
/* console.log('Check if all images are available for each dataset');
dataSet.map(async (set) => {
    try {
        // test if folder path exists
        // set.imgPath
        // Error: Path in dataset incorrect

        // count all images in main dir
        const files = await fsP.readdir(set.imgPath);
        const imgCount = files.length - imgSizes.length;
        console.log(`Path: ${set.imgPath} #${imgCount}`);

        // check all subdir
        imgSizes.map(async (size) => {
            try {
                const subDir = path.join(set.imgPath, size.toString());
                const subDirFiles = await fsP.readdir(subDir);
                const subDirCount = subDirFiles.length - imgSizes.length;
                console.log(`Path: ${subDir} #${subDirCount}`);
            } catch (e) {
                console.error(e);
                console.error("Fehler beim Starten der Anwendung: bitte Bildpfad überprüfen oder 'npm run resize' ausführen");
                process.exit(0)
            }
            // test if subDir exists
        });
    } catch (e) {
        console.error(e);
        console.error("Fehler beim Starten der Anwendung: bitte Bildpfad überprüfen oder 'npm run resize' ausführen");
        process.exit(0)
    }
}); */

// Socket.io
const io = socketIo({ pingTimeout: 1200000, pingInterval: 300000 });
app.io = io;

// const scaledPicsHash = {}; // scaled images in new archetecture 2

// const stringImgHash = {};       // normal (50,50) images in old architecture

// let nodesStore = {};

// let clusterStore = null;


// set different image path for prod/dev mode

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
// app.use('/api', express.static('images'));// todo with imgPath outside the root folder not possible
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


    socket.on('requestImage', requestImage(socket));

    socket.on('updateEmbedding', updateEmbedding(socket));

    socket.on('getNodes', getNodes(socket));

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

