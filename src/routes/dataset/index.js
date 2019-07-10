import fs, { promises as fsP } from 'fs';
import path from 'path';
// import sharp from 'sharp';
// import { Readable } from 'stream';
import { Router } from 'express';
import { dataSet } from '../../config/datasets';
// import { imgSizes } from '../../config/imgSizes';
const ss = require('stream-stream');

const router = Router();

// GET - /api/v1/dataset/all
router.get('/all', async (req, res) => {
    // TODO check if there bin files exist
    const datasets = dataSet.map(({
        id, name, description, size,
    }) => {
        // check if byte file exists
        // const byteFileName = path.join(__dirname, '/../../../images/bin', `${name}#${count}.bin`);
        const exists = true; //= fs.existsSync(byteFileName);
        // console.log({ byteFileName, exists });
        return {
            id, name, description, size, exists,
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
router.get('/images/:id/:count', async (req, res, next) => {
    try {
        console.log('request dataset stream');
        let contentSize = 0;
        let { id, count } = req.params;
        const { name, size } = dataSet.find(e => e.id === id);
        if (count > size) count = size;
        console.log({
            id, name, count, size,
        });
        const files = [];
        // if (!imgPath || !count) return next(new Error('keine gültige id oder name'));
        let i = 0;
        while (i < count) {
            i = (i + 500) < count ? i + 500 : +count;
            // const fileName = `${name}#${i}.bin`;
            const fileName = `Wikiart_Elgammal_EQ_artist_test#${i}.bin`;
            const filePath = path.join(__dirname, '/../../../images/bin/', fileName);
            const stat = fs.statSync(filePath);
            console.log(i, stat.size, filePath);
            contentSize += stat.size;
            files.push(filePath);
        }

        res.writeHead(200, {
            'Content-Type': 'application/octet-stream',
            'Content-Length': contentSize,
        });

        const stream = ss();
        files.forEach((file) => {
            stream.write(fs.createReadStream(file));
        });
        stream.end();
        stream.pipe(res, { end: false });
    } catch (e) {
        console.log('error in GET /images/:id/:count');
        console.log(e);
        // check for wrong file path
        if (e.code === 'ENOENT') {
            const file = path.basename(e.path);
            next(new Error(`Couldn't find image file: ${file}`));
        } else next(e);
    }
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
