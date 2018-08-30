import data from '../../mock/2582_sub_wikiarts';
import sharp from 'sharp';
import fs from 'fs';

const resizePics = async (imgPath, imgSizes, nodes) => {
    console.log('resizePics');
    console.time('resizePics');

    // check all dirs or create
    imgSizes.forEach((size) => {
        const dir = `${imgPath}${size}/`;
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    });
    const results = await Promise.all(Object.values(nodes).map((node) => {
        const path = `${imgPath}${node.name}.jpg`;

        const pic = sharp(path);
        return Promise.all(imgSizes.map((size) => {
            const outPath = `${imgPath}${size}/${node.name}.png`;
            return pic.resize(size, size)
                .max()
                .overlayWith(
                    Buffer.alloc(4),
                    { tile: true, raw: { width: 1, height: 1, channels: 4 } },
                )
                // .raw()
                // .toBuffer({ resolveWithObject: true })
                .toFile(outPath);
        }));
    }));
    // results = await Promise.all(results)
    console.log(results[100]);
    console.timeEnd('resizePics');
};


export default resizePics;

const path = `${__dirname}/images/2582_sub_wikiarts/`


const sizes = []

resizePics(path, sizes, data)
