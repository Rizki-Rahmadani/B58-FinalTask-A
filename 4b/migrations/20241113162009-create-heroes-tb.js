"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("heroes_tb", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            name: {
                type: Sequelize.STRING,
            },
            type_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: "type_tb",
                    key: "id",
                },
            },
            photo: {
                type: Sequelize.STRING,
            },
            users_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: "users_tb",
                    key: "id",
                },
            },
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("heroes_tb");
    },
};