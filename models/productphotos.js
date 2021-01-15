
'use strict';
module.exports = (sequelize , DataTypes) =>{
    const productimg = sequelize.define("productimg",{
      
        productfilename1: {
            type: DataTypes.STRING,
            allowNull: false,
            unique:true
        },
        productfilename2: {
            type: DataTypes.STRING,
            allowNull: false,
           unique:true
        },
        productid: {
            type: DataTypes.INTEGER
        }

        
    });
    productimg.removeAttribute('id');
    console.log(productimg);
    return productimg;

};
