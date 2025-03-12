// 「教練課程」的資料庫欄位設計
const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Course',
  tableName: 'COURSE',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
      nullable: false
    },
    user_id: {
      type: 'uuid',
      nullable: false
    },
    skill_id: {
      type: 'uuid',
      nullable: false
    },
    name: {
      type: 'varchar',
      length: 100,
      nullable: false
    },
    description: {
      type: 'text',
      nullable: false
    },
    startAt: {
      type: 'timestamp',
      name: 'start_at',
      nullable: false
    },
    endAt: {
      type: 'timestamp',
      name: 'end_at',
      nullable: false
    },
    max_participants: {
      type: 'integer',
      nullable: false
    },
    meeting_url: {
      type: 'varchar',
      length: 2048,
      nullable: false
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
    User: {
      target: 'User',
      type: 'many-to-one',
      joinColumn: {
          name: 'user_id',
          referencedColumnName: 'id',
          foreignKeyConstraintName: 'courses_user_id_fk'
      }
    },
    Skill: {
        target: 'Skill',
        type: 'many-to-one',
        joinColumn: {
            name: 'skill_id',
            referencedColumnName: 'id',
            foreignKeyConstraintName: 'courses_skill_id_fk'
        }
    }
  }
});
