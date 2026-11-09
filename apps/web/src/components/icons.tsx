import type { LucideIcon, LucideProps } from "lucide-react";
import { CircleAlert, Clock, Eye, EyeOff, Lock, Mail, Moon, Sun } from "lucide-react";

/* Íconos del Design System, sobre lucide-react (ver docs/standards/frontend-design-system.md).
   Este archivo fija los valores del sistema — 20 px, trazo 1,8 — y que sean
   decorativos (aria-hidden): el nombre accesible lo pone el control que los contiene.
   La app importa siempre desde acá, nunca directo de lucide-react, así el estilo
   se cambia en un solo lugar. Para sumar un ícono: importarlo de lucide-react y
   exportarlo con dsIcon(). */

export type IconProps = Omit<LucideProps, "ref">;

function dsIcon(Icon: LucideIcon, displayName: string) {
  function DsIcon(props: IconProps) {
    return <Icon size={20} strokeWidth={1.8} aria-hidden="true" focusable="false" {...props} />;
  }
  DsIcon.displayName = displayName;
  return DsIcon;
}

export const EyeIcon = dsIcon(Eye, "EyeIcon");
export const EyeOffIcon = dsIcon(EyeOff, "EyeOffIcon");
export const MoonIcon = dsIcon(Moon, "MoonIcon");
export const SunIcon = dsIcon(Sun, "SunIcon");
export const AlertCircleIcon = dsIcon(CircleAlert, "AlertCircleIcon");
export const MailIcon = dsIcon(Mail, "MailIcon");
export const LockIcon = dsIcon(Lock, "LockIcon");
export const ClockIcon = dsIcon(Clock, "ClockIcon");
