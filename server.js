const express = require('express')
const MongoClient = require("mongodb").MongoClient;
const bodyParser = require('body-parser');

const app = express()
const url = "mongodb://127.0.0.1:27017/";
const mongoClient = new MongoClient(url);
const jsonParser = bodyParser.urlencoded({
    extended: false,
});

async function add_supply(bar_good) {
    try {
        await mongoClient.connect();
        const db = mongoClient.db("storage");
        const collection = db.collection("supply");
        const date = new Date();
        const supply = { date: date, bar_good: bar_good };
        const result = await collection.insertOne(supply);
        return result;
    } catch (err) {
        console.log(err);
    } finally {
        await mongoClient.close();
    }
}

async function add_shipment(bar_good) {
    try {
        await mongoClient.connect();
        const db = mongoClient.db("storage");
        const collection = db.collection("shipment");
        const date = new Date();
        const shipment = { date: date, bar_good: bar_good };
        const result = await collection.insertOne(shipment);
        return result;
    } catch (err) {
        console.log(err);
    } finally {
        await mongoClient.close();
    }
}

async function show_shipment() {
    try {
        await mongoClient.connect();
        const db = mongoClient.db("storage");
        const collection = db.collection("shipment");
        const result = await collection.find().toArray();
        return result;
    } catch (err) {
        console.log(err);
    } finally {
        await mongoClient.close();
    }
}

async function show_supply() {
    try {
        await mongoClient.connect();
        const db = mongoClient.db("storage");
        const collection = db.collection("supply");
        const result = await collection.find().toArray();
        return result;
    } catch (err) {
        console.log(err);
    } finally {
        await mongoClient.close();
    }
}

async function if_good_in_storage(bar_good) {
    try {
        await mongoClient.connect();
        const db = mongoClient.db("storage");
        const collection = db.collection("goods");
        const result = await collection.findOne({ bar_good: bar_good })
        return result;
    } catch (err) {
        console.log(err);
    } finally {
        await mongoClient.close();
    }
}

async function if_good_on_place(bar_good, bar_place) {
    try {
        await mongoClient.connect();
        const db = mongoClient.db("storage");
        const collection = db.collection("place");
        const result = await collection.findOne({ bar_place: bar_place, bar_good: bar_good });
        return result;
    } catch (err) {
        console.log(err);
    } finally {
        await mongoClient.close();
    }
}

async function take_good_from_place(bar_good, bar_place) {
    try {
        await mongoClient.connect();
        const db = mongoClient.db("storage");
        const collection = db.collection("place");
        const result = await collection.updateOne({ bar_place: bar_place }, { $set: { bar_good: '0' } });
        return result;
    } catch (err) {
        console.log(err);
    } finally {
        await mongoClient.close();
    }
}

async function if_place_is_empty(bar_place) {
    try {
        await mongoClient.connect();
        const db = mongoClient.db("storage");
        const collection = db.collection("place");
        const result = await collection.findOne({ bar_place: bar_place });
        return result;
    } catch (err) {
        console.log(err);
    } finally {
        await mongoClient.close();
    }
}

async function put_good_to_place(bar_good, bar_place) {
    try {
        await mongoClient.connect();
        const db = mongoClient.db("storage");
        const collection = db.collection("place");

        const result = await collection.updateOne({ bar_place: bar_place }, { $set: { bar_good: bar_good } });
        return result;
    } catch (err) {
        console.log(err);
    } finally {
        await mongoClient.close();
    }
}

async function run() {
    try {
        await mongoClient.connect();
        const db = mongoClient.db("storage");
        const collection = db.collection("goods");
        const count = await collection.countDocuments();
        console.log(`В коллекции goods ${count} документов`);
    } catch (err) {
        console.log(err);
    } finally {
        await mongoClient.close();
    }
}

async function show_places() {
    try {
        await mongoClient.connect();
        const db = mongoClient.db("storage");
        const collection = db.collection("place");
        const result = await collection.find().toArray();
        return result;
    } catch (err) {
        console.log(err);
    } finally {
        await mongoClient.close();
    }
}

async function show_places_with_good(bar_good) {
    try {
        await mongoClient.connect();
        const db = mongoClient.db("storage");
        const collection = db.collection("place");
        const result = await collection.find({ bar_good: bar_good }).toArray();
        return result;
    } catch (err) {
        console.log(err);
    } finally {
        await mongoClient.close();
    }
}

