const express = require('express')
const app = express()


const path = require('path')
const hbs = require('express-handlebars')

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')
app.engine('hbs', hbs.engine({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: __dirname + '/views/layouts/'
}))
app.use(express.static('public'));

const mysql = require('mysql2')

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: true}))

var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'qwerty',
    database: 'joga_mysql'
})

con.connect((err) => {
    if (err) {
        console.error('Andmebaasiga ühendamine ebaõnnestus:', err.message)
        return
    }
    console.log('Connected to joga_mysql db')
})

app.get('/', (req, res) => {
  let query = 'SELECT * FROM article';
  let articles = [];
  con.query(query, (err, result) => {
    if (err) throw err;
    articles = result;
    res.render('index', {
      articles: articles
    });
  });
});

app.get('/article/:slug', (req, res) => {
  let query = `SELECT * FROM article WHERE slug="${req.params.slug}"`;
  let article
  con.query(query, (err, result) => {
    if (err) throw err;
    article = result;
    console.log(article)
    let query2 = `SELECT * FROM author WHERE id="${article[0].author_id}"`;
    con.query(query2, (err, result2) => {
      if (err) throw err;
      article[0].author = result2[0].name;
      res.render('article', {
        article: article
      });
    });
  });
});

app.get('/author/:author_id', (req, res) => {
  let author_name = '';
  let articles = [];
  
  // Esimene päring - autori info
  let query1 = `SELECT name FROM author WHERE id="${req.params.author_id}"`;
  con.query(query1, (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      author_name = result[0].name;
    }
    
    // Teine päring - autori artikelid
    let query2 = `SELECT * FROM article WHERE author_id="${req.params.author_id}"`;
    con.query(query2, (err, result2) => {
      if (err) throw err;
      articles = result2;
      
      // Renderi author.hbs mall andmetega
      res.render('author', {
        author_name: author_name,
        articles: articles
      });
    });
  });
});


const PORT = process.env.PORT || 3003
const server = app.listen(PORT, () => {
    console.log(`App is started at http://localhost:${PORT}`)
})

server.on('error', (err) => {
    console.error(`Porti ${PORT} kuulamine ebaõnnestus:`, err.message)
})
