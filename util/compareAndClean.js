
export function compareAndClean(oldNodes, newNodes){
    const oldNodesKeys = Object.keys(oldNodes)
    const newNodesKeys = Object.keys(newNodes)
    if(oldNodesKeys.length !== newNodesKeys) throw new Error("compareAndClean failed - nodes # is now equal")

    newNodesKeys.map(i => {
        const newNode = newNodes[i]
        const oldNode = oldNodes[i]
        console.log(node)

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

    return newNodes
}