import { Router } from 'express';
import fetch from 'node-fetch';
import { pythonApi } from '../../config/env';

const router = Router();

// POST - /api/v1/svm/train
router.post('/train', async (req, res) => {
    console.log(req.path);
    if (process.env.NODE_ENV === 'development') {
        res.send({ p: [2, 4], n: [10, 20, 23], t: [1, 2, 3] });
    } else {
        console.log('get updateSvm from python');

        try {
            const time = process.hrtime();
            const data = await fetch(`http://${pythonApi}:8000/trainSvm`, {
                method: 'POST',
                header: { 'Content-type': 'application/json' },
                body: JSON.stringify(req.body),
            }).then(response => response.json());
            const diff = process.hrtime(time);
            res.send(data);
            console.log(`get updateSvm from python took ${diff[0] + diff[1] / 1e9} seconds`);
        } catch (err) {
            console.error('error - get updateSvm from python - error');
            console.error(err);
        }
    }
});

// POST - /api/v1/svm/stop
router.post('/stop', async (req, res) => {
    console.log(req.path);
    if (process.env.NODE_ENV === 'development') {
        res.json({ group: [2, 5, 8] });
    } else {
        console.log('send stopSvm to python');
        try {
            const time = process.hrtime();
            const data = await fetch(`http://${pythonApi}:8000/stopSvm`, {
                method: 'POST',
                header: { 'Content-type': 'application/json' },
            }).then(response => response.json());
            const diff = process.hrtime(time);
            res.json(data);
            console.log(`stopSvm from python took ${diff[0] + diff[1] / 1e9} seconds`);
        } catch (err) {
            console.error('error - stopSvm python error');
            console.error(err);
        }
    }
});


export default router;
