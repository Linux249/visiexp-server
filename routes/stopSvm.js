import fetch from 'node-fetch';

export default async (req, res) => {
    console.log(req.path);
    if (process.env.NODE_ENV === 'development') {
        res.send('stop svm');
    } else {
        console.log('send stopSvm to python');
        try {
            const time = process.hrtime();
            const data = await fetch('http://localhost:8000/stopSvm', {
                method: 'POST',
                header: { 'Content-type': 'application/json' },
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
