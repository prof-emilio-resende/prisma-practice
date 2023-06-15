import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const userDelete = await prisma.user.delete({
    where: {
      email: "alice@prisma.io",
    },
  });
  console.log(userDelete);
  const user = await prisma.user.create({
    data: {
      name: "Alice",
      email: "alice@prisma.io",
    },
  });
  console.log(user);
  const users = await prisma.user.findMany();
  console.log(users);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
