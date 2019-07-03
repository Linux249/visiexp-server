import fetch from 'node-fetch';
import { promises as fsP } from 'fs';
import { getRandomColor } from '../util/getRandomColor';
import { buildLabels } from '../util/buildLabels';
import { mockDataLength } from '../config/env';
import { pythonApi } from '../config/pythonApi';
import dataSets, { dataSet } from '../config/datasets';
import path from 'path';

const exampleNodes = (process.env.NODE_ENV === 'development')
    ? require('../../mock/2582_sub_wikiarts').default
    : {};

// on: getNodes
export default socket => async (data) => {
    console.log('getNodes');
    // console.log(typeof data)
    // console.log(data)

    // the nodes object for mutating differently in dev mode
    let nodes = {};
    let categories = [];
    const {
        datasetId, userId, count,
    } = data;
    console.log({
        datasetId, userId, count,
    });
    const dataset = dataSets.find(e => e.id === datasetId);
    if (!dataset) {
        // TODO Error handling, maybe a error emit
        console.error('No valid dataset');
        console.error({ dataset, datasetId, dataSets });
        return socket.emit('Error', { message: 'Invalid datasetId' });
    }

    // before they should be cleaned and compared with maybe old data
    // const time = process.hrtime();
    // updatedNodes = compareAndClean({}, updatedNodes);
    // const diff = process.hrtime(time);
    // console.log(`compareAndClean took ${diff[0] + diff[1] / 1e9} seconds`);


    if (process.env.NODE_ENV === 'development') {
        console.log(`nodes generated from mock #: ${mockDataLength}`);

        // generate dummy nodes
        for (let n = 0; n < mockDataLength; n += 1) {
            const i = n % mockDataLength;
            nodes[n] = exampleNodes[i];
        }

        // dummy category's
        categories = ['kat1', 'kat2', 'kat3'];

        // generate dummy labels
        const n = categories.length;
        Object.values(nodes).forEach((node) => {
            node.labels = [];
            for (let i = 0; i < n; i += 1) node.labels.push(Math.random() >= 0.5 ? `${categories[i]}_label_${i}` : null);
        });
    } else {
        // read initial #count nodes
        console.log('request dataset nodes');

        // console.log({ name, count });
        // if (!imgPath || !count) return next(new Error('keine gültige id oder name'));
        const size = dataset.size < 10000 ? dataset.size : 10000;
        const fileName = `${dataset.name}#${size}.json`;
        const filePath = path.join(__dirname, '/../../../images/', fileName);
        let files = await fsP.readFile(filePath);
        files = files.slice(0, count);

        // todo remove after real files
        files.forEach((f, i) => {
            nodes[i] = {
                index: i,
                name: f,
                x: (Math.random() * 40) - 20,
                y: (Math.random() * 40) - 20,
            };
        });
    }

    // simulate missing nodes
    /* if (Object.keys(nodes).length < dataset.count) {
        let n = Object.keys(nodes).length; // maybe n = 1000, count = 2000
        while (n < dataset.count) {
            nodes[n - 1] = {
                index: n - 1,
                x: (Math.random() * 40) - 20,
                y: (Math.random() * 40) - 20,
                name: `mock node: ${n - 1}`,

            };
            n += 1;
        }
    } */

    const nodeDataLength = Object.keys(nodes).length;
    socket.emit('totalNodesCount', { count: nodeDataLength });

    // build and sending back labels (- )labels are scanned on server-side)
    socket.emit('updateCategories', { labels: buildLabels(categories, nodes) });
    console.log('labels are send');


    // saving used colorKeys
    const colorKeyHash = {};
    const timeStartSendNodes = process.hrtime();

    // doing everything for each node and send it back
    Object.values(nodes).map(async (node, index) => {
        // add index to nodes
        // todo check if not allready in JSON
        node.index = index;

        // get a unique color for each node as a key
        while (true) {
            const colorKey = getRandomColor();
            if (!colorKeyHash[colorKey]) {
                node.colorKey = colorKey;
                colorKeyHash[colorKey] = node;
                break;
            }
        }

        // TODO in Python?
        if (!node.clique) node.clique = [1, 2, 3];
        if (!node.rank && node.rank !== 0) node.rank = 0.5;
    });
    const diffStartSendNodes = process.hrtime(timeStartSendNodes);
    // console.log(a)
    socket.emit('sendAllNodes', nodes);
    console.log(`all ${nodeDataLength} nodes send after: ${diffStartSendNodes[0] + (diffStartSendNodes[1] / 1e9)}s`);
    // socket.emit('updateKdtree', kdtree)

    // trigger init call on python backend
    console.log('get nodes from python');
    const time2 = process.hrtime();

    // todo find proper error handling for missing python server
    try {
        const res = await fetch(`${pythonApi}/nodes`, {
            method: 'POST',
            header: { 'Content-type': 'application/json' },
            body: JSON.stringify({
                dataset: dataset.name,
                count,
                userId,
                init: true,
                // tripel,
            }),
        });
        if (res.ok) {
            console.log(await res.text());
            const data = await res.json();
            nodes = data.nodes;
            categories = data.categories;
            socket.emit('updateCategories', { labels: buildLabels(categories, nodes) });
            return socket.emit('updateEmbedding', { nodes });
        }
        console.error('fetch works but response is not working - why?');
        console.log(res);

        // there are only nodes comming back from here
    } catch (err) {
        // todo bedder error handling, return and emit to inform user
        console.error('error - get nodes from python - error');
        console.error(err);
    }
    const diff2 = process.hrtime(time2);
    console.log(`getNodesFromPython took ${diff2[0] + (diff2[1] / 1e9)} seconds`);
};

