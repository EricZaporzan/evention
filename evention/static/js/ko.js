function Task(data) {
    this.title = ko.observable(data.title);
    this.isDone = ko.observable(data.isDone);
}

function BandSearchViewModel() {
    this.bandSearch = ko.observable('');
    this.spotifySearch = ko.pureComputed(this.bandSearch).extend({ rateLimit: { method: "notifyWhenChangesStop", timeout: 1000 } });

    var self = this;
    self.spotifySearch.subscribe(function(newValue) {
        $.ajax({
            url: 'https://api.spotify.com/v1/search?q=' + encodeURI(newValue) + '&type=artist&limit=3',
            success: function (response) {
                console.log(response);
            }
        });
    });
}

ko.applyBindings(new BandSearchViewModel());

