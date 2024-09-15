import { sequelize } from '../database';

import { DataTypes, Model, Optional } from 'sequelize';

export class Fountain extends Model {
  public id!: string;
  public longitude!: number;
  public latitude!: number;
}

Fountain.init(
  {
    id: {
      type: DataTypes.STRING,
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
  },
  {
    sequelize,
    tableName: 'Fountain',
  }
);
