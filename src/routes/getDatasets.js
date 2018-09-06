import {dataSet} from "../config/dataSets";


export default async (req, res) => {
    res.json(dataSet.map(set => ({name: set.name, discription: set.description})))
};
