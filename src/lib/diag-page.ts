import "server-only";

/** 診断結果を人が読める1枚に。**トークンなどの秘密は一切出さない。** */
export function diagPage(
  title: string,
  rows: [string, string][],
  action?: { href: string; label: string },
) {
  const body = rows
    .map(([k, v]) => `<tr><th>${escapeHtml(k)}</th><td>${escapeHtml(v)}</td></tr>`)
    .join("");
  const button = action
    ? `<p><a class="btn" href="${escapeHtml(action.href)}">${escapeHtml(action.label)}</a></p>`
    : "";

  return new Response(
    `<!doctype html><html lang="ja"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
:root{color-scheme:light dark}
body{font-family:system-ui,-apple-system,"Hiragino Sans",sans-serif;margin:0;padding:32px 20px;line-height:1.7}
main{max-width:640px;margin:0 auto}
h1{font-size:20px;margin:0 0 20px}
table{border-collapse:collapse;width:100%}
th,td{text-align:left;padding:10px 12px;border-bottom:1px solid rgba(128,128,128,.3);vertical-align:top}
th{width:38%;font-weight:600;white-space:nowrap}
td{word-break:break-all}
.btn{display:inline-block;margin-top:20px;padding:12px 20px;border-radius:8px;background:#111;color:#fff;text-decoration:none}
@media (prefers-color-scheme:dark){.btn{background:#eee;color:#111}}
</style>
<main><h1>${escapeHtml(title)}</h1><table>${body}</table>${button}</main>`,
    { status: 200, headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );
}
