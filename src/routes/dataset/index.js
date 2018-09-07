import { Router } from 'express';
import { dataSet } from '../../config/datasets';


const router = Router();

// POST - /api/v1/svm/train
router.get('/all', async (req, res) => {
    const datasets = dataSet.map(({ id, name, description, count }) => ({ id, name, description, count }));
    res.json(datasets);
});

router.get('/:id', async (req, res, next) => {
    const dataset = dataSet.find(e => e.id === req.params.id);
    if (!dataset) return next(new Error('kein gültiger Datensatz name'));
    // TODO hier sollen eigentlich alle Namen zurückgegeben werden
    res.json(dataset);
});


export default router;
