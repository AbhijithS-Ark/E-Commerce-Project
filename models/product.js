'use strict';


module.exports = (sequelize , DataTypes) =>{
    const product = sequelize.define("product",{
        productid: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        productname: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Modelno: {
            type: DataTypes.STRING,
            allowNull: true
        },
        
        brand: {
            type: DataTypes.STRING,
            allowNull:true
        },
       Title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Description: {
            type: DataTypes.STRING(1234),
            allowNull: false
        },
        Condition: {
            type: DataTypes.STRING,
            allowNull: false
        },
    
        price: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        Company_name: {
            type: DataTypes.STRING,
            allowNull:true
        },
        Qty_add: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
      
         userid:{
            type: DataTypes.INTEGER,
         },
         categoryid:{
            type: DataTypes.INTEGER,
         }
    });

    console.log(product);
    return product;
     
};
