import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import sizes from '../config/imgSizes';
import dataSets from '../config/datasets';
import { maxNodesCount } from '../config/maxNodesCount';

const fsp = fs.promises;

const buildDatasets = async (imgSizes) => {
    console.log('Start building byte files');
    console.time('buildDatasets');
    // const timeResizePics = process.hrtime();

    // for each dataset
    const l = dataSets.length;
    for (let d = 0; d < l; d += 1) {
        try {
            // absolute source of images
            const { id, imgPath } = dataSets[d];
            // check if path to source exists
            if (!fs.existsSync(imgPath)) throw new Error(`Path to images (source) invalid: ${imgPath}`);

            // create dataset name
            const datasetName = dataSets[d].name;
            // max dataset size
            const count = dataSets[d].size > maxNodesCount ? maxNodesCount : dataSets[d].size;
            console.log(`Dataset: ${id} Count: ${count} Path: ${imgPath}`);
            console.log('------------------------------------------');

            // create path if not existing
            const outPath = path.join(__dirname, '../../images/bin/');
            if (!fs.existsSync(outPath)) fs.mkdirSync(outPath);

            //  JSON files with nodes
            const jsonFileName = `${datasetName}.json`;
            const jsonFilePath = path.join('/net/hcihome/storage/www-data-login-cv/visiexp/datasets', jsonFileName);


            const jsonFile = await fsp.readFile(jsonFilePath);
            const { nodes } = JSON.parse(jsonFile);
            const sortedNodes = {};
            Object.keys(nodes).forEach((name) => {
                sortedNodes[nodes[name].idx] = name;
            });

            const sourceFiles = Object.values(sortedNodes);
            // if (fs.existsSync(jsonFilePath)) {
            //     console.log(`json file already exists for dataset: ${datasetName} - delete the file for recreating the dataset`);
            //     console.log('dataset will be build from json file');
            //     const jsonFile = await fsp.readFile(jsonFilePath);
            //     sourceFiles = JSON.parse(jsonFile);
            // } else {
            //     // create json file from #count random pics
            //     sourceFiles = await fsp.readdir(imgPath);
            //     sourceFiles.sort(() => Math.random() - 0.5);
            //     sourceFiles = sourceFiles.slice(0, count);
            //     await fsp.writeFile(jsonFilePath, JSON.stringify(sourceFiles));
            //     console.log('create json file for:');
            //     console.log(datasetName);
            //     console.log(jsonFilePath);
            // }
            let wstream;


            console.log(`start building dataset for ${count} pics`);

            // map through files
            for (let i = 0; i < 1; i += 1) {
                if (i % 500 === 0) {
                    if (wstream) wstream.end();
                    // prepare write stream
                    const number = (i + 500) < count ? i + 500 : count;
                    const binFileName = `${datasetName}#${number}.bin`;
                    const binFilePath = path.join(outPath, binFileName);
                    console.log(`binFilePath: ${binFilePath}`);
                    if (fs.existsSync(binFilePath)) {
                        console.log(`bin file already exists for dataset: ${datasetName} - delete the file for recreating the dataset`);
                        // procede with the next dataset
                        i += 499;
                        continue;
                    }
                    wstream = fs.createWriteStream(binFilePath);
                }
                const file = sourceFiles[i];
                // console.log(imgPath, file);
                const imgFilePath = fs.realpathSync(path.join(imgPath, file));
                if (!(i % 10)) console.log(`${i}: ${imgFilePath}`);

                const pics = Object.create(null);
                await Promise.all(imgSizes.map(async (size) => {
                    pics[size] = await sharp(imgFilePath)
                        .resize(size, size, { fit: 'inside' })
                        .ensureAlpha()
                        .raw()
                        .toBuffer({ resolveWithObject: true })
                        .catch((e) => {
                            console.error(e);
                            console.error(imgFilePath);
                            console.error(`exists?: ${fs.existsSync(imgFilePath)}`);
                            // throw Error(e);
                        });
                }));


                Object.values(pics).forEach((p) => {
                    if (p) {
                        wstream.write(Buffer.from([p.info.width, p.info.height]));
                        wstream.write(p.data);
                    }
                });
            }
            if (wstream) {
                wstream.end();
                wstream.on('finish', () => {
                    console.log('All writes are now complete.');
                    console.log(wstream.path);
                });
            }
        } catch (err) {
            console.error(err);
            if (err) throw new Error(err);
        }
    }
    console.timeEnd('buildDatasets');
};


export default buildDatasets;

buildDatasets(sizes).then((e) => {
    console.log('Finished: all images resized');
}).catch((err) => {
    console.error('Error: resizePics not finished');
    console.error(err.message);
    console.error(err);
});
