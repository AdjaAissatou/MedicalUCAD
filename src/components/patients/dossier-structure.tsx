"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import {
  ajouterAntecedent,
  supprimerAntecedent,
  ajouterAllergie,
  supprimerAllergie,
  ajouterVaccination,
  supprimerVaccination,
} from "@/app/actions/dossier";
import { ClipboardList, TriangleAlert, Syringe, Plus, Trash2, X } from "lucide-react";

type Antecedent = {
  id: string;
  type: string;
  libelle: string;
  annee: string | null;
  notes: string | null;
};
type Allergie = {
  id: string;
  substance: string;
  type: string;
  severite: string | null;
  reaction: string | null;
};
type Vaccination = {
  id: string;
  vaccin: string;
  dateAdmin: Date | null;
  rappel: Date | null;
  notes: string | null;
};

const LABEL_ANTECEDENT: Record<string, string> = {
  MEDICAL: "Médical",
  CHIRURGICAL: "Chirurgical",
  FAMILIAL: "Familial",
  CHRONIQUE: "Chronique",
};
const LABEL_ALLERGIE: Record<string, string> = {
  MEDICAMENTEUSE: "Médicamenteuse",
  ALIMENTAIRE: "Alimentaire",
  AUTRE: "Autre",
};
const VARIANT_SEVERITE: Record<string, "warning" | "destructive" | "neutral"> = {
  LEGERE: "neutral",
  MODEREE: "warning",
  SEVERE: "destructive",
};
const LABEL_SEVERITE: Record<string, string> = {
  LEGERE: "Légère",
  MODEREE: "Modérée",
  SEVERE: "Sévère",
};

function dateCourte(d: Date | null) {
  return d
    ? new Date(d).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;
}