// THE OLD CLUSTERING
// add default cluster value (max cluster/zooming)
// Object.values(nodes).forEach(node => node.cluster = nodeDataLength);

// starting the clustering
// console.log('start clustering');
// const timeCluster = process.hrtime();
// const points = Object.values(nodes)
//     .map((n, i) => {
//         const point = [n.x, n.y]; // array with properties is ugly!
//         point.id = i;
//         point.x = n.x;
//         point.y = n.y;
//         return point;
//     });

// const kdtree = kdbush(points, n => n.x, n => n.y)
// console.log("finish kdtree")

// const smallBox = kdtree.range(-3, -3, 3, 3)//.map(id => nodes[id])
// console.log(smallBox)
// const middlebox = index.range(-10, -10, 10, 10).map(id => nodes[id])
// const hcCluster = clusterfck.hcluster(points);
// console.log('finish hccluster');
//
// const zoomStages = 20;
// const nodesPerStage = Math.round(nodeDataLength / zoomStages) || 1; // small #nodes can result to 0
// // loop trough the zoomstages
// for (let i = nodesPerStage; i <= nodeDataLength; i += nodesPerStage) {
//     hcCluster.clusters(i).forEach((cluster) => {
//         const agentId = cluster[0].id; // first value in cluster is represent
//         if (nodes[agentId].cluster > i) nodes[agentId].cluster = i;
//     });
//     console.log(`Building ${i} clusters finished`);
// }
// console.log('finish clusters');
//
// const diffCluster = process.hrtime(timeCluster);
// console.log(`end clustering: ${diffCluster[0] + (diffCluster[1] / 1e9)} seconds`);
// // clusterStore = nodes;
// // }
//
// /*
//     CLUSTERING - kmeans performance test
//  */
// const points2 = Object.values(nodes)
//     .map((n, i) => {
//         const point = [n.x, n.y]; // array with properties is ugly!
//         return point;
//     });
//
// console.log('start clustering kmeans');
// console.time('cluster kmeans');
// const timeCluster2 = process.hrtime();


// const cluster2 = clusterfck.kmeans(points2, 20);


