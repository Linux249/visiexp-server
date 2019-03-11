// import data from '../../mock/2582_sub_wikiarts';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import sizes from '../config/imgSizes';
import dataSets from '../config/datasets';

const fsp = fs.promises;

const resizePics = async (imgSizes) => {
    console.time('resizePics');
    const timeResizePics = process.hrtime();

    // todo later all sets
    const datasetName = dataSets[0].name;

    // absolute source of images
    const inImgPath = dataSets[0].imgPath;
    if (!fs.existsSync(inImgPath)) return new Error('Path to images (source) invalid');
    console.log({ inImgPath });

    const outImgPath = path.join(__dirname, '../../images/', datasetName);
    if (fs.existsSync(outImgPath)) return new Error('out dir already exists - please delete it and restart');
    fs.mkdirSync(outImgPath);
    console.log({ outImgPath });

    // create all images size dirs
    imgSizes.forEach(size => fs.mkdirSync(path.join(outImgPath, size.toString())));

    // console.log(imgPath);
    try {
        const sourceFiles = await fsp.readdir(inImgPath);
        const count = sourceFiles.length;
        console.log(`start resizing ${count} pics`);
        // map through files
        // await Promise.all(sourceFiles.map(async (file, i) =>
        for (let i = 0; i < count; i += 1) {
            const file = sourceFiles[i];
            // check if file is a folder (10, 20, ...)
            // todo that should never be happen again but maybe is usefull later
            if (imgSizes.includes(+file)) return null;
            // path to load img
            const sourceImagePath = path.join(inImgPath, file);

            // map through image sizes
            await Promise.all(imgSizes.map((size) => {
                const outPath = path.join(outImgPath, size.toString(), `${file.split('.')[0]}.png`);
                // if file exists return | is not require cause of return above
                // if (fs.existsSync(outPath)) return null;
                return sharp(sourceImagePath)
                    .resize(size, size, { fit: 'inside' })
                    .ensureAlpha()
                    .toFile(outPath)
                    .then(() => {
                        if (size === 10 && i && !(i % 100)) {
                        }
                    })
                    .catch((e) => {
                        console.error(e);
                        console.log({ file, sourceImagePath, outPath });
                    });
            }));
            const diffResizePics = process.hrtime(timeResizePics);
            console.log(`saved: ${i}/${count} in ${diffResizePics[0] + diffResizePics[1] / 1e9}s (- )${file})`);
        }
    // ));
    } catch (err) {
        if (err) return new Error(err);
    }
    console.timeEnd('resizePics');
};


export default resizePics;

// const testPath = 'C:/Users/libor/bachelor-node/images/2582_sub_wikiarts#90/';

resizePics(sizes).then((e) => {
    console.log('Finished: all images resized');
}).catch((err) => {
    console.error('Error: resizePics not finished');
    console.error(err);
});
