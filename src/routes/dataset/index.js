import { Router } from 'express';
import { dataSet } from '../../config/datasets';


const router = Router();

// POST - /api/v1/svm/train
router.get('/all', async (req, res) => {
    const datasets = dataSet.map(set => ({ name: set.name, discription: set.description }))
    res.json(datasets);
});

router.get('/:name', async (req, res) => {
    console.log('get request of ' + req.params.name)
    const dataset = dataSet.find(e => e.name === req.params.name)
    if(!dataset) return new Error('kein gültiger Datensatz name')
    // TODO hier sollen eigentlich alle Namen zurückgegeben werden
    res.json(dataset)
});


export default router;
