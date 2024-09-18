const {Pool} =require('pg')

const pool=new Pool({
    user:"u234m02e0p9g99",
    password:"pd3d9f4aec4901e121561adb29d6d7fa0d9bc88914acf1475ac6d27baeaf15529",
    host:"c9uss87s9bdb8n.cluster-czrs8kj4isg7.us-east-1.rds.amazonaws.com",
    port:5432,
    database:"d435bkr679d42f"
})



module.exports=pool