/**
 * Arranca Mock Service Worker en el navegador, una sola vez. Solo se importa
 * (con import dinámico) cuando NEXT_PUBLIC_API_MOCKING=enabled — ver src/services/api.ts.
 * El worker vive en public/mockServiceWorker.js: lo genera `npx msw init public`
 * y se vuelve a generar al actualizar msw.
 */
let ready: Promise<unknown> | undefined;

export function enableMocking(): Promise<unknown> {
  if (typeof window === "undefined") return Promise.resolve();
  ready ??= import("./browser").then(({ worker }) =>
    worker.start({
      // Lo que no tiene handler (assets, fuentes, Next) pasa sin aviso.
      onUnhandledFrame: "bypass",
      quiet: true,
    }),
  );
  return ready;
}
