import fetch from 'node-fetch';
// import { promises as fsP } from 'fs';
import { getRandomColor } from '../util/getRandomColor';
import { buildLabels } from '../util/buildLabels';
import { pythonApi } from '../config/pythonApi';
import dataSets from '../config/datasets';
import { devMode } from '../config/env';
// import path from 'path';
// import { maxNodesCount } from '../config/maxNodesCount';
// import jsonNodes from './../../mock/AwA2_vectors_test.json';

// const exampleNodes = devMode ? require('../../mock/2582_sub_wikiarts').default : {};

// on: getNodes
export default socket => async (data) => {
    console.log('getNodes');
    // console.log(typeof data)
    // console.log(data)

    const nodes = {}; // the nodes object for mutating differently in dev mode
    let categories = [];
    let time = 0;
    let rangeX;
    let rangeY;
    let minX = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    const {
        datasetId, userId, count, init,
    } = data;
    console.log({
        datasetId, userId, count, init,
    });
    const dataset = dataSets.find(e => e.id === datasetId);
    if (!dataset) {
        // TODO Error handling, maybe a error emit
        console.error('No valid dataset');
        console.error({ dataset, datasetId, dataSets });
        return socket.emit('Error', { message: 'Invalid datasetId' });
    }

    try {
        console.log('get init nodes from python');
        const time2 = process.hrtime();

        // check counts of all datasets
        // await Promise.all(dataSets.map(async (d) => {
        //     const all = await fetch(`${pythonApi}/getNodes?dataset=${d.name}`).then(res => res.json());
        //     const length = Object.keys(all.nodes).length;
        //     console.log(d.name, length);
        // }));

        const jsonAll = devMode
            ? require('./../../mock/AwA2_vectors_test.json')
            : await fetch(`${pythonApi}/getNodes?dataset=${dataset.name}`).then(res => res.json());

        // Object.keys(jsonAll).forEach((k) => {
        //     console.log(k);
        // });
        const jsonNodes = jsonAll.nodes;
        const keys = Object.keys(jsonNodes);
        console.log(`get #${keys.length} nodes from init`);

        keys.forEach((key) => {
            // maybe count is higher but than max nodes in dataset will automatically the highest
            if (jsonNodes[key].idx < count) {
                nodes[jsonNodes[key].idx] = {
                    x: jsonNodes[key].x,
                    y: jsonNodes[key].y,
                    name: key,
                    label: jsonNodes[key].label,
                    labels: [],
                    index: jsonNodes[key].idx,
                };
                if (jsonNodes[key].x > maxX) maxX = jsonNodes[key].x;
                if (jsonNodes[key].x < minX) minX = jsonNodes[key].x;
                if (jsonNodes[key].y > maxY) maxY = jsonNodes[key].y;
                if (jsonNodes[key].y < minY) minY = jsonNodes[key].y;
            }
        });
        rangeX = Math.abs(maxX - minX);
        rangeY = Math.abs(maxY - minY);
        console.log({
            minX,
            maxX,
            minY,
            maxY,
            rangeX,
            rangeY,
        });
        Object.keys(nodes).forEach((k) => {
            nodes[k].x = (((nodes[k].x - minX) / rangeX) * 30) - 15;
            nodes[k].y = (((nodes[k].y - minY) / rangeY) * 30) - 15;
        });
        const diff2 = process.hrtime(time2);
        time = diff2[0] + (diff2[1] / 1e9);
        console.log(`get init nodes from json took ${time} seconds`);
    } catch (e) {
        console.error('Error while getting nodes from python/json files');
        console.error(e.message);
        console.error(e);
        socket.emit('error', 'Failed to load init data from json file.');
    }

    const nodesLength = Object.keys(nodes).length;
    socket.emit('totalNodesCount', { count: nodesLength });

    // before they should be cleaned and compared with maybe old data
    // const time = process.hrtime();
    // updatedNodes = compareAndClean({}, updatedNodes);
    // const diff = process.hrtime(time);
    // console.log(`compareAndClean took ${diff[0] + diff[1] / 1e9} seconds`);

    if (devMode) {
        // dummy category's
        categories = ['kat1', 'kat2', 'kat3'];
        const c = categories.length;

        // generate dummy nodes
        for (let n = 0; n < nodesLength; n += 1) {
            // generate dummy labels
            nodes[n].labels = [];
            for (let i = 0; i < c; i += 1) {
                nodes[n].labels.push(Math.random() >= 0.5 ? `${categories[i]}_label_${i}` : null);
            }
        }

        // build and sending back labels (- )labels are scanned on server-side)
        socket.emit('updateCategories', { labels: buildLabels(categories, nodes) });
        console.log('updateCategories: labels are send');
        socket.emit('initPython', { done: true });
    } else {
        // read initial #count nodes
        // console.log('request dataset nodes');

        // console.log({ name, count });
        // if (!imgPath || !count) return next(new Error('keine gültige id oder name'));
        // const size = dataset.size < maxNodesCount ? dataset.size : maxNodesCount;
        // const fileName = `${dataset.name}#${size}.json`;
        // const filePath = path.join(__dirname, '/../../images/', fileName);
        // console.log(filePath);
        // const rawData = await fsP.readFile(filePath);
        // let imgNames = JSON.parse(rawData);
        // console.log(imgNames);
        // imgNames = imgNames.slice(0, count);

        // todo remove after real files
        // imgNames.forEach((f, i) => {
        //     nodes[i] = {
        //         index: i,
        //         name: f,
        //         x: (Math.random() * 40) - 20,
        //         y: (Math.random() * 40) - 20,
        //         labels: [],
        //     };
        // });
        try {
            const time1 = process.hrtime();
            fetch(`${pythonApi}/nodes`, {
                method: 'POST',
                header: { 'Content-type': 'application/json' },
                body: JSON.stringify({
                    dataset: dataset.name,
                    count,
                    userId,
                    init,
                    nodes,
                    // tripel,
                }),
            }).then(async (res) => {
                if (res.ok) {
                    try {
                        const data2 = await res.json();
                        // Object.keys((k) => {
                        //     nodes[k].x = data.nodes[k].x;
                        //     nodes[k].y = data.nodes[k].y;
                        // });
                        if (data2.categories) categories = data2.categories;
                        socket.emit('updateCategories', { labels: buildLabels(categories, nodes) });
                        const diff1 = process.hrtime(time1);
                        time = diff1[0] + (diff1[1] / 1e9);
                        if (data2.nodes) socket.emit('updateEmbedding', { nodes: data2.nodes, time });
                        socket.emit('initPython', data2);
                        // return socket.emit('updateEmbedding', { nodes });
                        // return socket.emit('sendAllNodes', nodes);
                    } catch (err) {
                        // JSON Error here?
                        console.error('fetch works but response is not working - why?');
                        console.log(err);
                        console.log(res);
                        // socket.emit('sendAllNodes', nodes);
                        socket.emit('Error', { message: err.message, err, res });
                    }
                }
            });
            // there are only nodes comming back from here
        } catch (err) {
            // todo bedder error handling, return and emit to inform user
            console.error('error - get nodes from python - error');
            console.error(err);
            socket.emit('Error', { message: 'error - get nodes from python - error', err });
            // todo remove after right loading from file
            // const diffStartSendNodes = process.hrtime(timeStartSendNodes);
            // console.log(`all ${nodeDataLength} nodes send after: ${diffStartSendNodes[0] + (diffStartSendNodes[1] / 1e9)}s`);
            // return socket.emit('sendAllNodes', nodes);
        }
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

    // saving used colorKeys
    const colorKeyHash = {};
    // const timeStartSendNodes = process.hrtime();

    // doing everything for each node and send it back
    Object.values(nodes).map(async (node) => {
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

    // socket.emit('sendAllNodes', nodes);
    // const diffStartSendNodes = process.hrtime(timeStartSendNodes);
    // console.log(`all ${nodeDataLength} nodes send after: ${diffStartSendNodes[0] + (diffStartSendNodes[1] / 1e9)}s`);

    // socket.emit('updateKdtree', kdtree)

    // trigger init call on python backend

    console.log('sendAllNodes');
    return socket.emit('sendAllNodes', { nodes, time });
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
