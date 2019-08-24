import { promises as fsP } from 'fs';
import path from 'path';
import { imgSizes } from '../src/config/imgSizes';


// loop through each dataset and check
// 1. folder structure is similar to imageSizes
console.log('Check if all images are available for each dataset');
export const check = dataSet =>
    dataSet.map(async (set) => {
        try {
            // test if folder path exists
            // set.imgPath
            // Error: Path in dataset incorrect

            // count all images in main dir
            const files = await fsP.readdir(set.imgPath);
            const imgCount = files.length - imgSizes.length;
            console.log(`Path: ${set.imgPath} #${imgCount}`);

            // check all subdir
            imgSizes.map(async (size) => {
                try {
                    const subDir = path.join(set.imgPath, size.toString());
                    const subDirFiles = await fsP.readdir(subDir);
                    const subDirCount = subDirFiles.length - imgSizes.length;
                    console.log(`Path: ${subDir} #${subDirCount}`);
                } catch (e) {
                    console.error(e);
                    console.error("Fehler beim Starten der Anwendung: bitte Bildpfad überprüfen oder 'npm run resize' ausführen");
                    process.exit(0);
                }
                // test if subDir exists
            });
        } catch (e) {
            console.error(e);
            console.error("Fehler beim Starten der Anwendung: bitte Bildpfad überprüfen oder 'npm run resize' ausführen");
            process.exit(0);
        }
    });

export default check;
