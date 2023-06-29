import { Prisma, PrismaClient, User } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

async function main() {
  try {
    const deletedPosts = await prisma.post.deleteMany({
      where: {
        id: {
          gt: 0,
        },
      },
    });
    console.log(deletedPosts);

    const deletedUsers = await prisma.user.deleteMany({
      where: {
        id: {
          gt: 0,
        },
      },
    });
    console.log(deletedUsers);
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError) {
      console.log(e.code);
      console.log(e.message);
    }
  }

  const user = await prisma.user.create({
    data: {
      name: "Alice",
      email: "alice@prisma.io",
    },
  });
  console.log(user);

  const users = await prisma.user.findMany();
  console.log(users);

  const userWithPost = await prisma.user.create({
    data: {
      name: "Bob",
      email: "bob@prisma.io",
      posts: {
        create: {
          title: "Timber Post Title",
          content: "Timber Post",
        },
      },
    },
  });
  console.log(userWithPost);
  const usersWithPosts = await prisma.user.findMany({
    include: {
      posts: true,
    },
  });
  console.dir(usersWithPosts, { depth: null });

  console.log("======================");
  console.log("queries...");
  console.log("======================");
  console.log("left join...");
  const usrAndPostLeft = await prisma.user.findMany({
    include: {
      posts: true,
    },
  });
  console.log(usrAndPostLeft);

  console.log("inner join...");
  const usrAndPostInner = await prisma.user.findMany({
    include: {
      posts: true,
    },
    where: {
      posts: {
        some: {
          NOT: {
            id: 0,
          },
        },
      },
    },
  });
  console.log(usrAndPostInner);

  console.log("repository...");
  class PostRepository {
    public async findByTitleAndText(title: string, content: string) {
      return await prisma.post.findMany({
        where: {
          title: title,
          content: {
            contains: content,
          },
        },
      });
    }
  }
  const timberPost = await new PostRepository().findByTitleAndText(
    "Timber Post Title",
    "Timber"
  );
  console.log(timberPost);

  console.log("native queries...");
  const r = await prisma.$queryRaw(Prisma.sql`select * from user`);
  console.log(r);

  const r2 = await prisma.$queryRaw<User[]>(Prisma.sql`select * from user`);
  r2.forEach((us) => {
    console.log(us);
  });

  console.log("Transaction sample...");
  console.log("before transaction ...");
  let allPosts = await prisma.post.findMany();
  console.log(allPosts);

  try {
    const newPost: Prisma.PostCreateInput = {
      content: "New Post",
      title: "New Post Title",
      author: {
        connect: {
          id: user.id
        }
      }
    };
    const newPostDupe: Prisma.PostCreateInput = {
      content: "New Post",
      title: "New Post Title",
      author: {
        connect: {
          id: user.id
        }
      }
    };
    const [c1, c2] = await prisma.$transaction([
      prisma.post.create({data: newPost}),
      prisma.post.create({data: newPostDupe})
    ]);
  } catch (error) {
    console.log("expected error ... rollback already happened!");
  }

  console.log("after transaction ...");
  allPosts = await prisma.post.findMany();
  console.log(allPosts);
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
