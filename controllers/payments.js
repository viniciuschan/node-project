module.exports = function(app) {
    app.get('/payments', function(req, res){
        var connection = app.persistence.connectionFactory();
        var paymentDao = new app.persistence.PaymentDao(connection);

        paymentDao.list(function (error, result) {
            if (error) {
                res.status(500).send(error);
                return;
            };
            console.log(result)
            var response = {
                payments: result
            }
            res.status(200).json(response);
        })
    });


    app.get('/payments/payment/:id', function(req, res){
        var paymentId = req.params.id;

        var connection = app.persistence.connectionFactory();
        var paymentDao = new app.persistence.PaymentDao(connection);

        paymentDao.searchId(paymentId, function(error, result) {
            if (error) {
                res.status(404).send(error);
                return;
            }
            var response = {
                payment_data: result
            }
            res.status(200).json(response);
        })
    });


    app.delete('/payments/payment/:id', function(req, res) {
        var payment = {}
        var paymentId = req.params.id;
        payment.id = paymentId;
        payment.status = 'CANCELED';

        paymentDao.update(paymentId, function(error) {
            if (error) {
                res.status(500).send(error);
                return;
            }
            res.status(204).send(payment);
        })
    })

    app.put('/payments/payment/:id', function(req,res){

        var payment = {}
        var paymentId = req.params.id;
        payment.id = paymentId;
        payment.status = 'CONFIRMED';

        var connection = app.persistence.connectionFactory();
        var paymentDao = new app.persistence.PaymentDao(connection);

        paymentDao.update(payment, function(error) {
            if (error) {
                res.status(500).send(error);
                return;
            }
            res.status(200).send(payment);
        })
    });


    app.post('/payments/payment', function(req,res){
        req.assert("payment_kind").notEmpty();
        req.assert("value").notEmpty().isFloat();

        var errors = req.validationErrors();
        if (errors) {
            console.log('Validations errors has ocurred');
            res.status(500).send(errors);
            return;
        }
        var payment = req.body;

        payment.status = 'Created';
        payment.data = new Date;

        var connection = app.persistence.connectionFactory();
        var paymentDao = new app.persistence.PaymentDao(connection);

        paymentDao.save(payment, function(exception, result){
            if (exception) {
                console.log('Exception: ', exception)
                res.status(500).send(exception);
            } else {
                console.log('Created payment:' + result);
                payment.id = result.insertId;
                res.location('/payments/payment/' + payment.id);

                var response = {
                    payment_data: payment,
                    links: [
                        {
                            href: "http://localhost:3000/payments/payment/" + payment.id,
                            rel: "Confirm",
                            method: "PUT"
                        },
                        {
                            href: "http://localhost:3000/paymentspayment/" + payment.id,
                            rel: "Cancel",
                            method: "DELETE"
                        }
                    ]
                }
                res.status(201).json(response);
            }
        });
    });
}

