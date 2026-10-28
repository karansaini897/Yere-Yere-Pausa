<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- The public landing page (/) renders without the app sidebar; all operational pages share the sidebar shell in __root. Why: the landing is a marketing surface, the rest is the tool.
- Landing background is a dependency-free 2D canvas started in useEffect over a CSS gradient fallback. Why: SSR-safe, respects reduced motion, no 3D library weight.
