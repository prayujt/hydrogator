import { sequelize } from "../database";

import { DataTypes, Model } from "sequelize";
import bcrypt from "bcrypt";

export class User extends Model {}

User.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
    },
    {
        sequelize,
        tableName: "users",
    },
);

User.addHook("beforeCreate", async (user: User) => {
    const saltRounds = 10;
    user.setDataValue(
        "password",
        await bcrypt.hash(user.getDataValue("password"), saltRounds),
    );
});