function EnTete({
  icon: Icon,
  titre,
  onAdd,
  ouvert,
}: {
  icon: typeof ClipboardList;
  titre: string;
  onAdd: () => void;
  ouvert: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border p-5">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        <h2 className="font-semibold text-foreground">{titre}</h2>
      </div>
      <Button variant="ghost" size="sm" onClick={onAdd}>
        {ouvert ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        {ouvert ? "Fermer" : "Ajouter"}
      </Button>
    </div>
  );
}

function BoutonSuppr({
  action,
  id,
  patientId,
}: {
  action: (fd: FormData) => Promise<void>;
  id: string;
  patientId: string;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="patientId" value={patientId} />
      <button
        type="submit"
        aria-label="Supprimer"
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-destructive cursor-pointer"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </form>
  );
}

export function DossierStructure({
  dossierId,
  patientId,
  antecedents,
  allergies,
  vaccinations,
}: {
  dossierId: string;
  patientId: string;
  antecedents: Antecedent[];
  allergies: Allergie[];
  vaccinations: Vaccination[];
}) {
  const [ouvert, setOuvert] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function soumettre(
    action: (fd: FormData) => Promise<void>,
    fd: FormData
  ) {
    start(async () => {
      await action(fd);
      setOuvert(null);
    });
  }

  const champsCaches = (
    <>
      <input type="hidden" name="dossierId" value={dossierId} />
      <input type="hidden" name="patientId" value={patientId} />
    </>
  );

  return (
    <>
      {/* Antécédents */}
      <Card>
        <EnTete
          icon={ClipboardList}
          titre="Antécédents"
          ouvert={ouvert === "antecedent"}
          onAdd={() =>
            setOuvert(ouvert === "antecedent" ? null : "antecedent")
          }
        />
        <CardContent className="p-0">
          {ouvert === "antecedent" && (
            <form
              action={(fd) => soumettre(ajouterAntecedent, fd)}
              className="grid gap-3 border-b border-border bg-muted/30 p-4 sm:grid-cols-2"
            >
              {champsCaches}
              <div>
                <Label htmlFor="ant-type">Type</Label>
                <Select id="ant-type" name="type" defaultValue="MEDICAL" className="mt-1.5">
                  {Object.entries(LABEL_ANTECEDENT).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="ant-annee">Année / période</Label>
                <Input id="ant-annee" name="annee" placeholder="Ex : 2019" className="mt-1.5" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="ant-libelle" required>
                  Libellé
                </Label>
                <Input id="ant-libelle" name="libelle" required placeholder="Ex : Asthme, appendicectomie…" className="mt-1.5" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="ant-notes">Notes</Label>
                <Input id="ant-notes" name="notes" className="mt-1.5" />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <Button type="submit" variant="accent" size="sm" loading={pending}>
                  Ajouter
                </Button>
              </div>
            </form>
          )}
          {antecedents.length === 0 ? (
            <EmptyState icon={ClipboardList} title="Aucun antécédent" description="Ajoutez les antécédents médicaux, chirurgicaux ou familiaux." />
          ) : (
            <ul className="divide-y divide-border">
              {antecedents.map((a) => (
                <li key={a.id} className="flex items-start justify-between gap-2 px-4 py-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{a.libelle}</span>
                      <Badge variant="neutral">{LABEL_ANTECEDENT[a.type] ?? a.type}</Badge>
                      {a.annee && <span className="text-xs text-muted-foreground">{a.annee}</span>}
                    </div>
                    {a.notes && <p className="mt-0.5 text-sm text-muted-foreground">{a.notes}</p>}
                  </div>
                  <BoutonSuppr action={supprimerAntecedent} id={a.id} patientId={patientId} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Allergies */}
      <Card>
        <EnTete
          icon={TriangleAlert}
          titre="Allergies"
          ouvert={ouvert === "allergie"}
          onAdd={() => setOuvert(ouvert === "allergie" ? null : "allergie")}
        />
        <CardContent className="p-0">
          {ouvert === "allergie" && (
            <form
              action={(fd) => soumettre(ajouterAllergie, fd)}
              className="grid gap-3 border-b border-border bg-muted/30 p-4 sm:grid-cols-2"
            >
              {champsCaches}
              <div>
                <Label htmlFor="all-substance" required>
                  Substance
                </Label>
                <Input id="all-substance" name="substance" required placeholder="Ex : Pénicilline, arachide…" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="all-type">Type</Label>
                <Select id="all-type" name="type" defaultValue="MEDICAMENTEUSE" className="mt-1.5">
                  {Object.entries(LABEL_ALLERGIE).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="all-severite">Sévérité</Label>
                <Select id="all-severite" name="severite" defaultValue="LEGERE" className="mt-1.5">
                  {Object.entries(LABEL_SEVERITE).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="all-reaction">Réaction</Label>
                <Input id="all-reaction" name="reaction" placeholder="Ex : urticaire, œdème…" className="mt-1.5" />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <Button type="submit" variant="accent" size="sm" loading={pending}>
                  Ajouter
                </Button>
              </div>
            </form>
          )}
          {allergies.length === 0 ? (
            <EmptyState icon={TriangleAlert} title="Aucune allergie connue" description="Ajoutez les allergies médicamenteuses, alimentaires ou autres." />
          ) : (
            <ul className="divide-y divide-border">
              {allergies.map((a) => (
                <li key={a.id} className="flex items-start justify-between gap-2 px-4 py-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{a.substance}</span>
                      <Badge variant="neutral">{LABEL_ALLERGIE[a.type] ?? a.type}</Badge>
                      {a.severite && (
                        <Badge variant={VARIANT_SEVERITE[a.severite] ?? "neutral"}>
                          {LABEL_SEVERITE[a.severite] ?? a.severite}
                        </Badge>
                      )}
                    </div>
                    {a.reaction && <p className="mt-0.5 text-sm text-muted-foreground">{a.reaction}</p>}
                  </div>
                  <BoutonSuppr action={supprimerAllergie} id={a.id} patientId={patientId} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Vaccinations */}
      <Card>
        <EnTete
          icon={Syringe}
          titre="Vaccinations"
          ouvert={ouvert === "vaccination"}
          onAdd={() =>
            setOuvert(ouvert === "vaccination" ? null : "vaccination")
          }
        />
        <CardContent className="p-0">
          {ouvert === "vaccination" && (
            <form
              action={(fd) => soumettre(ajouterVaccination, fd)}
              className="grid gap-3 border-b border-border bg-muted/30 p-4 sm:grid-cols-2"
            >
              {champsCaches}
              <div className="sm:col-span-2">
                <Label htmlFor="vac-vaccin" required>
                  Vaccin
                </Label>
                <Input id="vac-vaccin" name="vaccin" required placeholder="Ex : Fièvre jaune, hépatite B…" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="vac-date">Date d&apos;administration</Label>
                <Input id="vac-date" name="dateAdmin" type="date" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="vac-rappel">Prochain rappel</Label>
                <Input id="vac-rappel" name="rappel" type="date" className="mt-1.5" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="vac-notes">Notes</Label>
                <Input id="vac-notes" name="notes" className="mt-1.5" />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <Button type="submit" variant="accent" size="sm" loading={pending}>
                  Ajouter
                </Button>
              </div>
            </form>
          )}
          {vaccinations.length === 0 ? (
            <EmptyState icon={Syringe} title="Aucune vaccination" description="Ajoutez les vaccins administrés et les rappels prévus." />
          ) : (
            <ul className="divide-y divide-border">
              {vaccinations.map((v) => (
                <li key={v.id} className="flex items-start justify-between gap-2 px-4 py-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{v.vaccin}</span>
                      {dateCourte(v.dateAdmin) && (
                        <span className="text-xs text-muted-foreground">
                          Administré le {dateCourte(v.dateAdmin)}
                        </span>
                      )}
                    </div>
                    {dateCourte(v.rappel) && (
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        Rappel : {dateCourte(v.rappel)}
                      </p>
                    )}
                    {v.notes && <p className="mt-0.5 text-sm text-muted-foreground">{v.notes}</p>}
                  </div>
                  <BoutonSuppr action={supprimerVaccination} id={v.id} patientId={patientId} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}
