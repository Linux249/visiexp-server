import path from 'path';

const imgPath = path.normalize(path.join(__dirname, '../..', 'images/'));
/* process.env.NODE_ENV === 'development' ?
        path.normalize(path.join(__dirname, '../..', 'images/2582_sub_wikiarts/'))
        :
        // update path here
        path.normalize(path.join(__dirname, '../..', 'images/'))
        //'/export/home/kschwarz/Documents/Data/Wikiart_artist49_images/';

*/
export default imgPath;
