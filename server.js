 

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const {Pool} = require("pg");

const app = express();
app.use(bodyParser.json());
app.use(cors());



 

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'ict_exam',
    password: 'password',
    port: 5432,
});

 


 
app.use(express.json());

 
app.get("/api/sensors", async (req, res) => {
    try {
 
        const result = await pool.query("SELECT * FROM exam ORDER BY id ASC");

 
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Database error" }); 
    }
});

app.get("/api/sensors:id", async (req, res) => {
    try {
        const { id } = req.params;


        const result = await pool.query("SELECT * FROM exam WHERE id = $1", [id]);

        if (result.rows.length === 0)
            return res.status(404).json({ error: "Sensor not found" });


        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});


app.post("/api/sensors", async (req, res) => {
    try {
        const { name, coordinates, type, value } = req.body;


        if (!name|| !coordinates || !type || !value)
            return res.status(400).json({ error: "Invalid input" });


        const result = await pool.query(
            "INSERT INTO exam (name, coordinates, type, value) VALUES ($1, $2, $3, $4) RETURNING *",

            [name, coordinates, type, value]
        );


        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err });
    }
});


app.put("/api/sensors/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, coordinates, type, value } = req.body;


        const result = await pool.query(
            "UPDATE exam SET name = COALESCE($1, name), coordinates = COALESCE($2, coordinates), type = COALESCE($3, type), value = COALESCE($4, value) WHERE id = $5 RETURNING *",
            [name, coordinates, type, value, id]

        );

        if (result.rows.length === 0)
            return res.status(404).json({ error: "Product not found" });


        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});


app.delete("/api/sensors/:id", async (req, res) => {
    try {
        const { id } = req.params;


        const result = await pool.query("DELETE FROM exam WHERE id = $1 RETURNING *", [id]);

        if (result.rows.length === 0)
            return res.status(404).json({ error: "Product not found" });


        res.json({ message: "Product deleted" });
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});


