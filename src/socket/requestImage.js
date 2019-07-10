import path from 'path';
import { promises as fsp } from 'fs';
import dataSets from '../config/datasets';

export default socket => async (data) => {
    // console.log("requestImage")
    // console.log(data.name)
    const { name, datasetId } = data;
    const dataset = dataSets.find(e => e.id === datasetId);
    if (!name) throw Error('that shouldn happen - report please!!! (requests image withoutname');
    try {
        // TODO .jpg is not the default every time!
        const imagePath = path.join(dataset.imgPath, name, '.jpg');
        const file = await fsp.readFile(imagePath);
        const buffer = file.toString('base64');
        socket.emit('requestImage', {
            buffer,
            index: data.index,
        });
        console.log(`Image is send: ${name}`);
    } catch (err) {
        console.error(err);
        socket.emit('Error', { message: 'Error loading full image', err })
    }
};
