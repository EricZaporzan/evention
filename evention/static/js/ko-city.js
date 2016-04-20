function City(data) {
    this.likeId = ko.observable(data.likeId);
    this.name = ko.observable(data.name);
    this.liked = ko.observable(data.liked);
    this.disliked = ko.observable(!data.liked);
}

function CitySearchViewModel() {
    var self = this;
    self.citySearch = ko.observable('');
    self.googleSearch = ko.pureComputed(this.citySearch).extend({ rateLimit: { method: "notifyWhenChangesStop", timeout: 150 } });
    self.cityResults = ko.observableArray([]);
    self.favouriteCities = ko.observableArray([]);

    // Each time there is a delay in typing, query Spotify for the list of artists returned by the search query.
    self.googleSearch.subscribe(function(newValue) {
        self.cityResults.removeAll();
        if (newValue != "") {
            var service = new google.maps.places.AutocompleteService();
            service.getQueryPredictions({ input: newValue, options: {type: 'cities'}}, self.callback);
        }
    });

    self.callback = function(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
                var alreadyLiked = false;
                var likeId = -1;
                var favouriteCities = self.favouriteCities();
                for (var j = 0; j < favouriteCities.length; j++) {
                    if (favouriteCities[j].name() == results[j].terms[0].value) {
                        if (favouriteCities[j].liked()) {
                            alreadyLiked = true;
                            break;
                        }
                        else {
                            likeId = favouriteCities[j].likeId();
                        }
                    }
                }
                if (!alreadyLiked) {
                    self.cityResults.push(new City({
                        likeId: likeId,
                        name: results[i].terms[0].value,
                        liked: false
                    }));
                }
            }
        }
    };

    self.likeCity = function(username, item) {
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
}



ko.applyBindings(new CitySearchViewModel());
