// https://jsperf.com/interationobject/1
const n = 3000;
const payloadIndex = { nodes: {} };
const payload = { nodes: {} };

const nodes1 = {};
const nodes2 = {};
const nodes3 = {};

for (let i = 1; i < n; i++) {
    const x = 2;
    const y = 3;
    payload.nodes[i] = { x: x - 1, y: y - 1 };
    payloadIndex.nodes[i] = { x: x + 1, y: y + 1, index: i };

    nodes1[i] = { x, y, index: i };
    nodes2[i] = { x, y, index: i };
    nodes3[i] = { x, y, index: i };
}


// What is faster

// 1. update nodes (1) with valueS() and index in data
const timeStartNodes1 = process.hrtime();
Object.values(payloadIndex.nodes).forEach((node) => {
    nodes1[node.index].x = node.x;
    nodes1[node.index].y = node.y;
});
const diffNodes1 = process.hrtime(timeStartNodes1);
console.log(`end nodes1: ${diffNodes1[0] + diffNodes1[1] / 1e9} seconds`);

// 2. update nodes via entries()
const timeStartNodes2 = process.hrtime();
Object.entries(payload.nodes).forEach(([key, node]) => {
    nodes2[key].x = node.x;
    nodes2[key].y = node.y;
});
const diffNodes2 = process.hrtime(timeStartNodes2);
console.log(`end nodes2: ${diffNodes2[0] + diffNodes2[1] / 1e9} seconds`);

// 1. update nodes like 1 but with rest the vars in node
const timeStartNodes3 = process.hrtime();
Object.values(payloadIndex.nodes).forEach(({ index, x, y }) => {
    nodes1[index].x = x;
    nodes1[index].y = y;
});
const diffNodes3 = process.hrtime(timeStartNodes3);
console.log(`end nodes3: ${diffNodes3[0] + diffNodes3[1] / 1e9} seconds`);


// 1. update nodes like 1 but with rest the vars in node
const timeStartNodes4 = process.hrtime();
Object.keys(payloadIndex.nodes).forEach((key) => {
    nodes1[key].x = payloadIndex.nodes[key].x;
    nodes1[key].y = payloadIndex.nodes[key].y;
});
const diffNodes4 = process.hrtime(timeStartNodes4);
console.log(`end nodes4: ${diffNodes4[0] + diffNodes4[1] / 1e9} seconds`);
