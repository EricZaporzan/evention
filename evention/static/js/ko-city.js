function City(data) {
    this.likeId = ko.observable(data.likeId);
    this.code = ko.observable(data.code);
    this.city = ko.observable(data.city);
    this.region = ko.observable(data.region);
    this.country = ko.observable(data.country);
    this.latitude = ko.observable(data.latitude);
    this.longitude = ko.observable(data.longitude);
    this.liked = ko.observable(data.liked);
    this.disliked = ko.observable(!data.liked);
}

function CitySearchViewModel() {
    var self = this;
    self.citySearch = ko.observable('');
    self.geobytesSearch = ko.pureComputed(this.citySearch).extend({ rateLimit: { method: "notifyWhenChangesStop", timeout: 750 } });
    self.cityResults = ko.observableArray([]);
    self.favouriteCities = ko.observableArray([]);

    self.geobytesSearch.subscribe(function(newValue) {
        self.cityResults.removeAll();
        if (newValue != "") {
            jQuery.getJSON(
                "http://gd.geobytes.com/AutoCompleteCity?callback=?&q="+newValue,
                function (data) {
                    var totalDisplayed = 0;
                    for (var i = 0; i < Math.min(10, data.length); i++) {
                        jQuery.getJSON(
                            "http://gd.geobytes.com/GetCityDetails?callback=?&fqcn="+data[i],
                            function (detail) {
                                var favouriteCities = self.favouriteCities();
                                var alreadyLiked = false;
                                var likeId = -1;

                                for (var j = 0; j < favouriteCities.length; j++) {
                                    if (favouriteCities[j].code() == detail.geobyteslocationcode) {
                                        if (favouriteCities[j].liked()) {
                                            alreadyLiked = true;
                                            break;
                                        }
                                        else {
                                            likeId = favouriteCities[j].likeId();
                                            break;
                                        }
                                    }
                                }
                                if (!alreadyLiked) {
                                    self.cityResults.push(new City({
                                        likeId: likeId,
                                        code: detail.geobyteslocationcode,
                                        city: detail.geobytescity,
                                        region: detail.geobytesregion,
                                        country: detail.geobytescountry,
                                        latitude: detail.geobyteslatitude,
                                        longitude: detail.geobyteslongitude,
                                        liked: false
                                    }));
                                }
                            }
                        );
                    }

                }
            );
        }
    });

    $.ajax({
        method: 'GET',
        url: '/api/liked-cities/',
        success: function(response) {
            for (var i=0; i < response.length; i++) {
                self.favouriteCities.push(new City({likeId: response[i].id,
                                                    code: response[i].city.code,
                                                    city: response[i].city.city,
                                                    region: response[i].city.region,
                                                    country: response[i].city.country,
                                                    latitude: response[i].city.latitude,
                                                    longitude: response[i].city.longitude,
                                                    liked: response[i].liked}));
            }
        }
    });


    self.likeCity = function(username, item) {
        console.log(item);
        $.ajax({
            method: 'PUT',
            url: '/api/liked-cities/' + item.likeId() + '/',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            data: {
                owner: username,
                id: item.likeId(),
                code: item.code(),
                city: item.city(),
                region: item.region(),
                country: item.country(),
                latitude: item.latitude(),
                longitude: item.longitude(),
                liked: true
            },
            success: function (response) {
                console.log(response);
                item.likeId(response.id);
                item.liked(true);
                self.cityResults.remove(item);
                self.favouriteCities.push(item);
            },
            error: function (response) {
                console.log(response);
            }
        });
    };

    self.unlikeCity = function(username, item) {
        console.log(item);
        $.ajax({
            method: 'PUT',
            url: '/api/liked-cities/' + item.likeId() + '/',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            data: {
                owner: username,
                id: item.likeId(),
                code: item.code(),
                city: item.city(),
                region: item.region(),
                country: item.country(),
                latitude: item.latitude(),
                longitude: item.longitude(),
                liked: false
            },
            success: function (response) {
                console.log(response);
                item.likeId(response.id);
                item.liked(false);
            },
            error: function (response) {
                console.log(response);
            }
        });
    };
}




ko.applyBindings(new CitySearchViewModel());
