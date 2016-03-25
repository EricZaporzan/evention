function Band(data) {
    this.likeId = ko.observable(data.id);
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

    // Each time there is a delay in typing, query Spotify for the list of artists returned by the search query.
    self.spotifySearch.subscribe(function(newValue) {
        self.bandResults.removeAll();
        if (newValue != "") {
            $.ajax({
                url: 'https://api.spotify.com/v1/search?q=' + encodeURI(newValue) + '&type=artist&limit=10',
                success: function (response) {
                    var totalDisplayed = 0;
                    for (var i = 0; i < response.artists.items.length; i++) {
                        var image = "/static/images/noimage.png";
                        if (response.artists.items[i].images.length > 0) {
                            image = response.artists.items[i].images[0].url;
                        }

                        var alreadyLiked = false;
                        var favouriteBands = self.favouriteBands();
                        for (var j = 0; j < favouriteBands.length; j++) {
                            if (favouriteBands[j].name() == response.artists.items[i].name && favouriteBands[j].liked()) {
                                alreadyLiked = true;
                                break;
                            }
                        }
                        if (!alreadyLiked) {
                            self.bandResults.push(new Band({
                                likeId: -1,
                                name: response.artists.items[i].name,
                                image: image,
                                liked: false
                            }));
                            totalDisplayed++;

                            if (totalDisplayed >= 5) {
                                break;
                            }
                        }
                    }
                }
            });
        }
    });

    // Pull down initial likes from the server.
    $.ajax({
        method: 'GET',
        url: '/api/likes/?liked=True',
        success: function(response) {
            for (var i=0; i < response.length; i++) {
                self.favouriteBands.push(new Band({likeId: response[i].id,
                                                   name: response[i].performer,
                                                   image: response[i].image,
                                                   liked: response[i].liked}));
            }
        }
    });

    // Add a band to the list of favourites.
    self.likeBand = function(username, item) {
        console.log(item);
        $.ajax({
            method: 'GET',
            url: '/api/likes/?owner_id=' + username + '&performer=' + encodeURI(item.name),
            success: function(response) {
                if(response.length > 0) {
                    $.ajax({
                        method: 'PUT',
                        url: '/api/likes/' + response[0].id + '/',
                        headers: {
                            'X-CSRFToken': getCookie('csrftoken')
                        },
                        data: {
                            owner: username,
                            liked: 'True',
                            performer: item.name,
                            image: item.image
                        },
                        success: function (response) {
                            console.log(response);
                            self.favouriteBands.push(item);
                        },
                        error: function (response) {
                            console.log(response);
                        }
                    });
                }
                else {
                    $.ajax({
                        method: 'POST',
                        url: '/api/likes/',
                        headers: {
                            'X-CSRFToken': getCookie('csrftoken')
                        },
                        data: {
                            owner: username,
                            liked: 'True',
                            performer: item.name,
                            image: item.image
                        },
                        success: function (response) {
                            console.log(response);
                            self.favouriteBands.push(item);
                        },
                        error: function (response) {
                            console.log(response);
                        }
                    });
                }
            }
        });
    };

    // Remove a band from the list of favourites.
    self.unlikeBand = function(username, item) {
        var bandName = item.name();
        console.log(item);
        console.log('/api/likes/?owner_id=' + username + '&performer=' + encodeURI(bandName));

        $.ajax({
            method: 'GET',
            url: '/api/likes/?owner_id=' + username + '&performer=' + encodeURI(bandName),
            success: function(response) {
                console.log(response);
                if(response.length > 0) {
                    $.ajax({
                        method: 'PUT',
                        url: '/api/likes/' + response[0].id + '/',
                        headers: {
                            'X-CSRFToken': getCookie('csrftoken')
                        },
                        data: {
                            owner: username,
                            liked: 'False',
                            performer: item.name,
                            image: item.image
                        },
                        success: function (response) {
                            console.log(response);
                        },
                        error: function (response) {
                            console.log(response);
                        }
                    });
                }
            }
        });
    }
}

ko.applyBindings(new BandSearchViewModel());
