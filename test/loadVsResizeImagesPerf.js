import path from 'path';
import sharp from 'sharp';
import { imgSizes } from '../src/config/imgSizes';
import exampleNodes from '../mock/2582_sub_wikiarts';


const loadImages = async (imgCount, imgPath) => {
    console.time('loadImages');
    console.log(`loadImages with ${imgCount} files`);
    const timeFillImgDataCach = process.hrtime();
    const scaledPicsHash = Object.create(null);
    const promises = [];

    for (let n = 1; n <= imgCount; n += 1) {
        const i = n % imgCount;
        const node = exampleNodes[i];
        const pics = Object.create(null);
        promises.push(Promise.all(imgSizes.map((size) => {
            const filePath = path.join(imgPath, size.toString(), `${node.name}.png`);

            return sharp(filePath)
                .raw()
                .toBuffer({ resolveWithObject: true })
                .then(pic => pics[size] = pic)
                .catch((e) => {
                    console.error(e);
                    console.log({ filePath });
                });
        })).then(() => {
            if (!(n % 100)) {
                const diffFillImgDataCach = process.hrtime(timeFillImgDataCach);
                console.log(`${n}/${imgCount} pics cached took: ${diffFillImgDataCach[0] + diffFillImgDataCach[1] / 1e9}s`);
            }
            scaledPicsHash[node.name] = pics;
        }));
    }
    await Promise.all(promises);
    console.timeEnd('loadImages');
};

const resizeImages = async (imgCount, imgPath) => {
    console.time('resizeImages');
    console.log(`resizeImages with ${imgCount} files`);
    const timeFillImgDataCach = process.hrtime();
    const scaledPicsHash = Object.create(null);
    const promises = [];

    for (let n = 1; n <= imgCount; n += 1) {
        const i = n % imgCount;
        const node = exampleNodes[i];
        const pics = Object.create(null);

        const filePath = `${imgPath}${node.name}.jpg`;
        const pic = sharp(filePath);
        promises.push(Promise.all(imgSizes.map(async (size) => {
            // const file = await readFile(iconPath);
            pics[size] = await pic
                // The old way tooks nearly the double of time
                // .max()
                // .overlayWith(
                //     Buffer.alloc(4),
                //     { tile: true, raw: { width: 1, height: 1, channels: 4 } },
                // )
                .resize(size, size, { fit: 'inside' })
                .ensureAlpha()
                .raw()
                .toBuffer({ resolveWithObject: true });
        })).then(() => {
            if (!(n % 100)) {
                const diffFillImgDataCach = process.hrtime(timeFillImgDataCach);
                console.log(`${n}/${imgCount} pics cached took: ${diffFillImgDataCach[0] + diffFillImgDataCach[1] / 1e9}s`);
            }
            scaledPicsHash[node.name] = pics;
        }));
    }
    await Promise.all(promises);
    console.timeEnd('resizeImages');
};

const imgCount = 500;
const imgPath = path.normalize(path.join(__dirname, '..', 'images/2582_sub_wikiarts/'));
// loadImages(imgCount, imgPath);
resizeImages(imgCount, imgPath);

// todo make a test function that runs multiple tests and calc avarage time
//  Promise.all inside the for loop is unnecessary because we don't want to loop
//  waiting. The loop should push all promises to an array and after that
//  loop the function should wait until all promises are returned

