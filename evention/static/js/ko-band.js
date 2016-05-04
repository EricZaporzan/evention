function Band(data) {
    this.likeId = ko.observable(data.likeId);
    this.name = ko.observable(data.name);
    this.image = ko.observable(data.image);
    this.liked = ko.observable(data.liked);
    this.disliked = ko.observable(!data.liked);
}

function BandSearchViewModel() {
    var self = this;
    self.bandSearch = ko.observable('');
    self.spotifySearch = ko.pureComputed(this.bandSearch).extend({ rateLimit: { method: "notifyWhenChangesStop", timeout: 600 } });
    self.bandResults = ko.observableArray([]);
    self.favouriteBands = ko.observableArray([]);

    self.favouriteBandsLoading = ko.observable(true);
    self.bandResultsLoading = ko.observable(false);

    // Each time there is a delay in typing, query Spotify for the list of artists returned by the search query.
    self.spotifySearch.subscribe(function(newValue) {
        self.bandResults.removeAll();
        if (newValue != "") {
            self.bandResultsLoading(true);
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
                        var likeId = -1;
                        var favouriteBands = self.favouriteBands();
                        for (var j = 0; j < favouriteBands.length; j++) {
                            if (favouriteBands[j].name() == response.artists.items[i].name) {
                                if (favouriteBands[j].liked()) {
                                    alreadyLiked = true;
                                    break;
                                }
                                else {
                                    likeId = favouriteBands[j].likeId();
                                    break;
                                }
                            }
                        }
                        if (!alreadyLiked) {
                            self.bandResults.push(new Band({
                                likeId: likeId,
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
                    self.bandResultsLoading(false);
                }
            });
        }
    });

    // Pull down initial likes from the server.
    $.ajax({
        method: 'GET',
        url: '/api/likes/',
        success: function(response) {
            for (var i=0; i < response.length; i++) {
                self.favouriteBands.push(new Band({likeId: response[i].id,
                    name: response[i].performer.name,
                    image: response[i].performer.image,
                    liked: response[i].liked}));
            }

            // Check to see if we're returning from Spotify, if we are, we need to grab the user's auth token.
            var hashParams = getHashParams();
            if(hashParams.access_token) {
                console.log('Gathering follows from Spotify.');
                $.ajax({
                    url: 'https://api.spotify.com/v1/me/following?type=artist&limit=50',
                    headers: {
                        'Authorization': 'Bearer ' + hashParams.access_token
                    },
                    success: function(response) {
                        console.log(response);
                        for (var i = 0; i < response.artists.items.length; i++) {
                            var image = "/static/images/noimage.png";
                            if (response.artists.items[i].images.length > 0) {
                                image = response.artists.items[i].images[0].url;
                            }

                            var alreadyLiked = false;
                            var likeId = -1;
                            var favouriteBands = self.favouriteBands();
                            for (var j = 0; j < favouriteBands.length; j++) {
                                if (favouriteBands[j].name() == response.artists.items[i].name) {
                                    if (favouriteBands[j].liked()) {
                                        alreadyLiked = true;
                                        break;
                                    }
                                    else {
                                        likeId = favouriteBands[j].likeId();
                                        break;
                                    }
                                }
                            }
                            if (!alreadyLiked) {
                                self.likeBand("", new Band({
                                    likeId: likeId,
                                    name: response.artists.items[i].name,
                                    image: image,
                                    liked: true
                                }));
                            }
                        }
                        $("#spotify-result").addClass("text-success");
                        $("#spotify-result").html("Successfully fetched your favourite artists from Spotify and added them to your list.");
                        self.favouriteBandsLoading(false);
                        window.location.hash = "";
                    },
                    error: function() {
                        $("#spotify-result").addClass("text-warning");
                        $("#spotify-result").html("Sorry, something went wrong while trying to reach Spotify.");
                        self.favouriteBandsLoading(false);
                        window.location.hash = "";
                    }
                });
            }
            else {
                self.favouriteBandsLoading(false);
            }
        }
    });

    // Add a band to the list of favourites.
    self.likeBand = function(username, item) {
        console.log(item);
        $.ajax({
            method: 'PUT',
            url: '/api/likes/' + item.likeId() + '/',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            data: {
                id: item.likeId(),
                owner: username,
                liked: true,
                performer: item.name,
                image: item.image
            },
            success: function (response) {
                console.log(response);
                item.likeId(response.id);
                item.liked(true);
                self.bandResults.remove(item);
                self.favouriteBands.push(item);
            },
            error: function (response) {
                console.log(response);
            }
        });
    };

    // Remove a band from the list of favourites.
    self.unlikeBand = function(username, item) {
        console.log(item);
        $.ajax({
            method: 'PUT',
            url: '/api/likes/' + item.likeId() + '/',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            data: {
                id: item.likeId(),
                owner: username,
                liked: false,
                performer: item.name,
                image: item.image
            },
            success: function (response) {
                console.log(response);
                item.liked(false);
                item.likeId(response.id);
            },
            error: function (response) {
                console.log(response);
            }
        });
    }
}

// Custom bindings
ko.bindingHandlers.visibleElements = {
    update: function(element, valueAccessor, allBindings) {
        va = ko.utils.unwrapObservable(valueAccessor());
        var show = false;
        for (var i = 0; i < va.length; i++) {
            if (va[i].liked()) {
                show = true;
                break;
            }
        }
        if(show) {
            $(element).css('display', '');
        }
        else {
            $(element).css('display', 'none');
        }
    }
};

ko.bindingHandlers.noVisibleElements = {
    update: function(element, valueAccessor, allBindings) {
        va = ko.utils.unwrapObservable(valueAccessor());
        var show = false;
        for (var i = 0; i < va.length; i++) {
            if (va[i].liked()) {
                show = true;
                break;
            }
        }
        if(show) {
            $(element).css('display', 'none');
        }
        else {
            $(element).css('display', '');
        }
    }
};

ko.applyBindings(new BandSearchViewModel());
