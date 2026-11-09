import { Badge, Button, Card } from "@/components";

export default function HomePage() {
  return (
    <main>
      <h1 className="h1">Aula Clara UTN</h1>
      <p className="body" style={{ color: "var(--ink-muted)", marginTop: 4 }}>
        Primera pantalla de prueba, conectada al Design System.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-4)", marginTop: "var(--space-8)" }}>
        <Card
          title="Análisis de Sistemas"
          meta="Comisión 9D8 · Prof. Rivas"
          tone="success"
          comment="Exige, pero avisa todo con anticipación. El TP integrador lleva tiempo, arranquen temprano."
          footerMeta="+23 valoraciones"
        />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-4)", marginTop: "var(--space-6)" }}>
        <Button variant="primary">Dejar valoración</Button>
        <Button variant="secondary">Ver perfil</Button>
        <Badge tone="warning" />
      </div>
    </main>
  );
}
