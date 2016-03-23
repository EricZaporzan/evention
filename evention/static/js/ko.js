function Band(data) {
    this.name = ko.observable(data.name);
    this.image = ko.observable(data.image);
}

function BandSearchViewModel() {
    var self = this;
    self.bandSearch = ko.observable('');
    self.spotifySearch = ko.pureComputed(this.bandSearch).extend({ rateLimit: { method: "notifyWhenChangesStop", timeout: 1000 } });
    self.bandResults = ko.observableArray([]);

    self.spotifySearch.subscribe(function(newValue) {
        self.bandResults.removeAll();
        $.ajax({
            url: 'https://api.spotify.com/v1/search?q=' + encodeURI(newValue) + '&type=artist&limit=5',
            success: function (response) {
                console.log(response);

                for(var i=0; i < response.artists.items.length; i++) {
                    self.bandResults.push(new Band({name: response.artists.items[i].name,
                                                    image: response.artists.items[i].images[0].url}));
                }
            }
        });
    });
}

ko.applyBindings(new BandSearchViewModel());

