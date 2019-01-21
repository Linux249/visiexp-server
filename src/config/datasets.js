/*
   {
        id: String, unique id
        name: String, Name that is shown to the user
        description: String, also shown to the user
        imgPath: String, absolute path to dicts
        mockDataFile: '',
        count: Number, use only if want to reduce the dataset to the first n elements. Most time creating a new one is the bedder way

    }
 */

// dev mode
const devDataSets = [
    {
        id: '001',
        name: 'test-1 - 2582_sub_wikiarts',
        description: 'this contains X Nodes, Y datas, Z cliques, K ranks',
        imgPath: `${__dirname}/../../images/2582_sub_wikiarts`,
        mockDataFile: '',
        count: 50,

    },
    /*{
        id: '002',
        name: 'test-2',
        description: 'this contains X Nodes, \n Y datas, Z cliques, \n K ranks',
        imgPath: `${__dirname}/../../images/images_3000/`,
        mockDataFile: '',
        count: 100,
    },
    {
        id: '003',
        name: 'test-3',
        description: 'this contains Xqwewqewqeqweqwewqeqwewqeqweqwewqe Nodes, Y datas, Z cliques, K ranks',
        imgPath: `${__dirname}/../../images/2582_sub_wikiarts/`,
        mockDataFile: '',
    },*/

];


const prodDataSet = [
    {
        id: '001',
        name: 'Katjas datensatz',
        description: 'this contains X Nodes, Y datas, Z cliques, K ranks',
        imgPath: 'Kompletter pfad zu Bildern',
    },
];

export const dataSet = process.env.NODE_ENV === 'production' ? prodDataSet : devDataSets;

