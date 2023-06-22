"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const runtime_1 = require("@prisma/client/runtime");
const prisma = new client_1.PrismaClient({
    log: ["query", "info", "warn", "error"],
});
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const deletedPosts = yield prisma.post.deleteMany({
                where: {
                    id: {
                        gt: 0,
                    },
                },
            });
            console.log(deletedPosts);
            const deletedUsers = yield prisma.user.deleteMany({
                where: {
                    id: {
                        gt: 0,
                    },
                },
            });
            console.log(deletedUsers);
        }
        catch (e) {
            if (e instanceof runtime_1.PrismaClientKnownRequestError) {
                console.log(e.code);
                console.log(e.message);
            }
        }
        const user = yield prisma.user.create({
            data: {
                name: "Alice",
                email: "alice@prisma.io",
            },
        });
        console.log(user);
        const users = yield prisma.user.findMany();
        console.log(users);
        const userWithPost = yield prisma.user.create({
            data: {
                name: "Bob",
                email: "bob@prisma.io",
                posts: {
                    create: {
                        title: "Timber Post Title",
                        content: "Timber Post"
                    },
                },
            },
        });
        console.log(userWithPost);
        const usersWithPosts = yield prisma.user.findMany({
            include: {
                posts: true,
            },
        });
        console.dir(usersWithPosts, { depth: null });
        console.log("======================");
        console.log("queries...");
        console.log("======================");
        console.log("left join...");
        const usrAndPostLeft = yield prisma.user.findMany({
            include: {
                posts: true,
            },
        });
        console.log(usrAndPostLeft);
        console.log("inner join...");
        const usrAndPostInner = yield prisma.user.findMany({
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
            findByTitleAndText(title, content) {
                return __awaiter(this, void 0, void 0, function* () {
                    return yield prisma.post.findMany({
                        where: {
                            title: title,
                            content: {
                                contains: content,
                            },
                        },
                    });
                });
            }
        }
        const timberPost = yield new PostRepository().findByTitleAndText("Timber Post Title", "Timber");
        console.log(timberPost);
        console.log("native queries...");
        const r = yield prisma.$queryRaw(client_1.Prisma.sql `select * from user`);
        console.log(r);
        const r2 = yield prisma.$queryRaw(client_1.Prisma.sql `select * from user`);
        r2.forEach((us) => {
            console.log(us);
        });
    });
}
main()
    .then(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}))
    .catch((e) => __awaiter(void 0, void 0, void 0, function* () {
    console.error(e);
    yield prisma.$disconnect();
    process.exit(1);
}));
//# sourceMappingURL=script.js.map