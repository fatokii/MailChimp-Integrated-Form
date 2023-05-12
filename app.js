const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
// app.use(express.static(path.join(__dirname, '/public')));
app.set("view engine", "ejs");




const client = require("@mailchimp/mailchimp_marketing");

client.setConfig({
  apiKey: "330f4b1e003888fc2239557a98878c16",
  server: "us17",
});




app.get("/", function(req, res){
    res.render("index");
})


app.post("/", function(req, res){
    let fname = req.body.fname;
    let lname = req.body.lname;
    let email = req.body.email;

    const checkIfSubscribed = async () => {
        const response = await client.lists.getListMember("46437b88eb", email)
        .then(function(data){
            if (data.status == "subscribed") {
                res.render("success", {data: "You are already subcribed to this Newsletter"});
            } else {
                async function updateMember(){
                    const response = await client.lists.updateListMember("46437b88eb", email, {
                        status: "subscribed"
                    }).then(function(info){
                        res.render("success", {data: "You have successfully signed up for our Newsletter"})
                    })
                    .catch(function(err){
                        console.log(err);
                    })
                }

                updateMember();
                
            }
            
        })
        .catch(function(err){
            console.log(err);
            async function addMember() {
                const response = await client.lists.addListMember("46437b88eb", {
                    email_address: email,
                    status: "subscribed",
                    merge_fields: {
                        FNAME: fname,
                        LNAME: lname
                    }
                })
                .then(function(info){
                    res.render("success", {data: "You have successfully signed up for our Newsletter"});
                })
                .catch(function(err){
                    console.log(err);
                })
    
                
            }

            addMember();


        })
        
     

    }


    checkIfSubscribed();
})


app.listen("3000", function(){
    console.log("App is up and running.")
})
