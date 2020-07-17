# osmcz-app

JS mapová appka pro OpenStreetMap.cz postavená nad LeafletJS.
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
2020-07-17 **osmcz v0.27** (
    [talk](https://openstreetmap.cz/talkcz/c2919),
    [osmcz-app](https://github.com/osmcz/osmcz/compare/v0.26...v0.27))
- opravy pro formuláře fotek, zobrazení markeru
- oprava deklarace práv a majitele
- přidání map z MapTiler.com (streets, topo)
- oprava URL pro LPIS overlay, přechod na https
- oprava URL pro Mapbox streets, ortofoto overlay -> mapbox GL style API
- oprava kontroly EXIF datumu při nahrávání fotky 

2019-07-03 **osmcz v0.26** (
    [talk](https://openstreetmap.cz/talkcz/c2919),
    [osmcz-app](https://github.com/osmcz/osmcz/compare/v0.25...v0.26))
- dynamické načítání informací o typech fotek z Fody přes API
- úklid dokumentace, zrušení zastaralých položek a informací
- aktualizace textu PhotoDB -> Fody
- doplnění ikon pro další typy rozcestníků, značení a přehledovou fotku
- přejmenování vrstev fotek Fody a kontrol OsmHiCheck
- zakázány vrstvy z OpenInfraMap - pouze vektorové dlaždice

2019-04-09 **osmcz v0.25** (
    [talk](https://openstreetmap.cz/talkcz/c2810),
    [osmcz-app](https://github.com/osmcz/osmcz/compare/v0.24...v0.25))
- výrazná aktualizace verzí knihoven leaflet a bootstrap
- nový parametr URL addOverlays
- dokumentace parametrů URL pro web zde v README.md
- vyřešení některých problémů pro vyhledávání

2019-04-04 **osmcz v0.24** (
    [talk](https://openstreetmap.cz/talkcz/c2809),
    [osmcz-app](https://github.com/osmcz/osmcz/compare/v0.23...v0.24))
- přidání dalších variant fotek pro nahrání nové fotky (panorama, bod záchrany, přehledová)
- ikona pro fotku bodu záchrany, ikona pro cyklo i silnicni rozcestniky
- v detailu fotky přidán odatum vytvoření
- lepší ošetření chyb při nahrávání do Fody
- přidány vrstvy s ortofoto IPR Praha
- lepší zobrazování archivu WeeklyOSM

2018-09-23 **osmcz v0.23** (
    [talk](https://openstreetmap.cz/talkcz/c2809),
    [osmcz-app](https://github.com/osmcz/osmcz/compare/v0.22...v0.23))
- opraveno přepínání vrstev map
- default mapa je nyní místo Mapbox (neaktuální) Wikipedia
- konfigurační volby přesunuty do samostatného souboru

2018-09-11 **osmcz v0.22** (
    [talk](https://openstreetmap.cz/talkcz/c2573),
    [osmcz-app](https://github.com/osmcz/osmcz/compare/v0.21...v0.22))
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

![nahled](https://openstreetmap.cz/data/thumbs/60.700x476.png)

## Parametry v URL

Aplikace podporuje následující akce:

### Akce v url
* `node/xxx` - zobrazí detaily o vybraném uzlu, například: [https://osmap.cz/node/4362004835](https://openstreetmap.cz/node/4362004835)
* `way/xxx` -  zobrazí detaily o vybrané cestě, například: [https://osmap.cz/way/37135377](https://openstreetmap.cz/way/37135377)
* `relation/xxx` - zobrazí detaily o vybrané relaci, například: [https://osmap.cz/relation/6522673](https://openstreetmap.cz/relation/6522673)

* Odkaz na místo: `?mlat={lat}&mlon={lon}&zoom={zoom}&mmsg={zpráva}`

  [https://osmap.cz/?mlat=49.5799&mlon=15.9414&zoom=19](https://osmap.cz/?mlat=49.5799&mlon=15.9414&zoom=19)

  [https://osmap.cz/?mlat=49.5799&mlon=15.9414&zoom=19&mmsg=Unesco](https://osmap.cz/?mlat=49.5799&mlon=15.9414&zoom=19&mmsg=Unesco)

### Hash (část za #)
* `map={zoom}/{lat}/{lon}` - zobrazí mapu okolo bodu {lat}/{lon} a s přiblížením {zoom}
* `layers={list}` - seznam vrstev, které se mají zapnout
* `addOverlays={list}` - seznam překryvných vrstev, které se mají přidat (zapnout)

## Poděkování
* autoři leafletu + pluginů
* autoři a provozovatelé mapových vrstev
* openstreetmap-website JS + API
* bootstrap-css
* poloha.net API + vrstvy
* mapbox.com JS + vrstvy


## Autoři, licence
(c) 2016-2019 zbycz, mkyral, walley, tkas a [další](https://github.com/osmcz/osmcz/graphs/contributors)

Pod licencí MIT - volně šiřte, prodávejte, zachovejte uvedení autora.

