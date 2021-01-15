'use strict';
module.exports = (sequelize , DataTypes) =>{
    const userprofile = sequelize.define("userprofile",{
        userprofile: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Firstname:{
            type: DataTypes.STRING,
            allowNull: false
        },
        Lastname:{
            type: DataTypes.STRING,
            allowNull: false
        },
        apt_no: {
            type: DataTypes.INTEGER,
            allowNull:false
        },
        street_address: {
            type: DataTypes.STRING,
            allowNull: false
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false
        },
        City:{
            type: DataTypes.STRING,
            allowNull: false
        },
        Zip_code: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        Country: {
            type: DataTypes.STRING,
            allowNull: false
        },
        Phone_no: {
            type: DataTypes.STRING,
            allowNull: false
        },
        userid: {
            type: DataTypes.INTEGER,
            allowNull: false

        }
        
    });
    console.log(userprofile);
    return userprofile;

};
