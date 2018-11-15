### install

#### clone
```
git clone https://github.com/Linux249/bachelor-node.git myNodeProject
cd myNodeProject
npm i
```

Nun den `images` folder noch kopieren und dann

#### starten
```
python server.py
npm start
```

Der dev modus liefert 100 Bilder mit zufälligen x,y-coords
```
npm start dev
```

Nun ist die App unter `localhost:3000` erreichbar


### Node schema
```
node = {
    index: number,  // identifier
    name: string,   // name of the picture,
    label: string,  // group name
    x: number,
    y: number,
    links: {
        10: 0.5     // key is target-index and value is strength
    }, // list of links to other nodes - target = index of neighbour node
    mPosition: boolean,     // position modified?
    mLinks: boolean,        // links modified?
}
```

### TODO 
- client id mitsenden, immer, datensatz erstmal auch
