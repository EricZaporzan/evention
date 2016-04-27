function IgnoredEvent(data) {
    this.id = ko.observable(data.id);
    this.ignored = ko.observable(data.ignored);
    this.eventId = ko.observable(data.eventId)
}

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

function MyEvent(data) {
    this.id = ko.observable(data.id);
    this.title = ko.observable(data.title);
    this.performerName = ko.observable(data.performerName);
    this.performerImage = ko.observable(data.performerImage);
    this.venueName = ko.observable(data.venueName);
    this.city = ko.observable(data.city);
    this.country = ko.observable(data.country);
    this.latitude = ko.observable(data.latitude);
    this.longitude = ko.observable(data.longitude);
    this.startTime = ko.observable(data.startTime);
    this.ignored = ko.observable(data.ignored);
    this.notIgnored = ko.observable(!data.ignored);
    this.becauseYouLiked = ko.observable(data.becauseYouLiked);
}

function Section(name, selected) {
    this.name = name;
    this.isSelected = ko.computed(function() {
       return this === selected();
    }, this);
}

function MyEventsViewModel() {
    var self = this;
    self.ignoredEvents = ko.observableArray([]);
    self.events = ko.observableArray([]);
    self.closebyEvents = ko.observableArray([]);
    self.favouriteCities = ko.observableArray([]);

    self.selectedSection = ko.observable();
    self.sections = ko.observableArray([
        new Section('Events near my favourite cities', self.selectedSection),
        new Section('All events', self.selectedSection)
    ]);
    self.selectedSection(self.sections()[0]);

    // Grabbing the ignored events list.
    $.ajax({
        method: 'GET',
        url: '/api/ignored-events/',
        success: function(response) {
            for (var i=0; i < response.length; i++) {
                self.ignoredEvents.push(new IgnoredEvent({
                    id: response[i].id,
                    ignored: response[i].ignored,
                    eventId: response[i].event.id
                }));
            }
        }
    });

    // Grabbing all the events.
    $.ajax({
        method: 'GET',
        url: '/api/events/',
        success: function(response) {
            for (var i=0; i < response.length; i++) {
                var ignored = false;
                for (var j=0; j < self.ignoredEvents().length; j++) {
                    if (response[i].id == self.ignoredEvents()[j].eventId()) {
                        ignored = self.ignoredEvents()[j].ignored();
                        break;
                    }
                }

                var newEvent = new MyEvent({id: response[i].id,
                                            title: response[i].title,
                                            performerName: response[i].performer.name,
                                            performerImage: response[i].performer.image,
                                            venueName: response[i].venue_name,
                                            city: response[i].city,
                                            country: response[i].country,
                                            latitude: response[i].latitude,
                                            longitude: response[i].longitude,
                                            startTime: response[i].start_time,
                                            ignored: ignored });

                self.events.push(newEvent);

                var favouriteCities = self.favouriteCities();
                for (var k = 0; k < favouriteCities.length; k++) {
                    if (favouriteCities[k].liked()) {
                        var distanceBetween = getDistanceFromLatLonInKm(newEvent.latitude(), newEvent.longitude(), favouriteCities[k].latitude(), favouriteCities[k].longitude());
                        if (distanceBetween < 50.0) {
                            newEvent.becauseYouLiked = favouriteCities[k].city;
                            self.closebyEvents.push(newEvent);
                        }
                    }
                }
            }
        }
    });

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

    self.ignoreEvent = function(username, item) {
        console.log(item);
        $.ajax({
            method: 'PUT',
            url: '/api/ignored-events/' + item.id() + '/',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            data: {
                id: item.id(),
                owner: username,
                ignored: true
            },
            success: function (response) {
                console.log(response);
                item.id(response.id);
                item.ignored(true);
                item.notIgnored(false);
                self.events.remove(item);
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
        var va = ko.utils.unwrapObservable(valueAccessor());
        var show = false;
        for (var i = 0; i < va.length; i++) {
            if (!va[i].ignored()) {
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
        var va = ko.utils.unwrapObservable(valueAccessor());
        var show = false;
        for (var i = 0; i < va.length; i++) {
            if (!va[i].ignored()) {
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

ko.applyBindings(new MyEventsViewModel());
