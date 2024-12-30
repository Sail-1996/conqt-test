const express = require("express")
const mySql = require("mysql2")
const parser = require("body-parser")
const cors = require("cors")
const { header } = require("express/lib/request")
const { param } = require("express/lib/application")


const app = express()

app.use(cors())
app.use(parser.json())

const db = mySql.createConnection({
    host: "nodejs-technical-test.cm30rlobuoic.ap-southeast-1.rds.amazonaws.com",
    user: "candidate",
    port: "3306",
    password: "NoTeDeSt^C10.6?SxwY882}",
    database: "conqtvms_dev",
});

db.connect((err) => {
    if (err) throw err;
    console.log("Connected to MySQL database.");
});


app.get("/product_details/:id", (req, res) => {

    //   page, page size, order by, order direction, and search by field.
    const id = req.params.id


    console.log(id)
   
   const header = res.pa
       db.query(`SELECT * FROM Products WHERE productId LIKE ${id}`, (err, results) => {
           if (err) return res.status(500).json({ error: err.message });
           res.json(results);
         });
   })


   app.post("/products", (req, res) => {
    const body = req.body;

    // Default parameters
    const pageSize = body.pageSize ?? 10;
    const currentPage = body.currentPage ?? 1;
    const orderBy = body.orderBy ?? "createdAt";
    const orderDir = body.orderDir?.toLowerCase() === "asc" ? "ASC" : "DESC"; // Ensure valid direction
    const searchBy = body.searchBy ?? "";
    const searchFields = body.searchFields ?? [];

    // Validate inputs
    if (currentPage < 1 || pageSize < 1) {
        return res.status(400).json({ error: "Invalid pagination parameters" });
    }

    // Construct WHERE clause for search
    let whereClause = "";
    const params = [];
    if (searchBy && searchFields.length > 0) {
        const searchConditions = searchFields.map((field) => {
            params.push(`%${searchBy}%`);
            return `${field} LIKE ?`;
        });
        whereClause = `WHERE ${searchConditions.join(" OR ")}`;
    }

    // Calculate offset for pagination
    const offset = (currentPage - 1) * pageSize;

    // Construct the SQL query
    const query = `
        SELECT * 
        FROM Products 
        ${whereClause}
        ORDER BY ${orderBy} ${orderDir}
        LIMIT ? OFFSET ?;
    `;

    // Add pagination parameters
    params.push(pageSize, offset);

    // Execute the query
    db.query(query, params, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Count total products for pagination info
        const countQuery = `SELECT COUNT(*) AS total FROM Products ${whereClause}`;
        db.query(countQuery, params.slice(0, -2), (countErr, countResult) => {
            if (countErr) {
                return res.status(500).json({ error: countErr.message });
            }

            const total = countResult[0]?.total ?? 0;
            res.json({
                data: results,
                pagination: {
                    currentPage,
                    pageSize,
                    totalPages: Math.ceil(total / pageSize),
                    totalItems: total,
                },
            });
        });
    });
});



app.listen(4000, () => {
    console.log("Server running on http://localhost:4000");
});