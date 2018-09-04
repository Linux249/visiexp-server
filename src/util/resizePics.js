import data from '../../mock/2582_sub_wikiarts';
import sharp from 'sharp';
import fs from 'fs';

const resizePics = async (imgPath, imgSizes, nodes = []) => {
    console.log('resizePics');
    console.time('resizePics');

    if(!fs.existsSync(imgPath)) return console.log(new Error('Pfad zu Bilder in resizePics ungültig'))
    // check all dirs or create
    imgSizes.forEach((size) => {
        const dir = `${imgPath}${size}/`;
        console.log(dir)
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    });
    // no nodes delivered - take all from folder
    if(!nodes.length) {
        console.log("no nodes")
        console.log(imgPath)
        await fs.readdir(imgPath, (err, files) => {
            if(err) console.error(err)

            files.forEach(node => {
                const path = `${imgPath}${node}`;
                console.log(path)
                const pic = sharp(path);
                return Promise.all(imgSizes.map((size) => {
                    const outPath = `${imgPath}${size}/${node.split('.')[0]}.png`;
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
            });
            console.timeEnd('resizePics');
        })
    }

    /*const results = await Promise.all(nodes.map((node) => {
        const path = `${imgPath}${node}`;

        const pic = sharp(path);
        return Promise.all(imgSizes.map((size) => {
            const outPath = `${imgPath}${size}/${node.split('.')[0]}.png`;
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
    console.log(results[100]);*/
};


export default resizePics;

const path = `C:/Users/libor/bachelor-node/images/images_30030/`;
console.log(path)
const sizes = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150]

resizePics(path, sizes)
