# osmcz-app

JS mapová appka pro OpenStreetMap.cz postavená nad LeafletJS a VanillaJS.
PHP backend v repozitáři [osmcz-web](https://github.com/osmcz/osmcz-web). 

* **LIVE verze:** [openstreetmap.cz](https://openstreetmap.cz/) 
* **ISSUES:** [na githubu](https://github.com/osmcz/osmcz/issues)
* **DEMO:** [pro vývojovou větev](http://rawgit.com/osmcz/osmcz/master/index.html) - živě zrcadlí větev `master`


## Jak přispět do projektu
* hlásit chyby a podněty do ISSUES ([jak správně?](CONTRIBUTING.md))
* vylepšit webovou aplikaci - viz [CONTRIBUTING.md](CONTRIBUTING.md#přispívání-kódem)


### Další poznámky
* Kdo má zájem přidat se k organizaci [github.com/osmcz](https://github.com/osmcz), nechť napíše na dev(z)openstreetmap.cz
* Číslo release je na prvním řádku v `js/osmcz.js`, jednotlivé verze pak pomocí git-tagů
* Projektová stránka na [openstreetmap.cz/osmcz-app](https://openstreetmap.cz/osmcz-app)

## Changelog
2018-09-23 **osmcz v0.23** (
    [talk](https://openstreetmap.cz/talkcz/c2573),
    [osmcz-app](https://github.com/osmcz/osmcz/compare/v0.22...v0.23), 
- opraveno přepínání vrstev map
- default mapa je nyní místo Mapbox (neaktuální) Wikipedia
- konfigurační volby přesunuty do samostatného souboru

2018-09-11 **osmcz v0.22** (
    [talk](https://openstreetmap.cz/talkcz/c2573),
    [osmcz-app](https://github.com/osmcz/osmcz/compare/v0.21...v0.22), 
- podpora a ikona pro rozcestníky jen s tourism=info
- vrstva Strava heatmap hot/all pro ČR
- přepnuto na databázi fotek Fody (aktivní vrstva, fotky rozcestníků, chybné rozcestníky)

2018-03-12 **osmcz v0.21** (
    [talk](https://openstreetmap.cz/talkcz/c2419),
    [osmcz-app](https://github.com/osmcz/osmcz/compare/v0.20...v0.21), 
    [osmcz-web](https://github.com/osmcz/osmcz-web/compare/deploy_20180108...osmcz:deploy_20180315))
- linkování cest a ploch zobrazuje těžiště
- GUI pro vlastní marker - po kliku na souřadnice vlevo dole se ukáže tlačítko "vytvořit značku"

2018-01-08 **osmcz v0.20** (
    [talk](https://openstreetmap.cz/talkcz/c2355), 
    [osmcz-app](https://github.com/osmcz/osmcz/compare/v0.19...v0.20), 
    [osmcz-web](https://github.com/osmcz/osmcz-web/compare/deploy_20170123...osmcz:deploy_20180108))
- archiv talk-cz na https://openstreetmap.cz/talkcz/

2017-05-07  **osmcz v0.19** (
    [talk](https://openstreetmap.cz/talkcz/c2105), 
    [osmcz-app](https://github.com/osmcz/osmcz/compare/v0.18...v0.19) ) 
- nový interface pro PhotoDB [#10](https://github.com/osmcz/osmcz/issues/10)

2017-04-12  **osmcz v0.18** (
    [talk](https://openstreetmap.cz/talkcz/c2071), 
    [osmcz-app](https://github.com/osmcz/osmcz/compare/v0.17...v0.18) ) 
- vrstva notes [#67](https://github.com/osmcz/osmcz/issues/67) a openinframap


![nahled](https://openstreetmap.cz/data/thumbs/60.700x476.png)


## Poděkování
* autoři leafletu + pluginů
* autoři a provozovatelé mapových vrstev
* openstreetmap-website JS + API
* bootstrap-css
* poloha.net API + vrstvy
* mapbox.com JS + vrstvy


## Autoři, licence 
(c) 2016-2018 zbycz, mkyral, walley a [další](https://github.com/osmcz/osmcz/graphs/contributors)

Pod licencí MIT - volně šiřte, prodávejte, zachovejte uvedení autora.

