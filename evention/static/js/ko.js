function Band(data) {
    this.name = ko.observable(data.name);
    this.image = ko.observable(data.image);
    this.liked = ko.observable(data.liked);
    this.disliked = ko.observable(!data.liked);
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
                        var image = "/static/images/noimage.png";
                        if (response.artists.items[i].images.length > 0) {
                            image = response.artists.items[i].images[0].url;
                        }

                        var liked = false;
                        var favouriteBands = self.favouriteBands();
                        for (var j = 0; j < favouriteBands.length; j++) {
                            if (favouriteBands[j].name() == response.artists.items[i].name) {
                                liked = true;
                                break;
                            }
                        }
                        self.bandResults.push(new Band({
                            name: response.artists.items[i].name,
                            image: image,
                            liked: liked
                        }));
                    }
                }
            });
        }
    });

    $.ajax({
        url: '/api/likes/',
        success: function(response) {
            for (var i=0; i < response.length; i++) {
                self.favouriteBands.push(new Band({name: response[i].performer,
                                                   image: response[i].image,
                                                   liked: true}));
            }
        }
    });

    self.likeBand = function(item) {
        $.ajax({
            url: '/api/users/0/?format=json',
            success: function(response) {
                var user_url = response.url;
                $.ajax({
                    method: 'POST',
                    url: '/api/likes/',
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    data: {
                        owner: user_url,
                        type: 'artist',
                        performer: item.name,
                        image: item.image
                    },
                    success: function(response) {
                        console.log(response);
                        self.favouriteBands.push(item);
                    },
                    error: function(response) {
                        console.log(response);
                    }
                });
            }
        });
    }
}

ko.applyBindings(new BandSearchViewModel());
