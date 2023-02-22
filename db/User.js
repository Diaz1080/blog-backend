import { DataTypes } from "sequelize";

const User = (db) => {
	return db.define("user", {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		firstName: DataTypes.STRING,
		email: DataTypes.STRING,
		password: DataTypes.STRING,
		
	});
};

export default User;