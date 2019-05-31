const Sequelize = require('sequelize')
const sequelize = require('../mysql/sequelize')

const Dictionary = sequelize.define('dictionary', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  vocName: {
    field: 'voc_name',
    type: Sequelize.STRING(255)
  },
  vocPl: {
    field: 'voc_pl',
    type: Sequelize.STRING(255)
  },
  vocPast: {
    field: 'voc_past',
    type: Sequelize.STRING(255)
  },
  vocIng: {
    field: 'voc_ing',
    type: Sequelize.STRING(255)
  },
  vocThird: {
    field: 'voc_third',
    type: Sequelize.STRING(255)
  },
  vocEr: {
    field: 'voc_er',
    type: Sequelize.STRING(255)
  },
  vocEst: {
    field: 'voc_est',
    type: Sequelize.STRING(255)
  },
  phEn: {
    field: 'ph_en',
    type: Sequelize.STRING(255)
  },
  phAm: {
    field: 'ph_am',
    type: Sequelize.STRING(255)
  },
  phEn_mp3: {
    field: 'ph_en_mp3',
    type: Sequelize.STRING(255)
  },
  phAm_mp3: {
    field: 'ph_am_mp3',
    type: Sequelize.STRING(255)
  },
  means: Sequelize.STRING(255),
  sent1: Sequelize.STRING(255),
  sent2: Sequelize.STRING(255),
  sent1Cn: {
    field: 'sent1_cn',
    type: Sequelize.STRING(255)
  },
  sent2Cn: {
    field: 'sent2_cn',
    type: Sequelize.STRING(255)
  }
}, {
  // 不要擅自添加时间戳属性
  timestamps: false,
  // 不要擅自将表名变为复数
  freezeTableName: true
});

module.exports = Dictionary