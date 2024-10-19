// backend/db/seeders/20240924235125-demo-spotImages

"use strict";

const { SpotImage } = require("../models");

let options = {};
if (process.env.NODE_ENV === "production") {
  options.schema = process.env.SCHEMA; // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await SpotImage.bulkCreate(
      [
        {
          spotId: 1,
          url: "https://laughingsquid.com/wp-content/uploads/2014/08/article-2722983-2077A37A00000578-160_964x637-750x495.jpg",
          preview: true,
        },
        {
          spotId: 1,
          url: "https://laughingsquid.com/wp-content/uploads/2014/08/PetCamper6.jpg",
          preview: false,
        },
        {
          spotId: 1,
          url: "https://laughingsquid.com/wp-content/uploads/2014/08/article-2722983-2077A30A00000578-160_964x634-750x493.jpg",
          preview: false,
        },
        {
          spotId: 1,
          url: "https://laughingsquid.com/wp-content/uploads/2014/08/article-2722983-2077A31700000578-193_964x633-750x492.jpg",
          preview: false,
        },
        {
          spotId: 1,
          url: "https://laughingsquid.com/wp-content/uploads/2014/08/article-2722983-20787B9800000578-458_964x637-750x495.jpg",
          preview: false,
        },
        {
          spotId: 2,
          url: "https://nextshark.b-cdn.net/wp-content/uploads/2022/06/Screen-Shot-2022-06-13-at-7.36.26-PM.png",
          preview: true,
        },

        {
          spotId: 2,
          url: "https://cdn.shopify.com/s/files/1/0549/5806/3713/files/japandi_cat_tree_indoor.jpg",
          preview: false,
        },
        {
          spotId: 2,
          url: "https://as1.ftcdn.net/v2/jpg/08/80/77/54/1000_F_880775408_VJGz4UZswguBWphqDKX9xFYmeIMXrP3I.jpg",
          preview: false,
        },
        {
          spotId: 2,
          url: "https://youdidwhatwithyourweiner.com/wp-content/uploads/2013/07/2016-11-04-11.47.19-768x769.jpg",
          preview: false,
        },
        {
          spotId: 2,
          url: "https://i.pinimg.com/enabled_hi/564x/57/e4/00/57e400580435a103e47361008d724a30.jpg",
          preview: false,
        },

        {
          spotId: 3,
          url: "https://deedoggy.com/cdn/shop/articles/vecteezy_playful-corgi-indulging-in-an-unexpected-treat-created-with_29841539.jpg",
          preview: true,
        },
        {
          spotId: 4,
          url: "https://i.etsystatic.com/16097108/r/il/c7614d/3509021219/il_1588xN.3509021219_ansf.jpg",
          preview: true,
        },

        {
          spotId: 5,
          url: "https://images.stockcake.com/public/4/f/3/4f375b6b-ccef-493b-9bcf-9a30d7a1fd68_large/enchanted-treehouse-scene-stockcake.jpg",
          preview: true,
        },
        {
          spotId: 5,
          url: "https://www.pawsandstay.co.uk/upload/2023/3/15/medium_Treehouse_beneath_the_branches_1_44908573d0.jpg",
          preview: false,
        },

        {
          spotId: 5,
          url: "https://www.hauspanther.com/wp-content/uploads/2019/07/NekoModernCatTree4.jpg",
          preview: false,
        },
        {
          spotId: 5,
          url: "https://www.canopyandstars.co.uk/upload/2023/1/31/Dog_friendly_treehouse_holidays_1_ee16be2440.jpg",
          preview: false,
        },
        {
          spotId: 5,
          url: "https://as2.ftcdn.net/v2/jpg/05/04/26/85/1000_F_504268518_xp08vOJercavAzWr5urFX6uQo2MGz9CI.jpg",
          preview: false,
        },

        {
          spotId: 6,
          url: "https://i.pinimg.com/736x/38/36/2b/38362b33850aa9e31668788b8fe58df7.jpg",
          preview: true,
        },
        {
          spotId: 7,
          url: "https://inhabitat.com/wp-content/blogs.dir/1/files/2016/04/Territorio-de-Zaguatas-Dog-Paradise-in-Costa-Rica-14-889x667.jpg",
          preview: true,
        },
        {
          spotId: 8,
          url: "https://imgcdn.stablediffusionweb.com/2024/5/4/4f99254d-0104-43e3-bf45-f64f119ad6b9.jpg",
          preview: true,
        },

        {
          spotId: 9,
          url: "https://www.hollywoodkittyco.com/media/catalog/category/EFMC2.jpg",
          preview: true,
        },
        {
          spotId: 10,
          url: "https://cdn.pixabay.com/photo/2024/05/08/08/25/forest-house-8747729_960_720.jpg",
          preview: true,
        },
        {
          spotId: 11,
          url: "https://www.chinoscaringkennel.com/wp-content/uploads/sites/11/2020/05/97550370_s.jpg",
          preview: true,
        },
        {
          spotId: 12,
          url: "https://img.sunset02.com/sunsetm/wp-content-uploads/2019-03-28UTC09/woof-ranch-doghouse-pd-workshop-pr-0718-900x506.jpg",
          preview: true,
        },
      ],
      options
    );
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "SpotImages";
    return queryInterface.bulkDelete(options, null, {});
  },
};
