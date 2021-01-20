
'use strict';



module.exports = (sequelize , DataTypes) =>{
    const user = sequelize.define("user",{
        userid: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        emailId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        cartcount: {
            type: DataTypes.INTEGER,
            allowNull:true
        }

        
    });

     
        
    
    console.log(user);
    return user;
   

};
