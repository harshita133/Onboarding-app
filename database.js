const {Pool} =require('pg')

const pool=new Pool({
    user:"postgres",
    password:"Mrt@0121",
    host:"localhost",
    port:5432,
    database:"user"
})



module.exports=pool