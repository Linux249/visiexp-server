import fs from 'fs';
import { Router } from 'express';
import { dataSet } from '../../config/datasets';

const router = Router();

// POST - /api/v1/svm/train
router.get('/all', async (req, res) => {
    const datasets = dataSet.map(({
        id, name, description, count, dirName,
    }) => ({
        id, name, description, count, dirName,
    }));
    res.json(datasets);
});

router.get('/:id', async (req, res, next) => {
    const { dirName, count } = dataSet.find(e => e.id === req.params.id);
    if (!dirName || !count) return next(new Error('keine gültige id oder name'));
    // TODO hier sollen eigentlich alle Namen zurückgegeben werden
    const p = `${__dirname}/../../../images/${dirName}/10`;
    const imgs = fs.readdirSync(p).slice(15, count + 15);
    res.json({ imgs, count });
});


export default router;
