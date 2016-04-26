function City(data) {
    this.likeId = ko.observable(data.likeId);
    this.placeId = ko.observable(data.placeId);
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
    self.googleSearch = ko.pureComputed(this.citySearch).extend({ rateLimit: { method: "notifyWhenChangesStop", timeout: 500 } });
    self.cityResults = ko.observableArray([]);
    self.favouriteCities = ko.observableArray([]);

    self.googleSearch.subscribe(function(newValue) {
        self.cityResults.removeAll();
        if (newValue != "") {
            var service = new google.maps.places.AutocompleteService();
            service.getQueryPredictions({ input: newValue, options: {type: 'cities'}}, self.queryCallback);
        }
    });

    self.queryCallback = function(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
                if (results[i].types && results[i].types[0] == 'locality') {
                    var geocoder = new google.maps.Geocoder();
                    geocoder.geocode({placeId: results[i].place_id}, function(geoResult, status) {
                        if (status === google.maps.GeocoderStatus.OK) {
                            var lat = geoResult[0].geometry.location.lat();
                            var lng = geoResult[0].geometry.location.lng();

                            var alreadyLiked = false;
                            var likeId = -1;
                            var favouriteCities = self.favouriteCities();

                            for (var j = 0; j < favouriteCities.length; j++) {
                                if (favouriteCities[j].placeId() == geoResult[0].place_id) {
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

                            var city = '';
                            var region = '';
                            var country = '';

                            for (var k = 0; k < geoResult[0].address_components.length; k++) {
                                if (geoResult[0].address_components[k].types[0] == "locality") {
                                    city = geoResult[0].address_components[k].long_name;
                                }
                                if (geoResult[0].address_components[k].types[0] == "administrative_area_level_1") {
                                    region = geoResult[0].address_components[k].long_name;
                                }
                                if (geoResult[0].address_components[k].types[0] == "country") {
                                    country = geoResult[0].address_components[k].long_name;
                                }
                            }

                            if (!alreadyLiked) {
                                self.cityResults.push(new City({
                                    likeId: likeId,
                                    placeId: geoResult[0].place_id,
                                    city: city,
                                    region: region,
                                    country: country,
                                    latitude: lat,
                                    longitude: lng,
                                    liked: false
                                }));
                            }
                        }
                    });
                }
            }
        }
    };


    $.ajax({
        method: 'GET',
        url: '/api/liked-cities/',
        success: function(response) {
            for (var i=0; i < response.length; i++) {
                self.favouriteCities.push(new City({likeId: response[i].id,
                                                    placeId: response[i].city.code,
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
                code: item.placeId(),
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
                code: item.placeId(),
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


ko.applyBindings(new CitySearchViewModel());
