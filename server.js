const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // כדי לאפשר בקשות מדומיין שונה (בפיתוח)
const { v4: uuidv4 } = require('uuid'); // לייצור ID ייחודי להזמנות
const db = require('./db'); // ייבוא הגדרות מסד הנתונים
const jwt = require('jsonwebtoken');
const secretKey = 'jbh32tegr54';

const app = express();
const port = 3000; // או כל פורט אחר שתבחר

app.use(bodyParser.json());
app.use(cors());

// --- מאגר נתונים זמני בזיכרון ---
const suppliers = [];
const orders = [];

// --- API עבור ספקים (כפי שנקרא מצד הלקוח) ---

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (token == null) return res.sendStatus(401); // אין טוקן

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.sendStatus(403); // טוקן לא תקין
        req.user = user; // מידע המשתמש המפוענח מהטוקן
        next(); // המשך ל-route הבא
    });
};

// רישום ספק חדש
app.post('/api/suppliers/register', async(req, res) => {
    const { companyName, phone, representativeName, goods, username, password} = req.body;

    if (!companyName || !phone || !representativeName || !username || !password || !Array.isArray(goods) || goods.length === 0) {
        return res.status(400).json({ message: 'יש למלא את כל השדות.' });
    }

   
    try {
        // 1. בדיקה אם שם המשתמש כבר קיים
        const [existingUsers] = await db.execute('SELECT * FROM suppliers WHERE username = ?', [username]);
        if (existingUsers.length > 0) {
            return res.status(409).json({ message: 'שם משתמש זה כבר קיים.' });
        }

        const supplierId = uuidv4();

        // 2. הכנסת פרטי הספק לטבלת 'suppliers'
        await db.execute(
            'INSERT INTO suppliers (id, companyName, phone, representativeName, username, password) VALUES (?, ?, ?, ?, ?, ?)',
            [supplierId, companyName, phone, representativeName, username, password] // **חשוב: יש להצפין סיסמה במערכת אמיתית!**
        );

        // 3. הכנסת רשימת הסחורות לטבלת 'goods' (תצטרך מבנה טבלה מתאים)
        for (const good of goods) {
            await db.execute(
                'INSERT INTO goods (supplierId, name, price, minQuantity) VALUES (?, ?, ?, ?)',
                [supplierId, good.name, good.price, good.minQuantity]
            );
        }


        const user = { username: username, id: supplierId };
        const token = jwt.sign(user, secretKey, { expiresIn: '1h' }); // צור טוקן עם זמן תפוגה
        res.status(201).json({ message: 'הספק נרשם בהצלחה.', token });
    } catch (error) {
        console.error('שגיאה ברישום ספק:', error);
        res.status(500).json({ message: 'שגיאה ברישום הספק בשרת.' });
}
});

// כניסת ספק קיים (לצורך הדגמה פשוטה)
app.post('/api/suppliers/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const [users] = await db.execute('SELECT * FROM suppliers WHERE username = ?', [username]);

        if (users.length === 0) {
            return res.status(401).json({ message: 'שם משתמש או סיסמה לא נכונים.' });
        }

        const user = users[0];
        // **חשוב: השווה סיסמה מוצפנת כאן (למשל, באמצעות bcrypt)**
        if (user.password === password) {
            const userPayload = { username: user.username, id: user.id };
            const token = jwt.sign(userPayload, secretKey, { expiresIn: '1h' }); // צור טוקן עם זמן תפוגה
            res.json({ message: 'התחברת בהצלחה.', token });
        } else {
            res.status(401).json({ message: 'שם משתמש או סיסמה לא נכונים.' });
        }

    } catch (error) {
        console.error('שגיאה בכניסה:', error);
        res.status(500).json({ message: 'שגיאה בכניסה לשרת.' });
    }
});

