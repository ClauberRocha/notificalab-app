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
