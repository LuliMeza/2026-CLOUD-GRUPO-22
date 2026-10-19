"use client";

import { useEffect, useState } from "react";

interface HealthStatus {
  status: string;
  service: string;
}

export default function HomePage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

  useEffect(() => {
    fetch(`${apiUrl}/health`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data: HealthStatus) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [apiUrl]);

  return (
    <main>
      <h1>2026 Cloud Grupo 22</h1>
      <p>Frontend Next.js desplegado en Vercel.</p>

      <div style={{
        marginTop: "2rem",
        padding: "1.25rem",
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
        backgroundColor: "#ffffff"
      }}>
        <h2>Estado de conexión con el Backend (Render)</h2>
        <p><strong>Backend URL:</strong> <code>{apiUrl}</code></p>
        
        {loading && <p>Verificando conexión con el backend...</p>}
        {error && (
          <p style={{ color: "#dc2626" }}>
            ❌ Error de conexión: {error}
          </p>
        )}
        {health && (
          <p style={{ color: "#16a34a" }}>
            ✅ Conectado con éxito: <strong>{health.status}</strong> (servicio: {health.service})
          </p>
        )}
      </div>
    </main>
  );
}

