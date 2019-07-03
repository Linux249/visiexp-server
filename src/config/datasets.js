/*
   {
        id: String, unique id
        name: String, Name that is shown to the user
        description: String, also shown to the user
        imgPath: String, absolute path to dicts
        mockDataFile: String, path to mock file
        count: Number, use only if want to reduce the dataset to the first n elements. Most time creating a new one is the bedder way
    }
 */

const prodDataSet = [
    {
        id: '001',
        name: 'Wikiart_Elgammal_EQ_artist_test',
        description: 'description text missing',
        imgPath: '/net/hciserver03/storage/kschwarz/Documents/Data/Wikiart_Elgammal',
        count: 1000,
        size: 119312,
    }, {
        id: '002',
        name: 'Wikiart_artist49_images',
        description: 'this contains X Nodes, Y datas, Z cliques, K ranks',
        imgPath: '/net/hciserver03/storage/kschwarz/Documents/Data/Wikiart_artist49_images/',
        count: 1000, // 16164
        size: 16164,
    }, {
        id: '003',
        name: 'AwA2_vectors_train',
        description: 'description text missing',
        imgPath: '/net/hci-storage02/groupfolders/compvis/datasets/Animals_with_Attributes2/single_folder_images2',
        count: 1000,
        size: 37372,
    }, {
        id: '004',
        name: 'STL_label_train',
        description: 'description text missing',
        imgPath: '/net/hciserver03/storage/kschwarz/Documents/Data/STL/single_folder_images_train',
        count: 5000,
        size: 5000,
    }, {
        id: '005',
        name: 'STL_label_test',
        description: 'description text missing',
        imgPath: '/net/hciserver03/storage/kschwarz/Documents/Data/STL/single_folder_images_test',
        count: 8000,
        size: 8000,
    }, {
        id: '06',
        name: 'Bansky',
        description: 'description text missing',
        imgPath: '/net/hci-storage02/groupfolders/compvis/salang/Street-Art-Daten/Banksy-Datensatz',
        count: 2000,
        size: 4916,
    },
];

// dev mode
const devDataSets = [
    {
        id: '001',
        name: '2582_sub_wikiarts',
        description: 'this contains X Nodes, Y datas, Z cliques, K ranks',
        imgPath: `${__dirname}/../../images/images_3000`,
        mockDataFile: '',
        size: 11788,
    }, {
        id: '002',
        name: 'test-2 - bla bla',
        description: 'description text missing',
        imgPath: `${__dirname}/../../images/2582_sub_wikiarts#90`,
        mockDataFile: '',
        size: 90,
    }, {
        id: '003',
        name: 'test-3 - . bla',
        description: 'this contains X Nodes, Y datas, Z cliques, K ranks',
        imgPath: `${__dirname}/../../images/2582_sub_wikiarts/`,
        mockDataFile: '',
        size: 2582,
    },
];


export const dataSet = process.env.NODE_ENV === 'development' ? devDataSets : prodDataSet;

export default dataSet;

