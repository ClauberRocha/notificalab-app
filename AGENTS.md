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

- Reporting uses `public.vw_notificacoes` with `security_invoker` and the `SECURITY INVOKER` RPC `public.painel_resumo`; both preserve source-table RLS and expose only the reporting column allowlist to authenticated users.
- The panel uses the five-argument `painel_resumo` overload for aggregate-only reads; nominal exports fetch source rows on click in stable 1000-row pages to avoid loading patient data for charts.
- Panel alert preferences are stored together under the `alertas` key in `painel_config`; RLS enforces admin-only writes and a trigger stamps actor/time, while the latest-import RPC exposes only a timestamp without widening access to audit logs.
- User territories use one canonical row per user; admin-verified server functions manage and read other users' territories while direct RLS reads remain owner-only. SQL territory lookup and form options share the official IBGE municipality codes and existing regional mapping; case policies remain unchanged at this stage.
