import prisma from "../config/db";

type NotifyUserInput = {
  userId: string;
  title: string;
  message: string;
  type: string;
  metadata?: any;
};

export const notifyUser = async ({
  userId,
  title,
  message,
  type,
  metadata,
}: NotifyUserInput) => {
  return prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      metadata,
    },
  });
};