import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Slot minimaliste (inspiré de @radix-ui/react-slot).
 *
 * Permet le motif `asChild` : au lieu d'imbriquer un élément dans un autre
 * (ex. `<a><button/></a>`, qui est du HTML invalide), on fusionne les props du
 * parent sur l'unique enfant. `<Button asChild><Link/></Button>` rend alors un
 * seul `<a>` stylé comme un bouton — sémantiquement correct et accessible.
 *
 * Fusionne : className (via cn), style, gestionnaires d'événements (les deux
 * sont appelés) et la ref.
 */
export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

export const Slot = React.forwardRef<HTMLElement, SlotProps>(
  ({ children, ...slotProps }, forwardedRef) => {
    if (!React.isValidElement(children)) {
      if (React.Children.count(children) > 1) {
        React.Children.only(null); // lève une erreur explicite
      }
      return null;
    }

    const child = children as React.ReactElement<Record<string, unknown>>;
    const childProps = child.props;

    const mergedProps: Record<string, unknown> = { ...slotProps, ...childProps };

    // className : parent d'abord, enfant ensuite (l'enfant peut surcharger).
    mergedProps.className = cn(
      slotProps.className as string | undefined,
      childProps.className as string | undefined
    );

    // style : fusion superficielle.
    if (slotProps.style || childProps.style) {
      mergedProps.style = {
        ...(slotProps.style as React.CSSProperties),
        ...(childProps.style as React.CSSProperties),
      };
    }

    // Gestionnaires d'événements : appeler les deux (parent puis enfant).
    for (const key of Object.keys(slotProps)) {
      if (/^on[A-Z]/.test(key)) {
        const parentHandler = slotProps[key as keyof typeof slotProps];
        const childHandler = childProps[key];
        if (typeof parentHandler === "function") {
          mergedProps[key] = (...args: unknown[]) => {
            (childHandler as ((...a: unknown[]) => void) | undefined)?.(...args);
            (parentHandler as (...a: unknown[]) => void)(...args);
          };
        }
      }
    }

    // ref : fusion parent + enfant. En React 19, la ref de l'enfant est une prop
    // normale (`props.ref`) ; on retombe sur `element.ref` pour les versions
    // antérieures.
    const childRef =
      (childProps.ref as React.Ref<unknown> | undefined) ??
      (child as unknown as { ref?: React.Ref<unknown> }).ref;
    mergedProps.ref = mergeRefs(forwardedRef, childRef);

    return React.cloneElement(child, mergedProps);
  }
);
Slot.displayName = "Slot";

function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]): React.RefCallback<T> {
  return (node: T) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node);
      else if (ref && typeof ref === "object") {
        (ref as React.MutableRefObject<T | null>).current = node;
      }
    }
  };
}
