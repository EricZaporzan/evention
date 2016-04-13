function IgnoredEvent(data) {
    this.id = ko.observable(data.id);
    this.ignored = ko.observable(data.ignored);
    this.eventId = ko.observable(data.eventId)
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
}

function MyEventsViewModel() {
    var self = this;
    self.ignoredEvents = ko.observableArray([]);
    self.events = ko.observableArray([]);

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
                self.events.push(new MyEvent({id: response[i].id,
                                            title: response[i].title,
                                            performerName: response[i].performer.name,
                                            performerImage: response[i].performer.image,
                                            venueName: response[i].venue_name,
                                            city: response[i].city,
                                            country: response[i].country,
                                            latitude: response[i].latitude,
                                            longitude: response[i].longitude,
                                            startTime: response[i].start_time,
                                            ignored: ignored }));
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
