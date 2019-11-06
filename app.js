var express = require("express"),
    app = express(),
    passport = require("passport"),
    bodyParser = require("body-parser"),
    localStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    User =require("./models/user"),
    mongoose = require("mongoose");

app.use(require("express-session")({
    secret:"Rusty is Motherfucker",
    resave:false,
    saveUninitialized:false

}));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


mongoose.connect("mongodb://localhost/auth_demo");

//=======
//ROUTES
//=======




app.get("/", function (req, res) {
    res.render("home");
});
//SECRET ROUTE
//middleware to check if user is logged in or not
app.get("/secret",isLoggedIn, function (req, res) {
    res.render("secret");
});

//AUTH ROUTES
app.get("/register",function(req,res){
    res.render("register");
});
//handling user signup
app.post("/register",function(req,res){
    User.register(new User({username:req.body.username}),req.body.password,function(err,user){
        if(err){
            console.log(err);
            return res.render(err);
        }
        passport.authenticate("local")(req,res,function(){
            res.redirect("/secret");
        });
    });
});

//LOGIN ROUTES
//render login form
app.get("/login",function(req,res){
    res.render("login");
});
//login logic
//middleware to check if user is signed up
app.post("/login",passport.authenticate("local",{
    successRedirect:"/secret",
    failureRedirect:"/login"
}),function(req,res){
});

app.get("/logout",function(req,res){
    req.logOut();
    res.redirect("/");
});

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

app.listen(4000, function () {
    console.log("server started");
});