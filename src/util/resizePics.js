// import data from '../../mock/2582_sub_wikiarts';
import sharp from 'sharp';
import fs from 'fs';
import { imgSizes as sizes } from '../config/imgSizes';
import {dataSet} from "../config/datasets";

const resizePics = async (imgPath, imgSizes) => {
    console.log('start resizePics');
    console.time('resizePics');

    // check the hole path
    if (!fs.existsSync(imgPath)) return new Error('Pfad zu Bilder in resizePics ungültig');
    // create all dirs
    imgSizes.forEach((size) => {
        const dir = `${imgPath}${size}/`;
        console.log(dir);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        else console.warn('dir allready exists - what to do now is not implemented');
    });

    // console.log(imgPath);
    await fs.readdir(imgPath, async (err, files) => {
        if (err) return new Error(err);

        // map through files
        await Promise.all(files.map((file, i) => {
            // check if file is a folder (10, 20, ...)
            if (imgSizes.includes(+file)) return null;
            // path to load img
            const sourceImagePath = `${imgPath}${file}`;

            const pic = sharp(sourceImagePath);
            // map through image sizes
            return imgSizes.map((size) => {
                const outPath = `${imgPath}${size}/${file.split('.')[0]}.png`;
                // if file exists return
                if (fs.existsSync(outPath)) return null;
                // todo chekc sharp newest version, issue #1153 seems to add a new method for alpha
                return pic.resize(size, size)
                    .resize(size, size, { fit: 'inside' })
                    .ensureAlpha()
                    .toFile(outPath)
                    .then((_) => {
                        if (i && !(i % 100)) console.log(`saved: ${i} - ${outPath}`);
                    })
                    .catch((e) => {
                        console.error(e);
                        console.log({ file, path: sourceImagePath, outPath });
                    });
            });
        }));
    });
    console.timeEnd('resizePics');
};


export default resizePics;

const path = 'C:/Users/libor/bachelor-node/images/2582_sub_wikiarts#90/';
console.log(path);
resizePics(path, sizes).then((e) => {
    console.log('Finished: all images resized');
}).catch((err) => {
    console.error('Error: resizePics not finished');
    console.error(err);
});