// const diffCluster2 = process.hrtime(timeCluster2);
// console.timeEnd('cluster kmeans');
// console.log(`end clustering kmeans: ${diffCluster2[0] + (diffCluster2[1] / 1e9)} seconds`);


/*
// calc kernel density estimation
const timeKde = process.hrtime();


const x = [];
const y = [];
Object.values(nodes).forEach((node) => {
   x.push(node.x);
   y.push(node.y);
});

const out = kde2d(x, y, {
   xMin: -20,
   xMax: 20,
   yMin: -20,
   yMax: 20,
   // 'h': [ 0.01, 255 ], // bandwith - schätze damit kann man die range der dichte angeben
   // 'n': 5 // default 25 - was ist das
});
// console.log(out)
// console.log(out.z)


const diffKde = process.hrtime(timeKde);
console.log(`end kde: ${diffKde[0] + diffKde[1] / 1e9} seconds`);
*/


// THE OLD IMAGE LOD WAY
/*
        node.pics = Object.create(null);
        // node.url = `/images_3000/${node.name}.jpg`;

        try {

            // new architecture 2
            if (dataset.reszied) {
                await Promise.all(imgSizes.map(async (size) => {
                    const filePath = path.join(imgPath, dataset.name, size.toString(), `${node.name}.png`);
                    console.log({ filePath });
                    node.pics[size] = await sharp(filePath)
                        .raw()
                        .toBuffer({ resolveWithObject: true })
                        .catch((e) => {
                            console.warn(filePath);
                            throw Error(e);
                        });
                }));
            } else {
                await Promise.all(imgSizes.map(async (size) => {
                    const filePath = path.join(dataset.imgPath, `${node.name}.jpg`);
                    // console.log({ filePath });
                    node.pics[size] = await sharp(filePath)
                        .resize(size, size, { fit: 'inside' })
                        // .png()
                        .ensureAlpha()
                        .raw()
                        .toBuffer({ resolveWithObject: true })
                        .catch((e) => {
                            console.log(filePath);
                            console.log(`exists?: ${fs.existsSync(filePath)}`);
                            throw Error(e);
                        });
                }));
            }

            // scaledPicsHash[node.name] = node.pics;

            // new archetecture 1
            /!* await Promise.all(arr.map(async (size) => {
                        const buffer = await sharp(file)
                            .resize(size, size)
                            .max()
                            .toFormat('jpg')
                            .toBuffer();
                        node.pics[size] = `data:image/jpg;base64,${buffer.toString('base64')}`; // save for faster reload TODO test with lots + large image
                    })); *!/
            // }

            /!*socket
                .compress(false) // important - otherwise it's waiting for all nodes
            // .binary(true)    // todo check what this could be
                .emit('node', node);

            if ((index + 1) % 100 === 0) {
                const diffStartSendNodes = process.hrtime(timeStartSendNodes);
                console.log(`node is send: ${node.name} #${node.index} after: ${diffStartSendNodes[0] + (diffStartSendNodes[1] / 1e9)}s`);
                // socket.compress(false).emit('nodesCount', node.index);
            }*!/
        } catch (err) {
            console.log('Node was not send cause of missing image - how to handle?');
            console.error(err);
            console.log(node.index);
            console.log(node);
        } */
// });
// )

// .then(() => {

// });
// console.log(nodes);

// const wstream = fs.createWriteStream(`${dataset.name}_${mockDataLength}.bin`);
//
//
// Object.values(nodes).map(n => Object.values(n.pics).map((p) => {
//     wstream.write(Buffer.from([p.info.width, p.info.height]));
//     // wstream.write(p.info.height);
//     wstream.write(p.data);
//     console.log(p.info.width, p.info.height, p.data.length);
// }));
// wstream.end();
// wstream.on('finish', () => {
//     console.log('All writes are now complete.');
//     console.log(wstream.path)
// });
// };
