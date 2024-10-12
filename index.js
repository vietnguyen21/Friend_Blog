import express from "express";
import bodyParser from "body-parser";
import { v4 as uuidv4 } from 'uuid'; 
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import session from 'express-session';



const app = express();
const port = 5000;


app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: '1234567890QWERTYUIOP',
  resave: false, 
  saveUninitialized: true,
  cookie: { secure: false }
}))


// Set MongoDB connection
const dbURL = process.env.MONGODB_URI;
mongoose.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected...'))
  .catch((err) => console.log(err));

// Set Mongoose schema
const blogSchema = new mongoose.Schema({
  title: String,
  name: String,
  content: String,
  id: String,  
  time: String,
});
const user = new mongoose.Schema({
  email:String,
  password:String,
})

const userInformation = mongoose.model('User',user);
const User = mongoose.model('Blog', blogSchema);

// Web routes
app.get('/home', (req, res) => {
  console.log(req.session.email);
  User.find()
    .then((users) => {
      const data = users;
      res.render('index.ejs', { data: data ,session_name :req.session.email }); 
    })
    .catch((err) => {
      res.status(500).send('Error fetching users');
    });
});
app.get("/",(req,res)=>{
  res.render("login.ejs");
})

app.get("/register",(req,res)=>{
  res.render("register.ejs");
})

app.post("/postLogin", (req, res) => {
  const email = req.body.email;
  userInformation.findOne({ email: email })
    .then((userInformation) => {
      if (!userInformation) {
        return res.status(404).send('User not found'); 
      }

      
      bcrypt.compare(req.body.password, userInformation.password)
        .then((isMatch) => {
          if (isMatch) {
            req.session.email = email;  // Store email in session
            res.redirect("/home");  
          } else {
            res.status(400).send('Invalid credentials');  
          }
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send('Error comparing passwords');
        });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error fetching user');
    });
});

app.post("/postRegister", async (req,res)=>{
  const password = await bcrypt.hash(req.body.password, 10);
  const userLogin = new userInformation({
    email:req.body['email'],
    password:password,
  })
  userLogin.save();
  res.redirect("/");
})

app.get('/edit',(req,res)=> {
  res.render('edit.ejs');
});

app.get('/edit/:id', (req, res) => {
  const blogId = req.params.id;

  User.findOne({ id: blogId })
    .then((blog) => {
      if (blog) {
        res.render('edit.ejs', { blog: blog });
      } else {
        res.status(404).send('Blog post not found');
      }
    })
    .catch((err) => {
      res.status(500).send('Error fetching blog post');
    });
});

app.post('/edit',(req,res)=>{
  const id = req.body.id;
  const newTitle = req.body.title;
  const newContent = req.body.content;
  User.findOneAndUpdate ({id : id}, { title: newTitle ,content:newContent}, { new: true })
      .then(updatedUser => {
        res.redirect('/home');
      })
      .catch(err => {
        console.error(err);
        res.status(500).send('Error updating user');
      });
  
})

app.post('/delete',(req,res)=>{
  const id =req.body.id;
  User.findOneAndDelete({ id: id })
  .then(deletedUser => {
    res.redirect("/home");
  })
  .catch(err => {
    console.log(err);
  })
})

app.get('/post', (req, res) => {
  res.render('post.ejs');
});

app.post('/post', (req, res) => {
  const postBlog = new User({
    title: req.body["title"],
    name: req.session.email,
    content: req.body["content"],
    id: uuidv4(),  
    time: Date(),
  });
  postBlog.save();
  res.redirect("/home");
});

app.get('/post/:id', (req, res) => {
  const blogId = req.params.id;

  User.findOne({ id: blogId })
    .then((blog) => {
      if (blog) {
        res.render('blog.ejs', { blog: blog });
      } else {
        res.status(404).send('Blog post not found');
      }
    })
    .catch((err) => {
      res.status(500).send('Error fetching blog post');
    });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
