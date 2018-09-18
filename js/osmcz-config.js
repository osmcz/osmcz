// (c) 2016-2018 osmcz-app, https://github.com/osmcz/osmcz

var osmcz = osmcz || {};
osmcz.production = ['openstreetmap.cz', 'osmap.cz', 'osm.localhost', 'devosm.zby.cz'].indexOf(location.hostname) !== -1;
osmcz.basePath = osmcz.production ? '/theme/' : '';
osmcz.fakeHttps = osmcz.production ? '/proxy.php/' : 'http://';
osmcz.user = false; //user object of currently logged in user. Defined later in @layout.latte
osmcz.photoDbUrl = osmcz.production ? 'https://osm.fit.vutbr.cz/fody/' : 'https://osm.fit.vutbr.cz/fody-dev/';
