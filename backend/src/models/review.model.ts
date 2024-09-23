import { sequelize } from "../database";

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
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fountainId: {
            type: DataTypes.STRING,
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
