const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Event = require("./models/Event");
const Registration = require("./models/Registration");
const Razorpay = require("razorpay");
const crypto = require("crypto");

require("dotenv").config();

const app = express();


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "http://localhost:3000",
            "https://onlineeventmanagement02.netlify.app"
        ],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// =====================================================
// ENVIRONMENT VARIABLES CHECK
// =====================================================

if (!process.env.MONGO_URI) {
    console.error("ERROR: MONGO_URI is not defined.");
    process.exit(1);
}

if (!process.env.RAZORPAY_KEY_ID) {
    console.error("ERROR: RAZORPAY_KEY_ID is not defined.");
    process.exit(1);
}

if (!process.env.RAZORPAY_KEY_SECRET) {
    console.error("ERROR: RAZORPAY_KEY_SECRET is not defined.");
    process.exit(1);
}


// =====================================================
// RAZORPAY
// =====================================================

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});


// =====================================================
// HOME / HEALTH CHECK
// =====================================================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Event Management Server is Running!"
    });
});


app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Backend is working successfully"
    });
});


// =====================================================
// ADD EVENT
// =====================================================

app.post("/api/events", async (req, res) => {

    try {

        const event = new Event(req.body);

        const savedEvent = await event.save();

        res.status(201).json(savedEvent);

    } catch (error) {

        console.error("Create event error:", error);

        res.status(500).json({
            message: "Failed to create event",
            error: error.message
        });

    }

});


// =====================================================
// GET ALL EVENTS
// =====================================================

app.get("/api/events", async (req, res) => {

    try {

        const events = await Event.find();

        res.json(events);

    } catch (error) {

        console.error("Fetch events error:", error);

        res.status(500).json({
            message: "Failed to fetch events",
            error: error.message
        });

    }

});


// =====================================================
// UPDATE EVENT
// =====================================================

app.put("/api/events/:id", async (req, res) => {

    try {

        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedEvent) {

            return res.status(404).json({
                message: "Event not found"
            });

        }

        res.json(updatedEvent);

    } catch (error) {

        console.error("Update event error:", error);

        res.status(500).json({
            message: "Failed to update event",
            error: error.message
        });

    }

});


// =====================================================
// DELETE EVENT
// =====================================================

app.delete("/api/events/:id", async (req, res) => {

    try {

        const deletedEvent = await Event.findByIdAndDelete(
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

        console.error("Delete event error:", error);

        res.status(500).json({
            message: "Failed to delete event",
            error: error.message
        });

    }

});


// =====================================================
// CREATE RAZORPAY ORDER
// =====================================================

app.post("/api/payment/create-order", async (req, res) => {

    try {

        const { amount } = req.body;

        if (!amount || Number(amount) <= 0) {

            return res.status(400).json({
                success: false,
                message: "Invalid payment amount"
            });

        }

        const options = {
            amount: Math.round(Number(amount) * 100),
            currency: "INR",
            receipt: "event_" + Date.now()
        };

        const order = await razorpay.orders.create(options);

        res.json({
            success: true,
            order: order
        });

    } catch (error) {

        console.error(
            "Razorpay order error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to create payment order",
            error: error.message
        });

    }

});


// =====================================================
// VERIFY RAZORPAY PAYMENT
// =====================================================

app.post("/api/payment/verify", async (req, res) => {

    try {

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;


        // Check required values

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {

            return res.status(400).json({
                success: false,
                message: "Missing payment verification details"
            });

        }


        // Create signature body

        const body =
            razorpay_order_id +
            "|" +
            razorpay_payment_id;


        // Generate expected signature

        const expectedSignature =
            crypto
                .createHmac(
                    "sha256",
                    process.env.RAZORPAY_KEY_SECRET
                )
                .update(body)
                .digest("hex");


        // Compare signatures

        if (expectedSignature === razorpay_signature) {

            return res.json({
                success: true,
                message: "Payment verified successfully"
            });

        }


        return res.status(400).json({
            success: false,
            message: "Payment verification failed"
        });

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


// =====================================================
// ADD REGISTRATION
// =====================================================

app.post("/api/registrations", async (req, res) => {

    try {

        const registration =
            new Registration(req.body);

        const savedRegistration =
            await registration.save();

        res.status(201).json({

            message: "Registration successful",

            registration: savedRegistration

        });

    } catch (error) {

        console.error(
            "Registration error:",
            error
        );

        res.status(500).json({

            message: "Registration failed",

            error: error.message

        });

    }

});


// =====================================================
// GET REGISTRATIONS
// =====================================================

app.get("/api/registrations", async (req, res) => {

    try {

        const registrations =
            await Registration.find();

        res.json(registrations);

    } catch (error) {

        console.error(
            "Fetch registrations error:",
            error
        );

        res.status(500).json({

            message: "Failed to fetch registrations",

            error: error.message

        });

    }

});


// =====================================================
// 404 ROUTE
// =====================================================

app.use((req, res) => {

    res.status(404).json({
        success: false,
        message: "API route not found"
    });

});


// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use((error, req, res, next) => {

    console.error(
        "Server error:",
        error
    );

    res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
    });

});


// =====================================================
// MONGODB CONNECTION
// =====================================================

mongoose
    .connect(process.env.MONGO_URI)

    .then(() => {

        console.log(
            "MongoDB connected successfully"
        );


        // =================================================
        // START SERVER
        // =================================================

        const PORT =
            process.env.PORT || 5000;

        app.listen(
            PORT,
            "0.0.0.0",
            () => {

                console.log(
                    `Server running on port ${PORT}`
                );

            }
        );

    })

    .catch((error) => {

        console.error(
            "MongoDB connection failed:"
        );

        console.error(
            error.message
        );

        process.exit(1);

    });