// צפייה בהזמנות של ספק מסוים (דורש אימות במערכת אמיתית)
app.get('/api/suppliers/orders', authenticateToken, async (req, res) => {
    try {
        const supplierId = req.user.id;

        const [ordersData] = await db.execute(`
            SELECT
                o.id AS orderId,
                o.status
            FROM
                orders o
            WHERE
                o.supplierId = ?
            ORDER BY
                o.id
        `, [supplierId]);

        const ordersWithProducts = await Promise.all(ordersData.map(async (order) => {
            const [productsData] = await db.execute(`
                SELECT
                    oi.productId,
                    oi.quantity
                FROM
                    order_items oi
                WHERE
                    oi.orderId = ?
            `, [order.orderId]);

            return {
                status: order.status,
                products: productsData.map(product => ({
                    productId: product.productId,
                    quantity: product.quantity
                }))
            };
        }));
        console.log(ordersWithProducts)
        res.json(ordersWithProducts);

    } catch (error) {
        console.error('שגיאה בשליפת הזמנות ומוצרים (נסיון נוסף):', error);
        res.status(500).json({ message: 'שגיאה בשליפת הזמנות ספק בשרת.' });
    }
});
    // כאן יש לבצע אימות של הספק באמצעות הטוקן או מזהה אחר
    /*const supplierUsername = req.headers.authorization ? localStorage.getItem('supplierUsername') : null; // דוגמה פשוטה - לא מאובטח

    try {
        const [suppliersData] = await db.execute('SELECT id FROM suppliers WHERE username = ?', [supplierUsername]);
        if (suppliersData.length === 0) {
            return res.status(404).json({ message: 'ספק לא נמצא.' });
        }
        const supplierId = suppliersData[0].id;

        const [ordersData] = await db.execute('SELECT * FROM orders WHERE supplierId = ?', [supplierId]);
        res.json(ordersData);
    } catch (error) {
        console.error('שגיאה בצפייה בהזמנות ספק:', error);
        res.status(500).json({ message: 'שגיאה בצפייה בהזמנות ספק בשרת.' });
    }
    res.json(supplierOrders);
});*/

// אישור הזמנה על ידי הספק
app.post('/api/suppliers/orders/:orderId/approve', authenticateToken, async(req, res) => {
    const { orderId } = req.params;
    const supplierIdFromToken = req.user.id; // קבלת ID הספק מהטוקן

    try {
        const [ordersData] = await db.execute('SELECT status, supplierId FROM orders WHERE id = ?', [orderId]);
        if (ordersData.length === 0) {
            return res.status(404).json({ message: 'הזמנה לא נמצאה.' });
        }

        const order = ordersData[0];
        if (order.supplierId !== supplierIdFromToken) {
            return res.status(403).json({ message: 'אין לך הרשאה לאשר הזמנה זו.' });
        }

        if (order.status !== 'pending') {
            return res.status(400).json({ message: 'לא ניתן לאשר הזמנה שכבר טופלה.' });
        }

        await db.execute('UPDATE orders SET status = ? WHERE id = ?', ['processing', orderId]);
        res.json({ message: 'ההזמנה אושרה והועברה לסטטוס "בתהליך".' });

        // כאן אפשר לשלוח התראה לבעל המכולת על אישור ההזמנה
    } catch (error) {
        console.error('שגיאה באישור הזמנה:', error);
        res.status(500).json({ message: 'שגיאה באישור הזמנה בשרת.' });
    }
});

// --- API עבור בעל המכולת ---
// קבלת רשימת כל הספקים
app.get('/api/grocery/suppliers', async (req, res) => {
    try {
        const [suppliers] = await db.execute('SELECT id, companyName FROM suppliers');
        res.json(suppliers);
    } catch (error) {
        console.error('שגיאה בשליפת רשימת הספקים:', error);
        res.status(500).json({ message: 'שגיאה בשליפת רשימת הספקים מהשרת.' });
    }
});

// קבלת רשימת מוצרים של ספק מסוים
app.get('/api/grocery/suppliers/:supplierId/goods', async (req, res) => {
    const { supplierId } = req.params;
    try {
        const [goods] = await db.execute('SELECT name, price FROM goods WHERE supplierId = ?', [supplierId]);
        res.json(goods);
    } catch (error) {
        console.error('שגיאה בשליפת מוצרי הספק:', error);
        res.status(500).json({ message: 'שגיאה בשליפת מוצרי הספק מהשרת.' });
    }
});

