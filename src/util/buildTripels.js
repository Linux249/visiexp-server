export default (nodes) => {
    const tripel = {}
    for(let i in nodes) {
        const node = nodes[i]
        if(node.positives.length || node.negatives.length) {
            tripel[node.index] = {
                p: node.positives.map(n => n.index),
                n: node.negatives.map(n => n.index)
            }
        }
    }
    return tripel
}