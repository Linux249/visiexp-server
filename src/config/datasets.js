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

// "/net/hcihome/storage/www-data-login-cv/visiexp/datasets/Wikiart_Elgammal_EQ_style_train.json
const prodDataSet = [
    {
        id: '001',
        name: 'Wikiart_Elgammal_EQ_style_train',
        description: 'description text missing',
        imgPath: '/net/hcihome/storage/www-data-login-cv/visiexp/datasets/raw/Wikiart_Elgammal/',
        size: 6336,

    }, {
        id: '002',
        name: 'Wikiart_Elgammal_EQ_style_test',
        description: 'description text missing',
        imgPath: '/net/hcihome/storage/www-data-login-cv/visiexp/datasets/raw/Wikiart_Elgammal/',
        size: 1584,
    }, {
        id: '003',
        name: 'Wikiart_Elgammal_EQ_genre_train',
        description: 'description text missing',
        imgPath: '/net/hcihome/storage/www-data-login-cv/visiexp/datasets/raw/Wikiart_Elgammal/',
        size: 14020,
    }, {
        id: '004',
        name: 'Wikiart_Elgammal_EQ_genre_test',
        description: 'description text missing',
        imgPath: '/net/hcihome/storage/www-data-login-cv/visiexp/datasets/raw/Wikiart_Elgammal/',
        size: 3500,
    }, {
        id: '005',
        name: 'Wikiart_Elgammal_EQ_artist_train',
        description: 'description text missing',
        imgPath: '/net/hcihome/storage/www-data-login-cv/visiexp/datasets/raw/Wikiart_Elgammal/',
        size: 5704,
    }, {
        id: '006',
        name: 'Wikiart_Elgammal_EQ_artist_test',
        description: 'description text missing',
        imgPath: '/net/hcihome/storage/www-data-login-cv/visiexp/datasets/raw/Wikiart_Elgammal/',
        size: 1403,
    }, {
        id: '007',
        name: 'AwA2_vectors_test',
        description: 'description text missing',
        imgPath: '/net/hcihome/storage/www-data-login-cv/visiexp/datasets/raw/AwA2/imgs',
        size: 7388,
    }, {
        id: '008',
        name: 'AwA2_vectors_train',
        description: 'description text missing',
        imgPath: '/net/hcihome/storage/www-data-login-cv/visiexp/datasets/raw/AwA2/imgs',
        size: 29551,
    }, {
        id: '009',
        name: 'STL_label_train',
        description: 'description text missing',
        imgPath: '/net/hcihome/storage/www-data-login-cv/visiexp/datasets/raw/STL_train/imgs',
        size: 5000,
    }, {
        id: '010',
        name: 'STL_label_test',
        description: 'description text missing',
        imgPath: '/net/hcihome/storage/www-data-login-cv/visiexp/datasets/raw/STL_test/imgs',
        size: 8000,
    },
    // {
    //     id: '009',
    //     name: 'BreakHis_tumor_train',
    //     description: 'description text missing',
    //     imgPath: '/net/hcihome/storage/www-data-login-cv/visiexp/datasets/raw/STL_label_test/',
    //     size: 119312,
    // },

    // {
    //     id: '002',
    //     name: 'Wikiart_artist49_images',
    //     description: 'this contains X Nodes, Y datas, Z cliques, K ranks',
    //     imgPath: '/net/hciserver03/storage/kschwarz/Documents/Data/Wikiart_artist49_images/',
    //     size: 16164,
    // }, {
    //     id: '003',
    //     name: 'AwA2_vectors_train',
    //     description: 'description text missing',
    //     imgPath: '/net/hci-storage02/groupfolders/compvis/datasets/Animals_with_Attributes2/single_folder_images2',
    //     size: 37372,
    // }, {
    //     id: '004',
    //     name: 'STL_label_train',
    //     description: 'description text missing',
    //     imgPath: '/net/hciserver03/storage/kschwarz/Documents/Data/STL/single_folder_images_train',
    //     size: 5000,
    // }, {
    //     id: '005',
    //     name: 'STL_label_test',
    //     description: 'description text missing',
    //     imgPath: '/net/hciserver03/storage/kschwarz/Documents/Data/STL/single_folder_images_test',
    //     size: 8000,
    // }, {
    //     id: '06',
    //     name: 'Bansky',
    //     description: 'description text missing',
    //     imgPath: '/net/hci-storage02/groupfolders/compvis/salang/Street-Art-Daten/Banksy-Datensatz',
    //     size: 4916,
    // },
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


export const dataSet = process.env.NODE_ENV === 'devel2opment' ? devDataSets : prodDataSet;

export default dataSet;

