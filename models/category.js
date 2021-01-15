
'use strict';
module.exports = (sequelize , DataTypes) =>{
    const category = sequelize.define("category",{
        categoryid: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement:true
        },
        categoryname:{
            type: DataTypes.STRING,
            allowNull: false,
            unique:true
        },
      
    });

    console.log(category);
    return category;
   

};





