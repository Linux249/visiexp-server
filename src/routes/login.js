import { Router } from 'express';
import { db } from '../config/db';

const router = Router();

const mysql = require('mysql');

const connection = mysql.createConnection({
    host: db.host,
    user: db.user,
    password: db.password,
    database: db.db,
});

connection.connect((err) => {
    if (!err) {
        console.log('Database is connected ... nn');
    } else {
        console.log('Error connecting database ... nn');
        console.log(err);
    }
});


/* GET users listing. */
router.post('/login', async (req, res, next) => {
    console.log(req.body);
    const { user, password } = req.body;
    console.log({ user, password });
    if (!user) return res.status(504).json({ message: 'user missing' });
    if (!password) return res.status(504).json({ message: 'password missing' });
    return res.json({ users: [{ name: 'Timmy' }] });
});


export default router;
