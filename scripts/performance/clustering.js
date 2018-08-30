'use-scrict';

const kdbush = require('kdbush');
const clusterfck = require('tayden-clusterfck');
import nodes from '../../mock/graph_6000';


const nodesLength = Object.keys(nodes).length;
const zoomStages = 20;
const nodesPerStage = Math.round(nodesLength / zoomStages);

// add default cluster value (max cluster/zooming)
Object.values(nodes).forEach(node => node.cluster = nodesLength);

// create data
const points = Object.values(nodes)
    .map((n, i) => {
        const point = [n.x, n.y]; // array with properties is ugly!
        point.id = i;
        point.x = n.x;
        point.y = n.y;
        return point;
    });


// Clustering with kmeans
// starting the clustering
console.log('start kmeans clustering');
const timeKmeansCluster = process.hrtime()

for (let i = 1; i <= nodesLength; i += nodesPerStage) {
    const stepTime = process.hrtime()
    const kMeanscluster = clusterfck.kmeans(points, i);
    const diffStepTime = process.hrtime(stepTime);
    console.log(`Building ${i} kmeans clusters finished. It tooks ${diffStepTime[0] + diffStepTime[1] / 1e9} seconds`);
}

const diffKmeansCluster = process.hrtime(timeKmeansCluster);
console.log(`end kmeans clustering: ${diffKmeansCluster[0] + diffKmeansCluster[1] / 1e9} seconds`)


// Clustering with a hirachical algo
// starting the clustering
console.log('start clustering');
const timeHcCluster = process.hrtime()

const hcCluster = clusterfck.hcluster(points);
console.log('finish hccluster');
console.log(hcCluster)


for (let i = 1; i <= nodesLength; i += nodesPerStage) {
    const stepTime = process.hrtime()
    hcCluster.clusters(i).forEach((cluster, i) => {
        const agentId = cluster[0].id;
        // the user can change the amount of clusters
        if (nodes[agentId].cluster > i) nodes[agentId].cluster = i;
    });
    const diffStepTime = process.hrtime(stepTime);
    console.log(`Building ${i} hc clusters finished. It tooks ${diffStepTime[0] + diffStepTime[1] / 1e9} seconds`);
}
console.log('finish clusters');

const diffHcCluster = process.hrtime(timeHcCluster);
console.log(`end clustering: ${diffHcCluster[0] + diffHcCluster[1] / 1e9} seconds`)

// const kdtree = kdbush(points, n => n.x, n => n.y)
// console.log("finish kdtree")

// const smallBox = kdtree.range(-3, -3, 3, 3)//.map(id => nodes[id])
// console.log(smallBox)
// const middlebox = index.range(-10, -10, 10, 10).map(id => nodes[id])
