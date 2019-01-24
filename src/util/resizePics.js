// import data from '../../mock/2582_sub_wikiarts';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import sizes from '../config/imgSizes';
import imagePath from '../config/imgPath';
import { dataSet } from '../config/datasets';

const fsp = fs.promises;

const resizePics = async (imgPath, imgSizes) => {
    console.log(`path: ${imgPath}`);
    console.time('resizePics');
    const timeResizePics = process.hrtime();

    // check the hole path
    if (!fs.existsSync(imgPath)) return new Error('Pfad zu Bilder in resizePics ungültig');
    // create all dirs
    imgSizes.forEach((size) => {
        const dir = path.join(imgPath, size.toString());
        // console.log(dir);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        else console.warn('dir allready exists - doing nothing now');
    });

    // console.log(imgPath);
    try {
        const files = await fsp.readdir(imgPath);
        const count = files.length;
        console.log(`start resizing ${count} pics`);
        // map through files
        await Promise.all(files.map(async (file, i) => {
            // check if file is a folder (10, 20, ...)
            if (imgSizes.includes(+file)) return null;
            // path to load img
            const sourceImagePath = path.join(imgPath, file);


            // map through image sizes
            return Promise.all(imgSizes.map((size) => {
                const outPath = path.join(imgPath, size.toString(), `${file.split('.')[0]}.png`);
                // if file exists return
                if (fs.existsSync(outPath)) return null;
                // todo chekc sharp newest version, issue #1153 seems to add a new method for alpha
                return sharp(sourceImagePath)
                    .resize(size, size, { fit: 'inside' })
                    .ensureAlpha()
                    .toFile(outPath)
                    .then((_) => {
                        if (size === 10 && i && !(i % 100)) {
                            const diffResizePics = process.hrtime(timeResizePics);
                            console.log(`saved: ${i}/${count} in ${diffResizePics[0] + diffResizePics[1] / 1e9}s (- )${outPath})`);
                        }
                    })
                    .catch((e) => {
                        console.error(e);
                        console.log({ file, path: sourceImagePath, outPath });
                    });
            }));
        }));
    } catch (err) {
        if (err) return new Error(err);
    }
    console.timeEnd('resizePics');
};


export default resizePics;

const testPath = 'C:/Users/libor/bachelor-node/images/2582_sub_wikiarts#90/';
resizePics(imagePath, sizes).then((e) => {
    console.log('Finished: all images resized');
}).catch((err) => {
    console.error('Error: resizePics not finished');
    console.error(err);
});
