import md5 from 'md5';
import { Router } from 'express';
import { db } from '../config/db_secret';

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


// TODO HTTP STATUS CODES
/* GET users listing. */
router.post('/login', async (req, res, next) => {
    console.log(req.body);
    const { user, password } = req.body;
    console.log({ user, password });
    if (!user) return res.status(504).json({ message: 'user missing' });
    if (!password) return res.status(504).json({ message: 'password missing' });
    try {
        connection.query('SELECT * FROM vis_users WHERE name = ? ', [user], (error, results, fields) => {
            console.log(results);
            if (error) return res.json(error);
            if (results.length > 0) {
                // check pw
                if (results[0].password !== md5(password)) return res.status(504).json({ message: 'Incorrect Password!' });
                res.json({ isAuth: true, id: results[0].id, user: results[0].name });
            } else {
                res.status(504).json({ message: 'Incorrect Username' });
            }
        });
    } catch (e) {
        return res.json(e);
    }
});


export default router;
