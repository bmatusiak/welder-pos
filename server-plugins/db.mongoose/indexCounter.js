module.exports = function(db) {
    var Schema = db.Schema;

    var CollectionName = "Counter";

    var CounterSchema = new Schema({
        name: { type: String, unique: true },
        count: Number
    });

    var getNextCount = function(name, startNumber, callback) {
        if (!callback && typeof startNumber === "function") callback = startNumber;
        var $counter = db.model(CollectionName, CounterSchema);
        $counter.findOne({ name: name }, function(err, __Counter) {
            if (!err && !__Counter) {
                var Counter = db.model(CollectionName, CounterSchema);
                var new_counter = new Counter();
                new_counter.name = name;
                new_counter.count = startNumber || 1;
                new_counter.save(function() {
                    callback(new_counter.count);
                });
            }
            else if (!err && __Counter !== null) {
                ++__Counter.count;
                __Counter.save().then(function(__Counter) {
                    callback(__Counter.count);
                });
            }
        });
    };

    getNextCount.currentCount = function(name, callback) {
        var $counter = db.model(CollectionName, CounterSchema);
        $counter.findOne({ name: name }, function(err, __Counter) {
            callback(err, __Counter.count);
        });
    };

    return getNextCount;
};