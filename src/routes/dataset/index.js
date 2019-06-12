import fs, { promises as fsP } from 'fs';
import path from 'path';
// import sharp from 'sharp';
import { Readable } from 'stream';
import { Router } from 'express';
import { dataSet } from '../../config/datasets';
import { imgSizes } from '../../config/imgSizes';

const router = Router();

// GET - /api/v1/dataset/all
router.get('/all', async (req, res) => {
    // TODO check if there bin files exist
    const datasets = dataSet.map(({
        id, name, description, count,
    }) => {
        // check if byte file exists
        const byteFileName = path.join(__dirname, '/../../../images/bin', `${name}#${count}.bin`);
        const exists = fs.existsSync(byteFileName);
        console.log({ byteFileName, exists });
        return {
            id, name, description, count, exists,
        };
    });
    return res.json(datasets);
});

/*
router.get('/stream', async (req, res, next) => {
    if (process.env.NODE_ENV === 'production') return next(); // route is still in dev
    const readStream = new Readable({ read() {} });
    // res.header('Content-type: application/octet-stream')
    res.set('Content-type', 'application/octet-stream');
    // res.set('Cache-Control', 'public, max-age=3600')
    // readStream.pipe(res);
    const { imgPath } = dataSet[0];
    const sampleImg1 = 'albert-bierstadt_a-river-estuary.png';
    const sampleImg2 = 'albert-bierstadt_among-the-sierra-nevada-mountains-california-1868.png';
    for (const size of imgSizes) {
        const filePath1 = path.join(imgPath, size.toString(), sampleImg1);

        await sharp(filePath1)
            .raw()
            .toBuffer({ resolveWithObject: true })
            .then((pic) => {
                // console.log(pic)
                // readStream.push(pic.data)
                // readStream.pipe(res)
                // res.write(imgPath, 'utf8')
                res.write(pic.data);
            })
            .catch((e) => {
                console.error(e);
                console.log({ filePath });
            });
        const filePath2 = path.join(imgPath, size.toString(), sampleImg2);

        await sharp(filePath2)
            .raw()
            .toBuffer({ resolveWithObject: true })
            .then((pic) => {
                console.log(pic);
                // readStream.push(pic.data)
                // readStream.pipe(res)
                // res.write(imgPath, 'utf8')
                res.write(pic.data);
            })
            .catch((e) => {
                console.error(e);
                console.log({ filePath });
            });

        /*
            client code
            fetch('http://localhost:3000/api/v1/dataset/stream').then(res => {
            const reader = res.body.getReader()
            reader.read().then(function cb(x) {
                console.log(x)
                if(!x.done) reader.read().then(cb)
            })
            console.log(res)
            console.log(w)
            })
         */

/*
        const instream = fs.createReadStream(filePath)
        console.log(filePath)
        const transformer = sharp(filePath)
            //.raw()
            .toBuffer()
        console.log(typeof pipeline)
        //res.pipe(pipeline) // only .pipe on readable streams and give them an write
        instream.pipe(transformer).pipe(res) */
// pipeline.pipe(res)

/* .then(pic => pics[size] = pic)
            .catch((e) => {
                console.error(e);
                console.log({ filePath });
            });
        // res.pipe(size.toString())
    }
    res.end(null);
});
*/
// GET - /api/v1/dataset/images/:id
router.get('/images/:id', async (req, res, next) => {
    console.log('request dataset stream');
    const { name, count } = dataSet.find(e => e.id === req.params.id);
    // console.log({ name, count });
    // if (!imgPath || !count) return next(new Error('keine gültige id oder name'));
    const fileName = `${name}#${count}.bin`;
    const filePath = path.join(__dirname, '/../../../images/bin/', fileName);

    const stat = fs.statSync(filePath);
    console.log(stat);

    res.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Content-Length': stat.size,
    });

    const readStream = fs.createReadStream(filePath);
    // We replaced all the event handlers with a simple call to readStream.pipe()
    readStream.pipe(res);
});

// GET - /api/v1/dataset/nodes/:id
router.get('/nodes/:id', async (req, res, next) => {
    console.log('request dataset nodes');
    const { name, count } = dataSet.find(e => e.id === req.params.id);
    // console.log({ name, count });
    // if (!imgPath || !count) return next(new Error('keine gültige id oder name'));
    const fileName = `${name}#${count}.json`;
    const filePath = path.join(__dirname, '/../../../images/', fileName);

    // const stat = fs.statSync(filePath);
    // console.log(stat);

    res.sendFile(filePath, (err) => {
        if (err) next(err);
        else console.log('Sent:', fileName);
    });
});


export default router;
