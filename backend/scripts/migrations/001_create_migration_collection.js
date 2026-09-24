module.exports = {
  version: "001",
  name: "create_migration_collection",

  async up(db) {
    const exists = await db.listCollections({ name: "schema_migrations" }).hasNext();

    if (!exists) {
      await db.createCollection("schema_migrations");
      await db.collection("schema_migrations").createIndex(
        { version: 1 },
        { unique: true }
      );
    }
  },

  async down(db) {
    const exists = await db.listCollections({ name: "schema_migrations" }).hasNext();

    if (exists) {
      await db.collection("schema_migrations").drop();
    }
  },
};
