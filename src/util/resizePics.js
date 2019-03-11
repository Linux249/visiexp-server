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
    if (!fs.existsSync(inImgPath)) throw new Error(`Path to images (source) invalid: ${inImgPath}`);
    console.log({ inImgPath });

    // console.log(`check: ${inImgPath}`);
    // try {
    //     fs.accessSync(inImgPath, fs.constants.F_OK);
    //     console.log('inImgPath exists');
    //     fs.accessSync(inImgPath, fs.constants.R_OK);
    //     console.log('can read inImgPath');
    //     fs.accessSync(inImgPath, fs.constants.W_OK);
    //     console.log('can write inImgPath');
    // } catch (err) {
    //     console.error('no access inImgPath!');
    //     console.error(err);
    //     return;
    // }


    const outImgPath = path.join(__dirname, '../../images/', datasetName);
    if (fs.existsSync(outImgPath)) {
        console.log(`out dir ${outImgPath}already exists`)
        // delelete folder first
        // throw new Error(`out dir ${outImgPath}already exists - please delete it and restart`);
    } else fs.mkdirSync(outImgPath);
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
            if (imgSizes.includes(+file)) continue;
            // path to load img
            // build path to img and resolce sym links


            const realtivPath = path.join(inImgPath, file);
            // console.log(`realtivPath: ${realtivPath}`);
            const sourceImagePath = fs.realpathSync(realtivPath);

            // console.log(`check: ${sourceImagePath}`);
            // try {
            //     fs.accessSync(sourceImagePath, fs.constants.F_OK);
            //     console.log('file exists');
            //     fs.accessSync(sourceImagePath, fs.constants.R_OK);
            //     console.log('can read');
            //     fs.accessSync(sourceImagePath, fs.constants.W_OK);
            //     console.log('can write');
            // } catch (err) {
            //     console.error('no access!');
            //     console.error(err);
            //     return;
            // }
            const resize = (size) => {
                const outPath = path.join(outImgPath, size.toString(), `${file.split('.')[0]}.png`);
                // if file exists return | is not require cause of return above
                if (fs.existsSync(outPath)) return null;
                return sharp(sourceImagePath)
                    .resize(size, size, { fit: 'inside' })
                    .ensureAlpha()
                    .toFile(outPath)
                    .catch((e) => {
                        console.error(e);
                        console.log({ file, sourceImagePath, outPath });
                    });
            };

            // map through image sizes
            await Promise.all(imgSizes.map(resize)).then(() => {
                if (i && !(i % 100)) {
                    const diffResizePics = process.hrtime(timeResizePics);
                    console.log(`saved: ${i}/${count} in ${diffResizePics[0] + diffResizePics[1] / 1e9}s (- )${file})`);
                }
            });
        }
    // ));
    } catch (err) {
        if (err) throw new Error(err);
    }
    console.timeEnd('resizePics');
};


export default resizePics;

// const testPath = 'C:/Users/libor/bachelor-node/images/2582_sub_wikiarts#90/';

resizePics(sizes).then((e) => {
    console.log('Finished: all images resized');
}).catch((err) => {
    console.error('Error: resizePics not finished');
    console.error(err.message);
    console.error(err);
});
