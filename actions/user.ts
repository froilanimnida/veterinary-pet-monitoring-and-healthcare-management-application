"use server";

import { prisma } from "@/lib/prisma";

const getUserId = async (email: string) => {
    const user = await prisma.users.findUnique({
        where: {
            email: email,
        },
    });
    if (!user) {
        throw new Error("User not found");
    }
    return user.user_id;
};

export { getUserId };
