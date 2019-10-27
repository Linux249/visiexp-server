import fs from 'fs';
import morgan from 'morgan';
import cors from 'cors';
import express from 'express';
import socketIo from 'socket.io';
import pythonRoute from './routes/python/index';
import svmRoute from './routes/svm';
import imgPath from './config/imgPath';
import dataset from './routes/dataset';
import snapshots from './routes/snapshots';
import requestImage from './socket/requestImage';
import updateEmbedding from './socket/updateEmbedding';
import getNodes from './socket/getNodes';
import login from './routes/login';

const app = express();

// Socket.io
const io = socketIo({ pingTimeout: 4800000, pingInterval: 600000 });
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

// app.use('/api/v1/users', users)
// TODO add python in route name and change frontend usage
app.use('/api/v1/', login);
app.use('/api/v1/', pythonRoute);
app.use('/api/v1/svm/', svmRoute);
app.use('/api/v1/dataset/', dataset);
app.use('/api/v1/snapshots/', snapshots);
// app.use('/api', express.static('images'));// todo with imgPath outside the root folder not possible
// app.use('/', express.static('public'));
/* app.get('/images/!*', (req, res) => {
    console.log(req.path)
    res.send()
}) */

// / catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('URL Not Found');
    console.error(req.path)
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    console.error('Send Error vie JSON:');
    console.log(err);
    res.status(err.status || 500);
    res.json({
        error: {
            message: err.message,
            err,
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