async function show_goods() {
    try {
        await mongoClient.connect();
        const db = mongoClient.db("storage");
        const collection = db.collection("goods");
        var results = await collection.find().toArray();
        return results;
    } catch (err) {
        console.log(err);
    } finally {
        await mongoClient.close();
    }
}

async function add_good(bar_good, name_good) {
    try {
        await mongoClient.connect();
        const db = mongoClient.db("storage");
        const collection = db.collection("goods");
        const good = {
            bar_good: bar_good,
            name_good: name_good
        };
        const result = await collection.insertOne(good);
        console.log(result);
    } catch (err) {
        console.log(err);
    } finally {
        await mongoClient.close();
    }
}

app.use(express.static(__dirname + '/public'))
app.set("view engine", "ejs");

app.get('/', jsonParser, (req, res) => {

    var message;

    show_goods().then((goods) => {

        show_places().then((places) => {

            let array = new Array(goods.length)
            for (let index = 0; index < goods.length; index++) {
                var count = places.reduce((n, place) => {
                    return n + (place.bar_good === goods[index].bar_good)
                }, 0)
                array[index] = count;
            }

            res.render('index', {
                goods: goods,
                place: places,
                array: array,
                message: message
            })
        })
    })
})

app.post('/', jsonParser, (req, res) => {

    const bar_good = req.body.bar_good;
    const name_good = req.body.name_good;
    var message;

    if_good_in_storage(bar_good).then((good) => {
        if (good == null) {
            if (bar_good == '' || name_good == '') {
                message = "Заполните все поля!"
            } else {
                add_good(bar_good, name_good);
            }
        }
        else {
            message = "Штрих-код уже добавлен!";
        }

        show_goods().then((goods) => {

            show_places().then((places) => {

                let array = new Array(goods.length)
                for (let index = 0; index < goods.length; index++) {
                    var count = places.reduce((n, place) => {
                        return n + (place.bar_good === goods[index].bar_good)
                    }, 0)
                    array[index] = count;
                }

                res.render('index', {
                    goods: goods,
                    place: places,
                    array: array,
                    message: message
                })
            })
        })
    })



})

app.get('/add', jsonParser, (req, res) => {
    var message;

    res.render('add', {
        message: message
    })
})

app.post('/add', jsonParser, (req, res) => {
    var bar_good = req.body.bar_good;
    var bar_place = req.body.bar_place;
    var message;

    if_good_in_storage(bar_good).then((good) => {

        if (good) {
            if_place_is_empty(bar_place).then((place) => {

                if (place) {
                    if (place.bar_good == "0") {
                        put_good_to_place(bar_good, bar_place);
                        add_supply(bar_good);
                        message = 'Товар ' + bar_good + ' добавлен на место ' + bar_place;
                        res.render('add', {
                            message: message
                        });
                    }
                    else {
                        message = 'Место уже занято!';
                        res.render('add', {
                            message: message
                        });
                    }
                }
                else {
                    message = 'Такого места нет!';
                    res.render('add', {
                        message: message
                    })
                }
            });
        }
        else {
            message = 'Товара нет в базе';
            res.render('add', {
                message: message
            });
        }
    })
})

app.get('/pickup', jsonParser, (req, res) => {
    var message;
    res.render('pickup', {
        message: message
    })
})

app.post('/pickup', jsonParser, (req, res) => {
    var bar_good = req.body.bar_good;
    var bar_place = req.body.bar_place;
    var message;

    if_good_on_place(bar_good, bar_place).then((place) => {
        if (place) {
            take_good_from_place(bar_good, bar_place);
            add_shipment(bar_good);
            message = 'Товар ' + bar_good + ' удален с места "' + place.name_place + '"';
        }
        else {
            message = "Ошибка!"
        }

        res.render('pickup', {
            message: message
        })
    })
})

app.get('/good', jsonParser, (req, res) => {
    var bar_good = req.query.bar_good;
    var name_good = req.query.name_good;

    show_places_with_good(bar_good).then((places) => {

        if (places) {
            res.render('good', {
                places: places,
                bar_good: bar_good,
                name_good: name_good
            })
        }
        else {
            res.render('good', {
                places: {},
                bar_good: bar_good,
                name_good: name_good
            })
        }
    })
})

app.get('/movement', jsonParser, (req, res) => {

    show_supply().then((supply) => {
        show_shipment().then((shipment) => {
            res.render('movement', {
                supply: supply,
                shipment: shipment
            });
        })
    })
})

const PORT = 80

app.listen(PORT, () => {
    console.log('Сервер запущен! Порт: ' + PORT)
})
