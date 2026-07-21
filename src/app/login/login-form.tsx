"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, LogIn } from "lucide-react";

const initial: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initial);

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Adresse email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="prenom.nom@ucad.edu.sn"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="motDePasse">Mot de passe</Label>
        <Input
          id="motDePasse"
          name="motDePasse"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        <LogIn className="h-4 w-4" />
        {pending ? "Connexion…" : "Se connecter"}
      </Button>
    </form>
  );
}
