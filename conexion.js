let mysql =require("mysql");

let conexion = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"fotaza"
});

  conexion.connect(function(error){
    if(error){
        throw error;
    }else{
        console.log("Conexion exitosa");
    }  
});