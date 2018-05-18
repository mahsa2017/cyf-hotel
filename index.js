
const dbFilename = 'hotedatabase.sqlite';
const sqlite = require('sqlite3').verbose();
let db = new sqlite.Database(dbFilename);
db.run("PRAGMA foreign_keys = ON");


const SERVER_PORT = process.env.PORT || 8080;

const express = require("express");
const exphbs = require("express-handlebars");
const bodyparser = require("body-parser");

const apiRouter = require("./api");

const app = express();
const router = express.Router();

app.engine(
  "hbs",
  exphbs({
    defaultLayout: "main",
    extname: "hbs"
  })
);
app.set("view engine", "hbs");

app.use(express.static("public"));
app.use(express.static("assets"));

app.use("/api", apiRouter);

// handle HTTP POST requests
app.use(bodyparser.json());

app.get("/", function (req, res, next) {
  res.render("home");
});

app.get("/customers", function (req, res) {
  db.all("SELECT * from customers", function (err, rows) {
    /* rows.forEach(function (row) {
      console.log(row.title, row.firstname,row.surname);
    }); */
    res.status(200).json({
      customers: rows
    });
  });
});
app.get("/customers/:id", function (req, res) {
  var id = req.params.id;
  db.get("SELECT * FROM customers WHERE id = ?", [id],
    function (err, row) {
      if (err) {
        return console.error(err.message);
      }
      res.status(200).json({
        customer: row
      });
    });
});
app.get("/customers/name/:firstname", function (req, res) {
  var firstname = req.params.firstname;
  console.log(firstname);
  db.get("SELECT * FROM customers WHERE firstname = ?", [firstname],
    function (err, row) {
      if (err) {
        return console.error(err.message);
      }
      res.status(200).json({
        customer: row
      });
    });
});
app.post("/customers/", function (req, res) {
  var ttl = req.body.title;
  var fnm = req.body.firstname;
  var snm = req.body.surname;
  var eml = req.body.email;
  db.run("INSERT INTO customers (title, firstname, surname, email) VALUES (?, ?, ?, ?)",
    [ttl, fnm, snm, eml], function (err) {
      if (err == null) {
        var rowid = this.lastID;  //get the PK
        var rowchange = this.changes;
        console.log(`New customer id = ${rowid} and the number of row changed = ${rowchange}`);
        res.status(200).json({ lastId: rowid.toString() });  // return the PK
      } else {
        res.status(500).json({ error: err });
      }
    });
});
app.get("/invoices", function (req, res) {
  db.all("SELECT * from invoices", function (err, rows) {
    if (err == null) {
      res.status(200).json({
        invoices: rows
      });
    } else {
      res.status(500).json({ error: err });
    }
  });
});
app.get("/invoices/:id", function (req, res) {
  var id = req.params.id;
  db.get("SELECT * FROM invoices WHERE id = ?", [id],
    function (err, row) {
      if (err) {
        return console.error(err.message);
      }
      res.status(200).json({
        invoice: row
      });
    });
});

app.get("/reservations", function (req, res) {
  db.all("SELECT * from reservations", function (err, rows) {
    if (err == null) {
      res.status(200).json({
        reservations: rows
      });
    } else {
      res.status(500).json({ error: err });
    }
  });
});
app.get("/reservations/:id", function (req, res) {
  var id = req.params.id;
  db.get("SELECT * FROM reservations WHERE id = ?", [id],
    function (err, row) {
      if (err) {
        return console.error(err.message);
      }
      res.status(200).json({
        reservation: row
      });
    });
});

app.post("/reservations/", function (req, res) {
  var custid = req.body.customer_id;
  var roomid = req.body.room_id;
  var checkin = req.body.check_in_date;
  var checkout = req.body.check_out_date;
  var roomprice = req.body.room_price;

  db.get("SELECT * FROM customers WHERE id = ?", [custid], function (err, row) {
    console.log(row, typeof row);
    if (row === undefined) {
      res.status(400).send(`A customer with an ID '${custid}' hasn't been created yet`);
    } else {
      db.run("INSERT INTO reservations (customer_id, room_id, check_in_date, check_out_date,room_price) VALUES (?, ?, ?, ?, ?)",
        [custid, roomid, checkin, checkout, roomprice], function (err) {
          if (err == null) {
            var rowid = this.lastID;  //get the PK
            var rowchange = this.changes;
            console.log(`New reservation id = ${rowid} and the number of row changed = ${rowchange}`);
            res.status(200).json({ lastReservation: rowid.toString() });  // return the PK
          } else {
            res.status(500).json({ error: err });
          };
        });
    };
  });
});
app.listen(SERVER_PORT, () => {
  console.info(`Server started at http://localhost:${SERVER_PORT}`);
});
