

### Node schema
```
node = {
    index: number,  // identifier
    name: string,   // name of the picture,
    color: string,  // bedder group? or groupname/id?
    x: number,
    y: number
    neighbours: [{target: number, value: number]}] // list of links to other nodes - target = index of neighbour node
    size: ???
}
```