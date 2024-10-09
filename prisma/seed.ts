// import { PrismaClient } from "@prisma/client";
// import crypto from "crypto";

// const prisma = new PrismaClient();

// const seedUsers = async () => {
//   const users = [
//     {
//       name: "Administrator",
//       email: "admin@admin.com",
//       password: crypto.createHash("sha256").update("admin").digest("hex"),
//       username: "admin",
//     },
//   ];
//   // create user if not exists by username
//   for (const user of users) {
//     const existingUser = await prisma.user.findUnique({
//       where: { username: user.username },
//     });
//     if (!existingUser) {
//       await prisma.user.create({ data: user });
//       console.log(`User ${user.username} created`);
//     }
//   }
// };

// const main = async () => {
//   await seedUsers();
// };

// main();
