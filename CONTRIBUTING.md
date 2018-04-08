Jak správně přispět do tohoto projektu
======================================

## Hlášení issue

Vždy ideálně vkládat se screenshotem, co je špatně či jaká je představa - pomůže to rychlejší orientaci.

Vedeme trojí typ:
 - bugy (chyby) - štítek `bug`,
 - diskuze (nad obecnějším tématem) - štítek `diskuze`
 - nová funkcionalita - typicky bez štítku

Možno doplnit štítek o jakou část projektu se jedná:
 - `osmcz-app` - mapová appka
 - `osmcz-web` - npress php webík
 - `osmcz-apiserver` - různé api služby (typicky běží na api.openstreetmap.cz či poloha.net)
 - `osmcz-tileserver` - vlastní mapové dlaždice (typicky běží na poloha.net - spravuje @pedro042)
 - `osmcz-general` - obecné téma


## Přispívání kódem

* Všechny knihovny je vhodné linkovat z CDN, aby se neplevelil repozitář.
* Funkčnost commitu je vhodné ověřit na `http://rawgit.com/[user]/[repo]/[commit sha či větev]/index.html`
* Featuru, kterou je možno oddělit, vložit do vlastního souboru, např `js/guideposts.js`
* U větších úprav **před tvorbou založit ISSUE**, aby se probralo jak na to. Předejde se tím, že by pull-request nebyl přijatý!
* **Commit message formát:** `<část aplikace>: <co se děje> #id`  -- nebo vizte [vzor](https://github.com/osmcz/osmcz/commits/master)
* Commit message i komentáře v kódu prosíme **anglicky**

* Backend + redakční systém spravujeme v repozitáři [osmcz-app](https://github.com/osmcz/osmcz-app). Zkontrolujte, že případné změny `index.html` jsou přeneseny do patřičného `*.latte`.

### Zaslání úpravy (pull-request)
Nejsnazší cesta je nechat si to forknout githubem a rovnou vytvořit pull request.

1. Vybrat nějaký soubor a kliknout na tlačítko :pencil2: (Fork this project and edit this file).
2. Commitnout úpravu.
3. Github vytvořil fork repozitáře. Do větve patch-1 je možné commitovat další úpravy
4. Dokončit vytvořením pull-requestu a popsat co/proč/jak.

Ideálně prosím dělat feature commity a psát srozumitelné commit message. Pokud nebude něco vyhovovat, tak nevadí - commity před aplikováním pročistíme.

* (Interní poznámka pro lidi s write-access: neklikat na tlačítko merge, nýbrž použít rebase)*

### Technologie
* Leaflet 1.0.3 http://leafletjs.com/
* Bootstrap 3.3.7 http://getbootstrap.com/ - používat zejména css komponenty odsud
* jQuery 3.1.1 http://jquery.com/
* kvůli snazší editovatelnosti komunitou nepoužíváme transpilery (ES6, LESS, ...)

### Organizace repozitáře
Hlavní vývojová větev je [master](https://github.com/osmcz/osmcz/tree/master), která zároveň slouží k otestování provedených změn.
Po otestování je vytvořen release a tag, který je následně bez dalších úprav embedován do složky `/theme` v repozitáři osmcz-web.
