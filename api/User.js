const express = require ('express');
const router = express.Router();

const User = require('./../models/User');
const bcrypt = require ('bcrypt')

//Signup route
router.post('/signup', (req,res)=>{
    let {name, email, password, dateOfBirth}= req.body;
    name = name.trim()
    email = email.trim()
    password = password.trim()
    dateOfBirth = dateOfBirth.trim()

    //validate data from client
    if (name==''|| email==''|| password==''|| dateOfBirth==''){
        res.json({
            status: "FAILED",
            message: "Empty input fields"
        })
    } else if (!/^[a-zA-Z ]*$/.test(name)){
        res.json({
            status: "FAILED",
            message: "Invalid name entered"
        })
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)){
        res.json({
            status: "FAILED", 
            message: "Invalid email address"
        })
    } else if(!new Date(dateOfBirth).getTime()){
        res.json({
            status: "FAILED", 
            message: "Invalid date of birth"
        })
    } else if (password.length<8){
        res.json({
            status: "FAILED", 
            message: "Password is too short!"
        })
    } else {
        //check if user already exists
        User.find({email}).then(result=>{
            if(result.length){
                res.json({
                    status: "FAILED", 
                    message: "User already exists!"
                })
            } else {
                //Create new user
                //Hash password
                const saltRounds = 10; 
                bcrypt.hash(password, saltRounds).then(hashedPassword=>{
                        const newUser = new User({
                            name,
                            email,
                            password: hashedPassword,
                            dateOfBirth
                        });

                        newUser.save().then(result=>{
                            res.json({
                                status: "SUCCESS", 
                                message: "Signup successful", 
                                data: result,
                            })
                        }).catch((err)=>
                        res.json({
                            status: "FAILED", 
                            message: "Error occured while adding new account"
                        }))
                }).catch((err)=>{
                    res.json({
                        status: "FAILED", 
                        message: "Error occured while hashing password!"
                    })
                })
            }
        }).catch((err)=>{
            console.log(err);
            res.json({
                status: "FAILED", 
                message: "An error occured while checking database for existing user"
            })
        })
    }

} )


//Sign in route
router.post('/signin', (req,res)=>{
    let {email, password}= req.body;
    email = email.trim()
    password = password.trim() 

    if(email==""|| password==""){
        res.json({
            status:"FAILED",
            message: "Empty credentials"
        })
    } else {
        //check user exist
        User.find({email}).then(data=>{
            if(data.length){
                //user exists
                const hashedPassword = data[0].password;
                bcrypt.compare(password, hashedPassword).then(result=>{
                   if(result){
                        res.json({  
                            status: 'SUCCESS',
                            message: "Login successful",
                            data: data
                        })
                   } else{
                    res.json({
                        status: 'FAILED', 
                        message: 'Invalid password entered'
                    })
                   }
                }).catch((err)=>{
                    res.json({
                        status: "FAILED",
                        message: "Error while comparing passwords!"
                    })
                })
            } else {
                res.json({
                    status: "FAILED",
                    message: "Invalid login credentials"
                })
            }
        }).catch((err)=>{
            res.json({
                status: "FAILED",
                message: "Error while checking if user exists"
            })
        })
    }

} )


module.exports = router; 