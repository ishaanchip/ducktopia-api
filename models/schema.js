const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const ducktopiaAccountSchema = new Schema({
    username:{type:String, required:true, unique:true},
    account_stats: {type: Object, required:true},
    account_usage_data: {type:Object, required:true},
    account_courses: {type:[Object], required:true},

})

const ducktopiaCoursesSchema = new Schema({
    course_title:{type:String, required:true, unique:true},
    question_bank:{type:[Object], required:true}
})

const DucktopiaAccounts = mongoose.model('ducktopia_accounts', ducktopiaAccountSchema, 'accounts');

const DucktopiaCourses = mongoose.model('ducktopia_courses', ducktopiaCoursesSchema, 'courses');

const mySchemas = {'DucktopiaAccounts':DucktopiaAccounts, 'DucktopiaCourses':DucktopiaCourses}

module.exports = mySchemas;