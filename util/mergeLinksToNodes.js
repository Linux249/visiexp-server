

/*
   * jedem Knoten werden seine Nachbarn mitgeteilt.
   * die Nachbarn werden mit der Gewichtung als array gespeichert.
 */


export function mergeLinksToNodes(nodes, links){
    console.log("merge started")
    links.map(link => {
        if(!nodes[link.source].neighbours) nodes[link.source].neighbours = []
        nodes[link.source].neighbours.push({target: link.target, value: link.value})
    })
    return nodes
}
