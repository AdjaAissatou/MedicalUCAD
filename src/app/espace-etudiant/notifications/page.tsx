import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { formatDateHeure } from "@/lib/utils";
import {
  marquerNotificationLue,
  marquerToutesLues,
} from "@/app/actions/notifications";
import { Bell, Check, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await getSessionUser();
  const notifications = await prisma.notification.findMany({
    where: { userId: user!.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const nonLues = notifications.filter((n) => !n.lu).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {nonLues > 0
              ? `${nonLues} non lue${nonLues > 1 ? "s" : ""}`
              : "Tout est à jour."}
          </p>
        </div>
        {nonLues > 0 && (
          <form action={marquerToutesLues}>
            <Button type="submit" variant="outline" size="sm">
              <Check className="h-4 w-4" />
              Tout marquer comme lu
            </Button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Aucune notification"
          description="Vous serez prévenu ici dès qu'un document sera disponible."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card key={n.id} className={n.lu ? "" : "ring-1 ring-primary/30"}>
              <CardContent className="flex items-start gap-3 p-4">
                <span
                  className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                    n.lu ? "bg-transparent" : "bg-primary"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {n.titre}
                  </p>
                  {n.message && (
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {n.message}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDateHeure(n.createdAt)}
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    {n.lien && (
                      <Link
                        href={n.lien}
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                      >
                        Voir <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                    {!n.lu && (
                      <form action={marquerNotificationLue}>
                        <input type="hidden" name="id" value={n.id} />
                        <button
                          type="submit"
                          className="cursor-pointer text-xs text-muted-foreground hover:text-foreground"
                        >
                          Marquer comme lu
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
