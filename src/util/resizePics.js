// import data from '../../mock/2582_sub_wikiarts';
import sharp from 'sharp';
import fs from 'fs';
import { imgSizes as sizes } from '../config/imgSizes';

const resizePics = async (imgPath, imgSizes, nodes = []) => {
    console.log('resizePics');
    console.time('resizePics');

    if (!fs.existsSync(imgPath)) return new Error('Pfad zu Bilder in resizePics ungültig');
    // check all dirs or create
    imgSizes.forEach((size) => {
        const dir = `${imgPath}${size}/`;
        console.log(dir);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    });
    // no nodes delivered - take all from folder
    if (!nodes.length) {
        console.log('no nodes');
        console.log(imgPath);
        fs.readdir(imgPath, async (err, files) => {
            if (err) return new Error(err);

            // map through files
            await Promise.all(files.map((file, i) => {
                // check if file is a folder (10, 20, ...)
                if (!Number.isNaN(+file)) return null;

                const path = `${imgPath}${file}`;
                // if file exists return
                const pic = sharp(path);
                // map through image sizes
                return imgSizes.map((size) => {
                    const outPath = `${imgPath}${size}/${file.split('.')[0]}.png`;
                    if (fs.existsSync(outPath)) return null;
                    // todo chekc sharp newest version, issue #1153 seems to add a new method for alpha
                    return pic.resize(size, size)
                        .max()
                        .overlayWith(
                            Buffer.alloc(4),
                            { tile: true, raw: { width: 1, height: 1, channels: 4 } },
                        )
                        .toFile(outPath)
                        .then((_) => {
                            if (i && !(i % 100)) console.log(`saved: ${i} - ${outPath}`);
                        })
                        .catch((e) => {
                            console.error(e);
                            console.log({ file, path, outPath });
                        });
                });
            }));
            console.timeEnd('resizePics');
        });
    }
};


export default resizePics;

const path = 'C:/Users/libor/bachelor-node/images/2582_sub_wikiarts/';
console.log(path);
resizePics(path, sizes).then((e) => {
    console.log('Finished: all images resized');
}).catch((err) => {
    console.error('Error: resizePics not finished');
    console.error(err);
});
