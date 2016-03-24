function Band(data) {
    this.name = ko.observable(data.name);
    this.image = ko.observable(data.image);
}

function BandSearchViewModel() {
    var self = this;
    self.bandSearch = ko.observable('');
    self.spotifySearch = ko.pureComputed(this.bandSearch).extend({ rateLimit: { method: "notifyWhenChangesStop", timeout: 1000 } });
    self.bandResults = ko.observableArray([]);
    self.favouriteBands = ko.observableArray([]);

    self.spotifySearch.subscribe(function(newValue) {
        self.bandResults.removeAll();
        if (newValue != "") {
            $.ajax({
                url: 'https://api.spotify.com/v1/search?q=' + encodeURI(newValue) + '&type=artist&limit=5',
                success: function (response) {
                    for (var i = 0; i < response.artists.items.length; i++) {
                        if (response.artists.items[i].images.length == 0) {
                            image = "/static/images/noimage.png";
                        }
                        else {
                            image = response.artists.items[i].images[0].url;
                        }

                        self.bandResults.push(new Band({
                            name: response.artists.items[i].name,
                            image: image
                        }));
                    }
                }
            });
        }
    });

    //self.getBands = function() {
        $.ajax({
            url: '/api/likes/',
            success: function(response) {
                for (var i=0; i < response.length; i++) {
                    self.favouriteBands.push(new Band({name: response[i].performer, image: response[i].image}));
                }
            }
        });

    //}
}

ko.applyBindings(new BandSearchViewModel());
