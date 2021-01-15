'use strict';
module.exports = (sequelize , DataTypes) =>{
    const ship = sequelize.define("ship",{
        shipid: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        shipaddress: {
            type: DataTypes.STRING,
            allowNull: false
        },
        shipdate: {
            type: DataTypes.DATE,
            allowNull: false
        },
         
        arrivaldate: {
            type: DataTypes.DATE,
            allowNull: false
        },

        userid: {
            type: DataTypes.INTEGER,
        },
        cartid: {
            type: DataTypes.INTEGER,
        }
    });
    console.log(ship);
    return ship;

};
