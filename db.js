import mongoose from "mongoose";

const dbURL = 'mongodb+srv://nguyentathoangviet:<db_password>@nguyenviet.eseae.mongodb.net/?retryWrites=true&w=majority&appName=NguyenViet';

mongoose.connect(dbURL,{ useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('MongoDB connected...'))
.catch((err) => console.log(err));