import { sequelize } from "../database";

import { Fountain } from "./fountain.model";
import { User } from "./user.model";

import { DataTypes, Model } from "sequelize";

export enum FilterStatus {
    NEEDS_REPLACEMENT = 0,
    OK = 1,
    GOOD = 2,
}

export class Review extends Model {}

Review.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        fountainId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        comment: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        taste: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        temperature: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        flow: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        filterStatus: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "reviews",
    },
);

User.hasMany(Review, { as: "reviews", foreignKey: "userId" });
Fountain.hasMany(Review, { as: "reviews", foreignKey: "fountainId" });
