import { Router } from 'express';
import fetch from 'node-fetch';
import { compareAndClean } from '../../util/compareAndClean';
import { pythonApi } from '../../config/env';
import buildLabels from '../../util/buildLabels';

const router = Router();

router.post('/updateLabels', async (req, res, next) => {
    console.log('updateLabels');
    const nodes = compareAndClean({}, req.body.nodes);
    console.log(nodes);

    if (process.env.NODE_ENV === 'development') {
        res.status = 200;
        res.send();
    } else {
        console.log('send updateLabels to python');
        try {
            const time = process.hrtime();
            const data = await fetch(`http://${pythonApi}:8000/updateLabels`, {
                method: 'POST',
                header: { 'Content-type': 'application/json' },
                body: JSON.stringify({ nodes }),
            }).then(response => response.json());
            const diff = process.hrtime(time);
            res.send();
            console.log(`updateLabels from python took ${diff[0] + diff[1] / 1e9} seconds`);
        } catch (err) {
            console.error('error - updateLabels python error');
            console.error(err);
            next(err);
        }
    }
});

// POST TODO URL
router.post('/updateEmbedding', async (req, res, next) => {
    console.log('POST /updateEmbedding');
    const { body } = req;
    const { socket_id } = body;

    if (!socket_id) return next(new Error('No socket connection'));

    let labels;
    if (body.categories) labels = buildLabels(body.categories, body.nodes);
    const socket = req.app.io.sockets.sockets[socket_id];
    if (!socket) return next(new Error(`No socket with ID: ${socket_id} found`)); // TODO maybe deliver error to frontend
    if (labels) socket.emit('updateLabels', labels);
    socket.emit('updateEmbedding', body, (confirm) => {
        console.log(confirm);
        res.json(confirm);
    });
});


router.post('/startUpdateEmbedding', async (req, res, next) => {
    console.log('POST /startUpdateEmbedding');
    const { body } = req;
    // console.log({ body });
    const { socketId, nodes } = body;
    console.log({ socketId });
    // console.log(app)
    if (!socketId) return next(new Error('No Client ID delivered'));
    res.send();

    try {
        const time = process.hrtime();
        const data = await fetch(`http://${pythonApi}:8000/startUpdateEmbedding`, {
            method: 'POST',
            header: { 'Content-type': 'application/json' },
            body: JSON.stringify(body),
        }).then(response => response.text());
        const diff = process.hrtime(time);
        // console.log(data);
        // res.send(data);
        console.log(`startUpdateEmbedding from python took ${diff[0] + diff[1] / 1e9} seconds`);
    } catch (err) {
        console.error('error - startUpdateEmbedding python error');
        console.error(err);
        next(err);
    }
});

router.post('/stopUpdateEmbedding', async (req, res, next) => {
    console.log('POST /stopUpdateEmbedding');
    const { body } = req;
    console.log({ body });
    const { socketId } = body;
    console.log({ socketId });
    // console.log(app)
    if (!socketId) return next(new Error('No Socket ID delivered'));


    try {
        const time = process.hrtime();
        const data = await fetch(`http://${pythonApi}:8000/stopUpdateEmbedding`, {
            method: 'POST',
            header: { 'Content-type': 'application/json' },
            body: JSON.stringify(body),
        }).then(response => response.text());
        const diff = process.hrtime(time);
        res.send(data);
        console.log(`stopUpdateEmbedding from python took ${diff[0] + diff[1] / 1e9} seconds`);
    } catch (err) {
        console.error('error - stopUpdateEmbedding python error');
        console.error(err);
        next(err);
    }
});

router.post('/getGroupNeighbours', async (req, res, next) => {
    console.log('POST /getGroupNeighbours');
    const { body } = req;
    console.log({ body });
    const { neighbours, group } = body;
    console.log({ neighbours, group });
    // console.log(app)

    if (process.env.NODE_ENV === 'development') {
        res.status = 200;
        res.send({ group: [1, 4, 5], neighbours: { 3: 0.2, 5: 0.5, 10: 0.1, 12: 0.01} });
    } else {
        try {
            const time = process.hrtime();
            const data = await fetch(`http://${pythonApi}:8000/getGroupNeighbours`, {
                method: 'POST',
                header: { 'Content-type': 'application/json' },
                body: JSON.stringify(body),
            }).then(response => response.text());
            const diff = process.hrtime(time);
            res.send(data);
            console.log(`getGroupNeighbours from python took ${diff[0] + diff[1] / 1e9} seconds`);
        } catch (err) {
            console.error('error - getGroupNeighbours python error');
            console.error(err);
            next(err);
        }
    }
});

export default router;
