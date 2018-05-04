import fetch from 'node-fetch';

export default async (req, res) => {
    console.log(req.path);
    if (process.env.NODE_ENV === 'development') {
        res.send({ p: [2, 4], n: [10, 20, 23] });
    } else {
        console.log('get updateSvm from python');

        try {
            const time = process.hrtime();
            const data = await fetch('http://localhost:8000/trainSvm', {
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
};
