
const compareXY = (oldNode, newNode) => oldNode.x !== newNode._x || oldNode.y !== newNode._y;

/* const compareLinks = (oldNode, newNode) => {
    const oldLinksString = JSON.stringify(oldNode.links);
    const newLinksString = JSON.stringify(newNode.links);
    if (oldLinksString !== newLinksString) return true;
    return false;
}; */

export function compareAndClean(oldNodes, newNodes) {
    // console.log("stored data")
    // console.log(oldNodes)
    // console.log("new data to compare and clean")
    // console.log(newNodes)

    const nodes = {};
    let maxLabels = 0;
    Object.values(newNodes).forEach(node => (node.labels.length > maxLabels ? maxLabels = node.labels.length : null));

    Object.keys(newNodes).forEach((i) => {
        nodes[i] = Object.create(null);
        // console.log(i)
        // console.log(nodes[i])
        // console.log(newNodes[i])
        nodes[i].index = newNodes[i].index;
        nodes[i].name = newNodes[i].name;

        nodes[i].x = newNodes[i].x;
        nodes[i].y = newNodes[i].y;

        // nodes[i].links = newNodes[i].links;

        // nodes[i].label = newNodes[i].label;

        nodes[i].labels = newNodes[i].labels;
        while (nodes[i].labels.length < maxLabels) {
            nodes[i].labels.push(null);
        }

        if (Object.keys(oldNodes).length) {
            nodes[i].mPosition = compareXY(oldNodes[i], newNodes[i]);
            // nodes[i].mLinks = compareLinks(oldNodes[i], newNodes[i]);

            // if (nodes[i].mLinks === true) {
            // console.log("node.mLinks = true")
            // } else if (nodes[i].mLinks === false) {
            // console.log("nodes[i].mLinks === false")
            // }
            // console.log(nodes[i])
        }
    });


    return nodes;

    /*
    const oldNodesKeys = Object.keys(oldNodes)
    const newNodesKeys = Object.keys(newNodes)
    //if(oldNodesKeys.length !== newNodesKeys) throw new Error("compareAndClean failed - nodes # is now equal")

    newNodesKeys.map(i => {
        const newNode = newNodes[i]
        const oldNode = oldNodes[i]

        // set default
        newNode.mPosition = false
        newNode.mLinks = false

        // check x/y
        if(newNode.x !== oldNode.x) newNode.modiPosition = true
        if(newNode.y !== oldNode.y) newNode.modiPosition = true

        // ckeack links
        const oldLinks = oldNode.links
        const newLinks = newNode.links

        const oldLinksString = JSON.stringify(oldNode)
        const newLinksString = JSON.stringify(newLinks)

        if(oldLinksString !== newLinksString) newNode.mLinks = true
    })

    return newNodes */
}
