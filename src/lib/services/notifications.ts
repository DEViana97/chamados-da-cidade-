import { prisma } from "@/lib/prisma"
import type { NotificationType, Occurrence, Comment } from "@/generated/prisma/client"

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  body: string,
  link?: string,
) {
  const pref = await prisma.notificationPreference.findUnique({
    where: { userId_type: { userId, type } },
  })
  if (pref && !pref.enabled) return

  await prisma.notification.create({
    data: { userId, type, title, body, link: link ?? null },
  })
}

export async function notifyOccurrenceCreated(
  occurrence: Pick<Occurrence, "id" | "title" | "userId">,
  creatorId: string,
) {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", id: { not: creatorId } },
    select: { id: true },
  })

  await Promise.all(
    admins.map((admin) =>
      createNotification(
        admin.id,
        "OCCURRENCE_CREATED",
        "Nova ocorrência criada",
        `"${occurrence.title}" foi registrada.`,
        `/dashboard/occurrences/${occurrence.id}`,
      ),
    ),
  )
}

export async function notifyStatusChanged(
  occurrence: Pick<Occurrence, "id" | "title" | "userId">,
  newStatus: string,
  changedByUserId: string,
) {
  const notifyIds = new Set<string>()
  if (occurrence.userId && occurrence.userId !== changedByUserId) {
    notifyIds.add(occurrence.userId)
  }

  const statusLabel: Record<string, string> = {
    OPEN: "Aberta",
    IN_PROGRESS: "Em andamento",
    RESOLVED: "Resolvida",
  }

  await Promise.all(
    [...notifyIds].map((id) =>
      createNotification(
        id,
        "STATUS_CHANGED",
        "Status atualizado",
        `"${occurrence.title}" mudou para ${statusLabel[newStatus] ?? newStatus}.`,
        `/dashboard/occurrences/${occurrence.id}`,
      ),
    ),
  )
}

export async function notifyCommentAdded(
  comment: Pick<Comment, "occurrenceId" | "authorId">,
  occurrence: Pick<Occurrence, "id" | "title" | "userId">,
  authorName: string,
) {
  const previousCommenters = await prisma.comment.findMany({
    where: { occurrenceId: occurrence.id, authorId: { not: comment.authorId } },
    select: { authorId: true },
    distinct: ["authorId"],
  })

  const notifyIds = new Set<string>(previousCommenters.map((c) => c.authorId))
  if (occurrence.userId && occurrence.userId !== comment.authorId) {
    notifyIds.add(occurrence.userId)
  }

  await Promise.all(
    [...notifyIds].map((id) =>
      createNotification(
        id,
        "COMMENT_ADDED",
        "Novo comentário",
        `${authorName} comentou em "${occurrence.title}".`,
        `/dashboard/occurrences/${occurrence.id}`,
      ),
    ),
  )
}
