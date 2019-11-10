import { Router } from 'express';
import fetch from 'node-fetch';
import { pythonApi } from '../../config/pythonApi';

const router = Router();

router.get('/', async (req, res, next) => {
  console.log('GET: snapshots');
  const { dataset, userid } = req.query;
  console.log(dataset, userid);
  if (!dataset || !userid) return next(new Error('dataset od userid missing'));

  if (process.env.NODE_ENV === 'development') {
    res.json({
      snapshots: [
        {
          nodes: {},
          groups: [],
          count: 500,
          createdAt: 'Mon Oct 28 2019 12:14:15 GMT+0100 (Mitteleuropäische Normalzeit)',
        },
      ],
    });
  } else {
    try {
      const data = await fetch(`${pythonApi}/snapshot?dataset=${dataset}&userid=${userid}`).then(
        response => response.json()
      );
      res.json(data);
    } catch (err) {
      console.error('error - updateLabels python error');
      console.error(err);
      next(err);
    }
    res.json({ snapshots: [] });
  }

  // res.json({ snapshots: [] });
});

router.post('/', async (req, res, next) => {
  console.log('POST: snapshots');

  const { nodes, groups, dataset, count, userid } = req.body;
  console.log({
    nodes,
    groups,
    dataset,
    count,
    userid,
  });

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
        body: JSON.stringify(nodes, groups, dataset, count, userid),
      }).then(response => response.json());
      res.json({
        message: 'Snapshot saved',
      });
    } catch (err) {
      console.error('error - save snapshots python error');
      console.error(err);
      next(err);
    }
  }
});

export default router;
