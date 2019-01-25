import path from 'path';

const imgPath =
    process.env.NODE_ENV === 'development' ?
        path.normalize(path.join(__dirname, '../..', 'images/2582_sub_wikiarts/'))
        :
        // update path here
        '/export/home/kschwarz/Documents/Data/Wikiart_artist49_images/';


export default imgPath;
