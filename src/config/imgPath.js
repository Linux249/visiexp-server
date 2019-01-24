import path from 'path';

let imgPath = '';

if (process.env.NODE_ENV === 'development') {
    imgPath = path.normalize(path.join(__dirname, '../..', 'images/2582_sub_wikiarts/'));
    // imgPath = `/export/home/kschwarz/Documents/Data/CUB_200_2011/images_nofolders/`;
} else {
    imgPath = '/export/home/kschwarz/Documents/Data/Wikiart_artist49_images/';
}

export default imgPath;
