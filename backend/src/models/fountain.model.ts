import { sequelize } from "../database";
import { Building } from "./building.model";

import { DataTypes, Model } from "sequelize";

export class Fountain extends Model {}

Fountain.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    hasBottleFiller: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "fountains",
  },
);

Fountain.belongsTo(Building, { as: "building", foreignKey: "buildingId" });
Building.hasMany(Fountain, { as: "fountains", foreignKey: "buildingId" });
