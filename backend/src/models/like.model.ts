import { sequelize } from "../database";

import { Fountain } from "./fountain.model";
import { User } from "./user.model";

import { DataTypes, Model } from "sequelize";

export class Like extends Model {}

Like.init(
    {
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
        },
        fountainId: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
        },
    },
    {
        sequelize,
        tableName: "likes",
    },
);

User.hasMany(Like, { as: "likes", foreignKey: "userId" });
Fountain.hasMany(Like, { as: "likes", foreignKey: "fountainId" });
