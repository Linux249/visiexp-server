import { Router } from 'express';
import fetch from 'node-fetch';
import { pythonApi } from '../../config/pythonApi';

const router = Router();

router.get('/:dataset', async (req, res, next) => {
    console.log('GET: snapshots');
    const dataset = req.params.dataset;
    console.log(dataset);

    res.json({ datasets: [] });
});

router.post('/', async (req, res, next) => {
    console.log('POST: snapshots');

    const { nodes, groups, dataset } = req.body;
    console.log(dataset);

    if (process.env.NODE_ENV === 'development') {
        res.json({
            message: 'Snapshot not saved in dev mode',
        });
    } else {
        console.log('send snapshot to python');
        try {
            await fetch(`${pythonApi}/snapshot`, {
                method: 'POST',
                header: { 'Content-type': 'application/json' },
                body: JSON.stringify({ nodes, groups }),
            }).then(response => response.json());
            res.json({
                message: 'Snapshot saved',
            });
        } catch (err) {
            console.error('error - updateLabels python error');
            console.error(err);
            next(err);
        }
    }
});

export default router;
