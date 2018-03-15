

/*
   * jedem Knoten werden seine Nachbarn mitgeteilt.
   * die Nachbarn werden mit der Gewichtung als array gespeichert.
 */


export function mergeLinksToNodes(nodes, links){
    console.log("merge started")
    const nodesNew = [...nodes]
    links.map(link => {
        if(!nodesNew[link.source].neighbours) nodesNew[link.source].neighbours = []
        nodesNew[link.source].neighbours.push({target: link.target, value: link.value/10})
    })
    return nodesNew
}