// הזמנת סחורה מספק
app.post('/api/grocery/orders', async(req, res) => {
    const { supplierId, items } = req.body; // items יכול להיות מערך של { productId, quantity }

    try {
        const [suppliersData] = await db.execute('SELECT id FROM suppliers WHERE id = ?', [supplierId]);
        if (suppliersData.length === 0) {
            return res.status(404).json({ message: 'ספק לא קיים.' });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'יש לציין פריטים להזמנה.' });
        }

        const orderId = uuidv4();
        const orderDate = new Date();
        await db.execute(
            'INSERT INTO orders (id, supplierId, orderDate, status) VALUES (?, ?, ?, ?)',
            [orderId, supplierId, orderDate, 'pending']
        );

        for (const item of items) {
            const [goodsData] = await db.execute('SELECT name, price FROM goods WHERE supplierId = ? AND name = ?', [supplierId, item.productId]);
            if (goodsData.length === 0) {
                // החלט מה לעשות אם מוצר לא נמצא - להחזיר שגיאה או לדלג
                console.warn(`מוצר ${item.productId} לא נמצא אצל ספק ${supplierId}`);
                continue;
            }
            const product = goodsData[0];
            await db.execute(
                'INSERT INTO order_items (orderId, productId, quantity, pricePerItem) VALUES (?, ?, ?, ?)',
                [orderId, product.name, item.quantity, product.price]
            );
        }

        res.status(201).json({ message: 'ההזמנה בוצעה בהצלחה.', orderId });

        // כאן אפשר לשלוח התראה לספק על הזמנה חדשה
    } catch (error) {
        console.error('שגיאה בהזמנת סחורה:', error);
        res.status(500).json({ message: 'שגיאה בהזמנת סחורה בשרת.' });
    }
});

// צפייה בסטטוס הזמנות קיימות (של בעל המכולת - כל ההזמנות)
app.get('/api/grocery/orders', async (req, res) => {
    try {
        const [ordersData] = await db.execute('SELECT * FROM orders');
        res.json(ordersData);
    } catch (error) {
        console.error('שגיאה בצפייה בהזמנות:', error);
        res.status(500).json({ message: 'שגיאה בצפייה בהזמנות בשרת.' });
    }
});

// אישור קבלת הזמנה על ידי בעל המכולת (מעדכן לסטטוס "הושלמה")
app.post('/api/grocery/orders/:orderId/received', async (req, res) => {
    const { orderId } = req.params;

    try {
        const [ordersData] = await db.execute('SELECT status FROM orders WHERE id = ?', [orderId]);
        if (ordersData.length === 0) {
            return res.status(404).json({ message: 'הזמנה לא נמצאה.' });
        }

        const orderStatus = ordersData[0].status;
        if (orderStatus !== 'processing') {
            return res.status(400).json({ message: 'לא ניתן לאשר קבלה להזמנה שאינה בסטטוס "בתהליך".' });
        }

        await db.execute('UPDATE orders SET status = ? WHERE id = ?', ['completed', orderId]);
        res.json({ message: 'ההזמנה עודכנה לסטטוס "הושלמה".' });

        // כאן אפשר לשלוח התראה לספק שההזמנה התקבלה
    } catch (error) {
        console.error('שגיאה באישור קבלת הזמנה:', error);
        res.status(500).json({ message: 'שגיאה באישור קבלת הזמנה בשרת.' });
    }
});

// מאגר של כל ההזמנות (כולל הושלמו) - כבר ממומש ב-/api/grocery/orders

app.listen(port, () => {
    console.log(`השרת רץ על פורט ${port}`);
});

// מאגר של כל ההזמנות (כולל הושלמו) - כבר ממומש ב-app.get('/api/grocery/orders')

app.listen(port, () => {
    console.log(`השרת רץ על פורט ${port}`);
});