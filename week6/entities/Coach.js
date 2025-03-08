// 「教練」的資料庫欄位設計
const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Coach',
  tableName: 'COACH',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
      nullable: false
    },
    user_id: {
      type: 'uuid',
      nullable: false,
      unique:true
    },
    experience_years: {
      type: 'integer',
      nullable: false
    },
    description: {
      type: 'text',
      nullable: false
    },
    profile_image_url: {
      type: 'varchar',
      length: 2048,
      nullable: true
    },
    createdAt: {
      type: 'timestamp',
      createDate: true,
      name: 'created_at',
      nullable: false
    },
    updatedAt: {
      type: 'timestamp',
      createDate: true,
      name: 'updated_at',
      nullable: false
    }
  },
  relations: {
    User : {
      target: "User",
      type: "one-to-one",
      inverseSide : "Coach",
      joinColumn: {
        name: 'user_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'user_coach_id_fk'
      }
    }
  }
});
