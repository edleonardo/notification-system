import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateNotificationLogsTable1700000001000 implements MigrationInterface {
  name = "CreateNotificationLogsTable1700000001000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "notification_logs",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "gen_random_uuid()",
          },
          {
            name: "message_id",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "message_category",
            type: "varchar",
            length: "50",
            isNullable: false,
          },
          { name: "message_body", type: "text", isNullable: false },
          {
            name: "user_id",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "user_name",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "user_email",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "user_phone",
            type: "varchar",
            length: "50",
            isNullable: false,
          },
          { name: "channel", type: "varchar", length: "50", isNullable: false },
          {
            name: "status",
            type: "varchar",
            length: "50",
            isNullable: false,
            default: "'pending'",
          },
          { name: "error_message", type: "text", isNullable: true },
          { name: "sent_at", type: "timestamp", isNullable: true },
          {
            name: "created_at",
            type: "timestamp",
            isNullable: false,
            default: "NOW()",
          },
        ],
      }),
      true,
    );

    const indexes: [string, string[]][] = [
      ["IDX_notif_logs_created_at", ["created_at"]],
      ["IDX_notif_logs_status", ["status"]],
      ["IDX_notif_logs_channel", ["channel"]],
      ["IDX_notif_logs_user_id", ["user_id"]],
      ["IDX_notif_logs_message_id", ["message_id"]],
    ];

    for (const [name, columnNames] of indexes) {
      await queryRunner.createIndex(
        "notification_logs",
        new TableIndex({ name, columnNames }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("notification_logs", true);
  }
}
