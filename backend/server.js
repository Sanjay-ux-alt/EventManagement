const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Event = require("./models/Event");
const Registration = require("./models/Registration");
const Razorpay = require("razorpay");
const crypto = require("crypto");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());


// =========================
// RAZORPAY
// =========================

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});


// =========================
// HOME
// =========================

app.get("/", (req, res) => {
    res.send("Event Management Server is Running!");
});


// =========================
// ADD EVENT
// =========================

app.post("/api/events", async (req, res) => {

    try {

        const event = new Event(req.body);

        const savedEvent =
            await event.save();

        res.status(201).json(savedEvent);

    } catch (error) {

        res.status(500).json({
            message: "Failed to create event",
            error: error.message
        });

    }

});


// =========================
// GET ALL EVENTS
// =========================

app.get("/api/events", async (req, res) => {

    try {

        const events =
            await Event.find();

        res.json(events);

    } catch (error) {

        res.status(500).json({
            message: "Failed to fetch events",
            error: error.message
        });

    }

});


// =========================
// UPDATE EVENT
// =========================

app.put("/api/events/:id", async (req, res) => {

    try {

        const updatedEvent =
            await Event.findByIdAndUpdate(
                req.params.id,
                req.body,
                {
                    new: true
                }
            );

        if (!updatedEvent) {

            return res.status(404).json({
                message: "Event not found"
            });

        }

        res.json(updatedEvent);

    } catch (error) {

        res.status(500).json({
            message: "Failed to update event",
            error: error.message
        });

    }

});


// =========================
// DELETE EVENT
// =========================

app.delete("/api/events/:id", async (req, res) => {

    try {

        const deletedEvent =
            await Event.findByIdAndDelete(
                req.params.id
            );

        if (!deletedEvent) {

            return res.status(404).json({
                message: "Event not found"
            });

        }

        res.json({
            message: "Event deleted successfully",
            event: deletedEvent
        });

    } catch (error) {

        res.status(500).json({
            message: "Failed to delete event",
            error: error.message
        });

    }

});


// =========================
// CREATE RAZORPAY ORDER
// =========================

app.post("/api/payment/create-order", async (req, res) => {

    try {

        const { amount } = req.body;

        if (!amount || amount <= 0) {

            return res.status(400).json({
                message: "Invalid payment amount"
            });

        }

        const options = {
            amount: Math.round(Number(amount) * 100),
            currency: "INR",
            receipt: "event_" + Date.now()
        };

        const order =
            await razorpay.orders.create(options);

        res.json({
            success: true,
            order
        });

    } catch (error) {

        console.error(
            "Razorpay order error:",
            error
        );

        res.status(500).json({
            message: "Failed to create payment order",
            error: error.message
        });

    }

});


// =========================
// VERIFY RAZORPAY PAYMENT
// =========================

app.post("/api/payment/verify", async (req, res) => {

    try {

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        const body =
            razorpay_order_id +
            "|" +
            razorpay_payment_id;

        const expectedSignature =
            crypto
                .createHmac(
                    "sha256",
                    process.env.RAZORPAY_KEY_SECRET
                )
                .update(body.toString())
                .digest("hex");

        if (expectedSignature === razorpay_signature) {

            res.json({
                success: true,
                message: "Payment verified successfully"
            });

        } else {

            res.status(400).json({
                success: false,
                message: "Payment verification failed"
            });

        }

    } catch (error) {

        console.error(
            "Payment verification error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Payment verification failed",
            error: error.message
        });

    }

});


// =========================
// ADD REGISTRATION
// =========================

app.post(
    "/api/registrations",
    async (req, res) => {

        try {

            const registration =
                new Registration(req.body);

            const savedRegistration =
                await registration.save();

            res.status(201).json({

                message:
                    "Registration successful",

                registration:
                    savedRegistration

            });

        } catch (error) {

            res.status(500).json({

                message:
                    "Registration failed",

                error:
                    error.message

            });

        }

    }
);


// =========================
// GET REGISTRATIONS
// =========================

app.get(
    "/api/registrations",
    async (req, res) => {

        try {

            const registrations =
                await Registration.find();

            res.json(registrations);

        } catch (error) {

            res.status(500).json({

                message:
                    "Failed to fetch registrations",

                error:
                    error.message

            });

        }

    }
);


// =========================
// MONGODB CONNECTION
// =========================

mongoose
    .connect(process.env.MONGO_URI)

    .then(() => {

        console.log(
            "MongoDB connected successfully"
        );

        app.listen(
            process.env.PORT || 5000,
            () => {

                console.log(
                    "Server running on port " +
                    (process.env.PORT || 5000)
                );

            }
        );

    })

    .catch((error) => {

        console.error(
            "MongoDB connection failed:",
            error.message
        );

    });