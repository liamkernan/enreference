# Enrefrence

Static cultural index built with HTML, CSS, and JavaScript.

## Hosting

GitHub Pages publishes the `main` branch through `.github/workflows/deploy.yml`.
The public repository is https://github.com/liamkernan/enreference.
The initial hosting address is https://liamkernan.github.io/enreference/.
Push changes to `main` to publish an update. No paid hosting or services are used.

The build packages only HTML pages, `styles.css`, `site.js`, and `images/`.
Local settings, old drafts, environment files, and build output are ignored.

## Local preview

```sh
python3 scripts/build.py
python3 -m http.server 8080 --directory dist
```

Open http://localhost:8080. No dependencies or installation are required.

## Custom domain

The intended custom domain is `enreference.com`, with `www.enreference.com`
redirecting to it. DNS is currently managed in Wix.

Before changing DNS, set the custom domain in this repository's Pages settings.
Replace the existing three Wix A records for the root domain with these four:

| Type | Host | Value | TTL |
| --- | --- | --- | --- |
| A | @ | 185.199.108.153 | 1 hour |
| A | @ | 185.199.109.153 | 1 hour |
| A | @ | 185.199.110.153 | 1 hour |
| A | @ | 185.199.111.153 | 1 hour |
| CNAME | www | liamkernan.github.io | 1 hour |

Replace the existing `www` CNAME value `cdn3.wixdns.net` with the value above.
Keep unrelated mail, verification, and other DNS records. Enable Enforce HTTPS
in GitHub Pages after DNS validation and certificate issuance succeed.
Verify the domain in the GitHub account's Pages settings using its generated
TXT record when DNS access is available.

DNS instructions: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

## Existing functionality

Newsletter signups are demonstrations and do not send or save email addresses.
Games and merchandise marked coming soon remain placeholders.
