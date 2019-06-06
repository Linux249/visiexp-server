import { Router } from 'express';
import fetch from 'node-fetch';
import { compareAndClean } from '../../util/compareAndClean';
import buildLabels from '../../util/buildLabels';
import { getRandomUnusedId } from '../../util/getRandomUnusedId';
import { pythonApi } from '../../config/pythonApi';

const mockDataLength = require('../../config/env').mockDataLength;

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
            await fetch(`${pythonApi}/updateLabels`, {
                method: 'POST',
                header: { 'Content-type': 'application/json' },
                body: JSON.stringify({ nodes, userId: req.body.userId }),
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

// This is right now just for the python backend to get data back to UI without request
router.post('/updateEmbedding', async (req, res, next) => {
    console.log('POST /updateEmbedding');
    const { categories, nodes, socket_id } = req.body;

    if (!socket_id) return next(new Error('No socket connection'));

    // todo @Katja: why is categories not always inside?
    const labels = categories ? buildLabels(categories, nodes) : undefined;
    const socket = req.app.io.sockets.sockets[socket_id];
    if (!socket) return next(new Error(`No socket with ID: ${socket_id} found`)); // TODO maybe deliver error to frontend
    if (labels) socket.emit('updateCategories', { labels });
    // confirm is {stopped: true/false}for signaling if the user hast stopped
    socket.emit('updateEmbedding', { nodes }, (confirm) => {
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
        await fetch(`${pythonApi}/startUpdateEmbedding`, {
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

// todo ist this necessary if the sopped state is already transmitted?
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
        const data = await fetch(`${pythonApi}/stopUpdateEmbedding`, {
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

// todo @Katja: the groupId should be also returned from python, otherwise the user can select a new active group while the request return
router.post('/getGroupNeighbours', async (req, res, next) => {
    console.log('POST /getGroupNeighbours');
    console.log(req.body);
    const { neighbours, removedNeighbours, threshold } = req.body;
    const body = {
        threshold, // TODO maybe the python code need this or can perfom the sorting?
        positives: req.body.group,
        groupId: req.body.groupId,
        userId: req.body.userId,
    };

    // no neighbours => no negatives => initial function call
    if (neighbours) {
        Object.keys(neighbours).forEach(key => body.positives.push(+key));
        body.negatives = [];
        Object.keys(removedNeighbours).forEach(key => body.negatives.push(+key));
    }
    console.log({ body });

    if (process.env.NODE_ENV === 'development') {
        res.status = 200;

        const dumyNeighbours = {};
        console.log({ mockDataLength });

        for (let n = 0; n < 8; n += 1) {
            const id = getRandomUnusedId(mockDataLength, body.positives);
            dumyNeighbours[id] = Math.random();
        }

        const newNeighbours = {}
        Object.keys(dumyNeighbours)
            .sort((a, b) => dumyNeighbours[b] - dumyNeighbours[a])
            .slice(0, +threshold)
            .forEach(e  => newNeighbours[e] = dumyNeighbours[e]);
        res.send({
            group: body.positives,
            neighbours: newNeighbours,
            dumyNeighbours,
        });
    } else {
        try {
            const time = process.hrtime();
            const data = await fetch(`${pythonApi}/getGroupNeighbours`, {
                method: 'POST',
                header: { 'Content-type': 'application/json' },
                body: JSON.stringify(body),
            }).then(response => response.json());
            const { group, neighbours: allNeighbours } = data;
            console.log({ group, allNeighbours });
            const newNeighbours = {}
            Object.keys(allNeighbours)
                .sort((a, b) => allNeighbours[b] - allNeighbours[a])
                .slice(0, +threshold)
                .forEach(e => newNeighbours[e] = allNeighbours[e]);

            res.json({ group, neighbours: newNeighbours, allNeighbours });
            const diff = process.hrtime(time);
            console.log(`getGroupNeighbours from python took ${diff[0] + diff[1] / 1e9} seconds`);
        } catch (err) {
            console.error('error - getGroupNeighbours python error');
            console.error(err);
            next(err);
        }
    }
});

export default router;
