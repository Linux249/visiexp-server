import path from 'path'
import {promises as fsp} from 'fs'
import imgPath from '../config/imgPath';

export default (socket) => async (data) => {
    // console.log("requestImage")
    // console.log(data.name)
    const { name } = data;
    if (!name) new Error('that shouldn happen - report please!!! (requests image withoutname');
    try {
        // TODO .jpg is not the default every time!
        const imagePath = path.join(imgPath, `${name}.jpg`);
        const file = await fsp.readFile(imagePath);
        const buffer = file.toString('base64');
        socket.emit('requestImage', {
            buffer,
            index: data.index,
        });
        console.log(`Image is send: ${name}`);
    } catch (err) {
        console.error(err);
    }
}
