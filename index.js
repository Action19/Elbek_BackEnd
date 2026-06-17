const express = require('express');
const app = express();
const cors = require('cors');
const usersRoutes = require('./routes/usersRoute'); 
const loginRoutes = require('./routes/loginRoute'); 
const certificateRoutes = require('./routes/certificateRoute'); 
const conn = require("./service/connectDB"); 
// require('./service/connectDB')();

conn();
app.use(cors({
    origin: "http://localhost:5173",
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));
app.use(express.urlencoded({extended: true}))
app.use(express.json());

app.use(usersRoutes);
app.use(loginRoutes);
app.use(certificateRoutes);

const PORT = process.env.PORT || 5001

app.listen(PORT, () =>{
    console.log( PORT + ' port eshitilmoqda');
});