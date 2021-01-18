
'use strict';

module.exports = (sequelize , DataTypes) =>{
    const cart = sequelize.define("cart",{
        cartid: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        productid: {
            type: DataTypes.INTEGER,
        },
        Productname:{
            type: DataTypes.STRING,
            allowNull: false
        },
        Title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        File: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Price: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        Qty_ordered: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        userid:{
            type: DataTypes.INTEGER,
        }, 
      
    });

    
    console.log(cart);
    return cart;
   

};
