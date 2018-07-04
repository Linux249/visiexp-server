import { Router } from 'express';
import fetch from "node-fetch";

const router = Router();

router.post('/updateLabels', async (req, res) => {
    console.log('updateLabels -route');
    
    console.log(req.path);
    if (process.env.NODE_ENV === 'development') {
        res.status = 200
        res.send();
    } else {
        console.log('send updateLabels to python');
        try {
            const time = process.hrtime();
            const data = await fetch('http://localhost:8000/updateLabels', {
                method: 'POST',
                header: { 'Content-type': 'application/json' },
            }).then(response => response.json());
            const diff = process.hrtime(time);
            res.send();
            console.log(`updateLabels from python took ${diff[0] + diff[1] / 1e9} seconds`);
        } catch (err) {
            console.error('error - updateLabels python error');
            console.error(err);
        }
    }
});

export default router;
