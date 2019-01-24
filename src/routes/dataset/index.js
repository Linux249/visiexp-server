import { promises as fsP } from 'fs';
import path from 'path';
import { Router } from 'express';
import { dataSet } from '../../config/datasets';
import { imgSizes } from '../../config/imgSizes';

const router = Router();

// GET - /api/v1/dataset/all
router.get('/all', async (req, res) => {
    const datasets = dataSet.map(({
        id, name, description, count, dirName,
    }) => ({
        id, name, description, count, dirName,
    }));
    return res.json(datasets);
});

// GET - /api/v1/dataset/:id
router.get('/:id', async (req, res, next) => {
    const { imgPath, count } = dataSet.find(e => e.id === req.params.id);
    console.log({ imgPath, count });
    if (!imgPath || !count) return next(new Error('keine gültige id oder name'));
    // TODO hier sollen eigentlich alle Namen zurückgegeben werden
    const p = path.join(imgPath, '10');
    const files = await fsP.readdir(p);
    const imgNames = count ? files.slice(0, count) : files;
    return res.json({ imgNames });
});


export default router;
