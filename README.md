

### Node schema
```
node = {
    index: number,  // identifier
    name: string,   // name of the picture,
old    color: string,  // bedder group? or groupname/id?
new    label: string,  // bedder group? or groupname/id?
    x: number,
    y: number
old    neighbours: [{target: number, value: number]}] // list of links to other nodes - target = index of neighbour node
new    neighbours: [{index: number, strength: number]}] // list of links to other nodes - target = index of neighbour node
}
```