import fs from 'fs';
import exampleNodes from '../mock/2582_sub_wikiarts';


export default function () {
    const nodes = {}

    Object.values(exampleNodes).map(node => {
        nodes[node.index] = { index: node.index, x: node.x, y: node.y }
    });
    console.log(data)

    const file = JSON.stringify(data)

    fs.writeFile('./data.json', file, (err, data) => {
        console.log("write finish")
        if (err) console.log(err);
        console.log(data);
    });
}
