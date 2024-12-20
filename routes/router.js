const express  = require("express");
const router = express.Router();
const schemas = require("../models/schema");


//router.post(...)

//HOME LOG-IN ROUTING
    //update log-in information
    router.put("/update-login", async(req, res) =>{
        try{
            let {username} = req.body;
            const query = schemas.DucktopiaAccounts;
            const result = await query.updateOne(
                {username: username},
                {$set: {"account_usage_data.last_log_in": Date.now(), "account_usage_data.created_date":1}}
            )
            if (result.modifiedCount > 0) {
                res.status(200).json({ success: true });
            } 
        }
        catch(err){
            console.log("there was an error updating login in backend: " + err);
        }
    })

    // //creating account
    // router.post('/create-ducktopia-account', async(req, res) =>{
    //     try{
    //         let {username} = req.body;
    //         //getting all current courses
    //             const coursesQuery = schemas.DucktopiaCourses;
    //             const coursesResult = await coursesQuery.find({}, {_id:0, course_title:1})
    //             const coursesToPush = coursesResult.map(doc => doc.course_title);
    //             let accountCouresTranspile = []
    //             coursesToPush.forEach((course)=>{
    //                 accountCouresTranspile.push({
    //                   course_title:course,
    //                   quiz_data:{
    //                     attempts:0,
    //                     total_guessed:0,
    //                     total_correct:0,
    //                   }
    //                 })
    //               })
                
            
    //         //preparing insert document
    //             const ducktopiaAccountInsert = {
    //                 username:username,
    //                 account_stats:{
    //                     account_type:"student",
    //                     coins:0,
    //                     account_items:{
    //                         skins:[],
    //                         misc:[]
    //                     }
    //                 },
    //                 account_usage_data:{
    //                     created_date:Date.now(),
    //                     last_log_in:Date.now()
    //                 },
    //                 account_courses:accountCouresTranspile
    //             }

    //         //sending account to be made
    //             const accountQuery = schemas.DucktopiaAccounts;
    //             const newAccount = new accountQuery(ducktopiaAccountInsert)
    //             const result = await newAccount.save()
    //             console.log(result)
    //             res.status(200).json({ success: true });
            

    //     }
    //     catch(err){
    //         console.log(`Errors posting/making account in backend: ${err}`)
    //     }
    // })


//QUIZ ROUTING

    //retrieve sample of questions for user
    router.get('/retrieve-quiz-questions/:course_name', async(req, res) =>{
        try{
            let courseName = req.params.course_name;
            const query = schemas.DucktopiaCourses;
            const result =  await query.aggregate([
                { $match: { course_title:courseName} }, 
                { $unwind: "$question_bank" },                              
                { $sample: { size: 5 } },                                
                { $replaceRoot: { newRoot: "$question_bank" } }          
            ])    
            res.status(200).json({the_bank:result})
        }
        catch(err){
            console.log(`there was an error retrieving questions in backend: ${err}`)
        }
    })

    //updating quiz results to mongo
    router.put('/save-quiz-results', async(req, res) =>{
        try{
            let {courseName, username, coinsEarned, guessed, correct} = req.body;
            const query = schemas.DucktopiaAccounts;
            //saving coins collected
            const resultOne = await query.updateOne(
                {username: username},
                {$inc: {"account_stats.coins": coinsEarned}}
            )
            //saving questions answered & question correct and quiz attempt numbers
            const resultTwo = await query.updateOne(
                {username:username, "account_courses.course_title":courseName},
                {$inc: {"account_courses.$.quiz_data.attempts":1,"account_courses.$.quiz_data.total_guessed": guessed, "account_courses.$.quiz_data.total_correct":correct }}
            )
            if (resultTwo.modifiedCount > 0) {
                res.status(200).json({ success: true });
            } 

        }
        catch(err){
            console.log("there was an error updating quiz results in backend: " + err);
        }

    })

    //retrieving updated quiz data from mongo (MAKE THIS ID TRANSFER INSTEAD OF USERNAME ! ! !)
    router.get('/fetch-quiz-results/:username', async(req, res) =>{
        try{
            let username = req.params.username;
            const query = schemas.DucktopiaAccounts;
            const result = await query.findOne(
                {username:username},
                {"account_courses":1, _id:0}
            )
            res.status(200).json({result})
        }
        catch(err){
            console.log("there was an error fetching quiz results from db: " + err);
        }
    })


//SHOP ROUTING
    //fetching user coin amount (MAKE THIS ID TRANSFER INSTEAD OF USERNAME ! ! !)
    router.get('/fetch-account_stats/:username', async(req, res) =>{
        try{
            let username = req.params.username;
            const query = schemas.DucktopiaAccounts;
            const result = await query.findOne(
                {username:username},
                {"account_stats":1, _id:0}
            )
            res.status(200).json({result})
        }
        catch(err){
            console.log("there was an error fetching quiz results from db: " + err);
        }
    })

    //updating coin amount to mongo after shop purchase
    router.put('/update-coin-amount', async(req, res) =>{
        try{
            let {username, coinChange} = req.body;
            const query = schemas.DucktopiaAccounts;
            const resultOne = await query.updateOne(
                {username: username},
                {$inc: {"account_stats.coins": coinChange}}
            )
            if (resultOne.modifiedCount > 0) {
                res.status(200).json({ success: true });
            } 

        }
        catch(err){
            console.log("there was an error changing coins to db: " + err);
        }
    })

    //updating user catalog w items they buy
    router.put('/update-account-items',async(req, res) =>{
        try{
            let {username, addedItem, addedItemType} = req.body;
            const query = schemas.DucktopiaAccounts;
            const keyPath = `account_stats.account_items.${addedItemType}`
            const result = await query.updateOne(
                {username: username},
                {$push: {[keyPath]:addedItem}}
            )
            if (result.modifiedCount > 0) {
                res.status(200).json({ success: true });
            } 

        }
        catch(err){
            console.log(`There was an error updating account w items: ${err}`)
        }
    })






module.exports = router;





















// // //MANUAL USAGE: importing questions to question_bank in mongo
// router.put('/fill-question-bank', async(req, res) =>{
//     try{
//         let {questionBank} = req.body;
//         const query = schemas.DucktopiaCourses;
//         const result = await query.updateOne(
//             {course_title: "intro_to_programming"},
//             {$push: {"question_bank": {$each: questionBank}}}
//         )
//         console.log(result);
//         if (result.modifiedCount > 0) {
//             res.status(200).json({ success: true });
//         } 
//     }
//     catch(err){
//         console.log(`there were errors sending questions to mongo: ${err}`)
//     }
// })