import { mockDataLength } from '../src/config/env';
import exampleNodes from '../mock/2582_sub_wikiarts';
import supercluster from 'supercluster';

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
const geoPoints = Object.values(nodes)
    .map((n, i) =>
        // https://tools.ietf.org/html/rfc7946#section-3.2
        ({
            type: 'Feature',
            geometry: {
            // https://tools.ietf.org/html/rfc7946#section-3.1.2
                type: 'Point',
                coordinates: [n.x, n.y],
            },
            properties: {
                id: n.index,
            },
        }));

// const kdtree = kdbush(points, n => n.x, n => n.y);
// const smallBox = kdtree.range(-3, -3, 3, 3)//.map(id => nodes[id])
// const middlebox = index.range(-10, -10, 10, 10).map(id => nodes[id])
// console.log(smallBox)
// console.log('finish kdtree');
console.time('supercluster');
const index = supercluster({
    radius: 40,
    maxZoom: 20,
});
index.load(geoPoints);
// index.getClusters([-180, -85, 180, 85], 2);
console.timeEnd('supercluster');
console.log('End');

