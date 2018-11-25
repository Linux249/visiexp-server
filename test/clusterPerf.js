import clusterfck from 'tayden-clusterfck';
import { mockDataLength } from '../src/config/env';
import exampleNodes from '../mock/2582_sub_wikiarts';
import kdbush from 'kdbush';

const nodes = {};

console.log(`nodes generated from mock #: ${mockDataLength}`);

// generate dummy nodes
for (let n = 0; n < mockDataLength; n += 1) {
    const i = n % mockDataLength;
    nodes[n] = exampleNodes[i];
    // add default cluster value (max cluster/zooming)
    nodes[n].cluster = mockDataLength;
}
const nodeDataLength = Object.keys(nodes).length;

// starting the clustering
console.log('start clustering');
const timeCluster = process.hrtime();

// points
const points = Object.values(nodes)
    .map((n, i) => {
        const point = [n.x, n.y]; // array with properties is ugly!
        point.id = i;
        point.x = n.x;
        point.y = n.y;
        return point;
    });

// const kdtree = kdbush(points, n => n.x, n => n.y);
// const smallBox = kdtree.range(-3, -3, 3, 3)//.map(id => nodes[id])
// const middlebox = index.range(-10, -10, 10, 10).map(id => nodes[id])
// console.log(smallBox)
// console.log('finish kdtree');
console.time('hccluster')
const hcCluster = clusterfck.hcluster(points);
console.timeEnd('hccluster')
// const hcCluster2 = clusterfck.hcluster(points);
// const hcCluster1 = clusterfck.hcluster(points);

// test behavior of ch clustering

// 1. same cluster with same points


// 2. same represents evry time? Yes, the first value of cluster is the represent and always the same
//const clusters = hcCluster.clusters(5);
//const clusters1 = hcCluster1.clusters(5);
//const clusters2 = hcCluster2.clusters(5);

// Q: How are represents are choosen?
// Q: Why are the id's of represents in cluster so low?

// Q: represent is always the one with lowest id of cluster members?
/* clusters.forEach((cluster, i) => {
    console.log('CLUSTER: ' + (i + 1))
    cluster.forEach(p => console.log(p.id));
}) */
// A: No, there are cluster members with lower id

const zoomStages = 20;
const nodesPerStage = Math.round(nodeDataLength / zoomStages) || 1; // small #nodes can result to 0
// loop through zoomstages where i is the cluster count
// TODO that should be also work with node.cluster = zoomstage
for (let i = 1; i <= nodeDataLength; i += nodesPerStage) {
    const clusters = hcCluster.clusters(i);
    // loop through each cluster
    clusters.forEach((cluster, i) => {
        // id of cluster represent
        const agentId = cluster[0].id;
        // tell the node that he is represent for cluster if he is not allready a represent of an smaller cluster count
        if (nodes[agentId].cluster > i) {
            // console.log(`i: ${i}`);
            nodes[agentId].cluster = i;
        }
        // console.log(`${i}. first items has id: ${clust[0].id}`)
    });
    console.log(`Building ${i} clusters finished`);
}
console.log('finish clusters');

const diffCluster = process.hrtime(timeCluster);
console.log(`end clustering: ${diffCluster[0] + diffCluster[1] / 1e9} seconds`);
// clusterStore = nodes;
// }

/*
    CLUSTERING - kmeans performance test
 */
const points2 = Object.values(nodes)
    .map((n, i) => {
        const point = [n.x, n.y]; // array with properties is ugly!
        return point;
    });

console.log('start clustering kmeans');
console.time('cluster kmeans');
const timeCluster2 = process.hrtime();


const clusterKmeans = clusterfck.kmeans(points2, 20);
const clusterKmeans1 = clusterfck.kmeans(points2, 20);
const clusterKmeans2 = clusterfck.kmeans(points2, 20);

const ids = [];
for (const key in nodes) {
    const id = nodes[key].cluster;
    !ids.includes(id) && ids.push(id);
}
console.log(ids);

const diffCluster2 = process.hrtime(timeCluster2);
console.timeEnd('cluster kmeans');
console.log(`end clustering kmeans: ${diffCluster2[0] + (diffCluster2[1] / 1e9)} seconds`);

console.log('end');

