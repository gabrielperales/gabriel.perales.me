---
name: add-project
description: Add a new project to the personal website's Projects page. Navigates to the project URL, captures a screenshot, generates a description, and registers the entry in data/projectsData.ts. Use when the user asks to add a project, add a new project to the site/página, or "añadir proyecto".
---

# Add Project

Registra un nuevo proyecto en `data/projectsData.ts` para que aparezca en `/projects`.

## Data model

`data/projectsData.ts` exporta `projectsData: Project[]`:

```ts
interface Project {
  title: string
  description: string
  href?: string
  imgSrc?: string
}
```

Cada imagen vive en `public/static/images/{slug}.png` y se referencia como `imgSrc: '/static/images/{slug}.png'`.

## Steps

1. **Reunir inputs.** Pide o infiere: título del proyecto y URL. Si falta la URL, pregunta al usuario — es obligatoria para la captura y para `href`.

2. **Slug.** Deriva un slug kebab-case del título (ej. "Oxbow UI" → `oxbow-ui`). Comprueba que `public/static/images/{slug}.png` no exista ya; si existe, avisa y pide confirmación antes de sobrescribir.

3. **Captura de pantalla.**
   - Usa las herramientas de `claude-in-chrome` (o `chrome-devtools` si no están disponibles). Si las tools están deferidas, cárgalas primero con `ToolSearch`, en una sola llamada:
     `ToolSearch({query: "select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__computer,mcp__claude-in-chrome__tabs_create_mcp,mcp__claude-in-chrome__tabs_close_mcp"})`
   - Abre una tab nueva y navega a la URL del proyecto.
   - Espera a que cargue (evita capturar splash/loading screens).
   - Toma un screenshot de la página (viewport estándar, no full-page a menos que el diseño lo pida).
   - Guarda la imagen en `public/static/images/{slug}.png`. Si la herramienta de captura no permite guardar directo en esa ruta, guarda en el scratchpad y luego muévela con `Bash` (`cp`/`mv`) a `public/static/images/{slug}.png`.
   - Cierra la tab.

4. **Descripción.** Escribe una descripción breve (2-4 frases) en español o el idioma que use el resto de `projectsData.ts` (actualmente inglés — respeta el idioma existente salvo que el usuario pida lo contrario). Basa la descripción en lo que se ve en la página, el `<title>`/meta description, y cualquier contexto que dé el usuario. No inventes funcionalidades que no se vean o que el usuario no confirme.

5. **Editar `data/projectsData.ts`.** Añade un nuevo objeto al array `projectsData`, siguiendo el mismo formato y estilo de comillas que las entradas existentes (backticks para `description`, comillas simples para el resto). Insértalo al principio o al final del array — pregunta al usuario si el orden importa (los proyectos más recientes suelen ir primero).

6. **Verificar.** Corre el dev server o `yarn build`/`yarn lint` si el usuario lo pide para confirmar que no hay errores de tipos. No es obligatorio salvo que el usuario lo pida — el cambio es un objeto de datos plano.

7. **Reporta** el diff final: título, slug, ruta de imagen, y el objeto añadido.

## Notes

- No commitees automáticamente — deja el cambio en el working tree salvo que el usuario pida explícitamente crear el commit.
- Si el proyecto no tiene URL pública (ej. repo privado), omite `href` e igualmente intenta conseguir una captura si el usuario provee otra fuente (localhost, imagen ya existente, etc.) — si no hay forma de capturar, pide la imagen al usuario o pregunta si continuar sin `imgSrc`.
