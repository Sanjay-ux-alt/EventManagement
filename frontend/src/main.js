import './style.css';
import QRCode from 'qrcode';

const API_URL = 'https://eventmanagement-backend-8inb.onrender.com';

/*
==================================================
UPI SETTINGS
==================================================

IMPORTANT:
Put your REAL UPI ID here.

It should normally contain ONE @ symbol.

Example:
8310293612-u60f@ybl

Do NOT write:
8310293612-u60f@ybl@CANARABANK
*/

const MERCHANT_UPI_ID = '8310293612-u60f@ybl';
const MERCHANT_NAME = 'EventHub';


let selectedEvent = null;
let allEvents = [];

const app = document.querySelector('#app');


// ==================================================
// PAGE HTML
// ==================================================

app.innerHTML = `

<nav class="navbar">

    <div class="logo">
        🎓 EventHub
    </div>

    <div class="nav-links">

        <a href="#home">
            Home
        </a>

        <a href="#events">
            Events
        </a>

        <a href="#registrations">
            Registrations
        </a>

        <a href="/admin-login.html">
            Admin
        </a>

    </div>

</nav>


<div class="container" id="home">

    <h1>
        Online Event Management System
    </h1>

    <p>
        Manage and register for exciting events
    </p>


    <!-- SEARCH -->

    <div class="search-box">

        <input
            id="searchInput"
            type="text"
            placeholder="Search events..."
        >

        <select id="categoryFilter">

            <option value="All">
                All Categories
            </option>

            <option value="Technology">
                💻 Technology
            </option>

            <option value="Cultural">
                🎨 Cultural
            </option>

            <option value="Sports">
                🏆 Sports
            </option>

            <option value="Workshop">
                🎤 Workshop
            </option>

        </select>

    </div>


    <!-- EVENTS -->

    <h2 id="events">
        Upcoming Events
    </h2>


    <div id="eventContainer">

        <p>
            Loading events...
        </p>

    </div>


    <!-- REGISTRATION FORM -->

    <div
        id="registrationForm"
        class="registration-form"
        style="display: none;"
    >

        <h2>
            Event Registration
        </h2>


        <p id="selectedEventInfo"></p>


        <input
            id="name"
            type="text"
            placeholder="Enter your name"
        >


        <input
            id="email"
            type="email"
            placeholder="Enter your email"
        >


        <input
            id="phone"
            type="tel"
            placeholder="Enter your phone number"
        >


        <!-- RAZORPAY -->

        <button
            id="submitBtn"
            type="button"
        >
            💳 Pay Event Fee with Razorpay
        </button>


        <!-- UPI QR PAYMENT -->

        <div class="upi-payment-section">

            <div class="upi-divider">
                <span>OR</span>
            </div>


            <h3>
                📱 Pay using UPI QR
            </h3>


            <p class="upi-info">
                Scan this QR code using Google Pay,
                PhonePe, Paytm or another UPI app.
            </p>


            <div id="upiQrContainer">

                <p>
                    QR code will appear here.
                </p>

            </div>


            <p
                id="upiAmount"
                class="upi-amount"
            ></p>


            <p class="upi-id-display">
                UPI ID:
                <strong id="displayUpiId">
                    ${MERCHANT_UPI_ID}
                </strong>
            </p>


            <button
                id="copyUpiButton"
                type="button"
                class="upi-copy-button"
            >
                📋 Copy UPI ID
            </button>


            <button
                id="upiPaidButton"
                type="button"
                class="upi-paid-button"
            >
                ✅ I Have Completed UPI Payment
            </button>


            <p
                id="upiRegistrationMessage"
                class="upi-message"
            ></p>

        </div>


        <p
            id="message"
            class="payment-message"
        ></p>

    </div>


    <!-- REGISTRATION HISTORY -->

    <div
        class="registration-history"
        id="registrations"
    >

        <h2>
            Registration History
        </h2>


        <div id="registrationList">

            <p>
                Loading registrations...
            </p>

        </div>

    </div>

</div>


<!-- EVENT DETAILS MODAL -->

<div
    id="eventModal"
    class="event-modal"
>

    <div class="event-modal-content">

        <button
            id="closeModal"
            class="close-modal"
            type="button"
        >
            ×
        </button>


        <div id="modalContent"></div>

    </div>

</div>

`;


// ==================================================
// EVENT IMAGE
// ==================================================

function getEventImage(event) {

    if (event.image) {

        return '/' + event.image;

    }


    if (
        event.title &&
        event.title
            .toLowerCase()
            .includes('tech')
    ) {

        return '/tech-fest.jpeg';

    }


    return '/college-fest.jpeg';

}


// ==================================================
// LOAD RAZORPAY
// ==================================================

function loadRazorpayScript() {

    return new Promise((resolve) => {

        if (window.Razorpay) {

            resolve(true);

            return;

        }


        const script =
            document.createElement('script');


        script.src =
            'https://checkout.razorpay.com/v1/checkout.js';


        script.onload = () => {

            resolve(true);

        };


        script.onerror = () => {

            resolve(false);

        };


        document.body.appendChild(script);

    });

}


// ==================================================
// GENERATE UPI QR
// ==================================================

async function generateUPIQRCode(event) {

    const container =
        document.querySelector(
            '#upiQrContainer'
        );


    const amountText =
        document.querySelector(
            '#upiAmount'
        );


    if (!container || !event) {

        return;

    }


    container.innerHTML = '';

    amountText.textContent = '';


    const amount =
        Number(event.price);


    if (
        !MERCHANT_UPI_ID ||
        !MERCHANT_UPI_ID.includes('@')
    ) {

        container.innerHTML = `

            <p style="color: red;">
                Please enter a valid UPI ID
                in main.js.
            </p>

        `;

        return;

    }


    /*
    Create UPI payment URL
    */

    const params =
        new URLSearchParams();


    params.set(
        'pa',
        MERCHANT_UPI_ID
    );


    params.set(
        'pn',
        MERCHANT_NAME
    );


    params.set(
        'am',
        amount.toFixed(2)
    );


    params.set(
        'cu',
        'INR'
    );


    params.set(
        'tn',
        event.title
    );


    const upiURL =
        'upi://pay?' +
        params.toString();


    try {

        const canvas =
            document.createElement('canvas');


        container.appendChild(canvas);


        await QRCode.toCanvas(
            canvas,
            upiURL,
            {
                width: 250,
                margin: 2
            }
        );


        amountText.textContent =
            'Amount to pay: ₹' +
            amount;

    }

    catch (error) {

        console.error(
            'QR generation error:',
            error
        );


        container.innerHTML = `

            <p style="color: red;">
                Could not generate QR code.
            </p>

        `;

    }

}


// ==================================================
// LOAD EVENTS
// ==================================================

async function loadEvents() {

    try {

        const response =
            await fetch(
                API_URL + '/api/events'
            );


        if (!response.ok) {

            throw new Error(
                'Failed to load events'
            );

        }


        const events =
            await response.json();


        allEvents =
            events.filter(
                (event) =>
                    event.title
                        .toLowerCase() !==
                    'gaming'
            );


        displayEvents(allEvents);

    }

    catch (error) {

        console.error(
            'Events error:',
            error
        );


        document.querySelector(
            '#eventContainer'
        ).innerHTML = `

            <p style="color:red;">
                Could not connect to server.
                Please make sure backend is running.
            </p>

        `;

    }

}


// ==================================================
// DISPLAY EVENTS
// ==================================================

function displayEvents(events) {

    const container =
        document.querySelector(
            '#eventContainer'
        );


    if (!events.length) {

        container.innerHTML =
            '<p>No events found.</p>';

        return;

    }


    container.innerHTML = '';


    events.forEach((event) => {

        const card =
            document.createElement('div');


        card.className =
            'event-card';


        card.innerHTML = `

            <img
                src="${getEventImage(event)}"
                alt="${event.title}"
                class="event-image"
            >


            <h3>
                ${event.title}
            </h3>


            <p>
                ${event.description}
            </p>


            <p>
                <strong>
                    Category:
                </strong>

                ${event.category || 'Not specified'}
            </p>


            <p>
                <strong>
                    Date:
                </strong>

                ${new Date(
                    event.date
                ).toLocaleDateString()}
            </p>


            <p>
                <strong>
                    Location:
                </strong>

                ${event.location}
            </p>


            <p>
                <strong>
                    Price:
                </strong>

                ₹${event.price}
            </p>


            <div class="event-buttons">

                <button
                    class="viewDetailsBtn"
                    type="button"
                >
                    View Details
                </button>


                <button
                    class="registerBtn"
                    type="button"
                >
                    Register Now
                </button>

            </div>

        `;


        card.querySelector(
            '.viewDetailsBtn'
        ).addEventListener(
            'click',
            () => {

                showEventDetails(event);

            }
        );


        card.querySelector(
            '.registerBtn'
        ).addEventListener(
            'click',
            () => {

                selectEventForRegistration(
                    event
                );

            }
        );


        container.appendChild(card);

    });

}


// ==================================================
// SEARCH + CATEGORY FILTER
// ==================================================

function filterEvents() {

    const search =
        document.querySelector(
            '#searchInput'
        ).value
            .toLowerCase()
            .trim();


    const category =
        document.querySelector(
            '#categoryFilter'
        ).value;


    const filtered =
        allEvents.filter((event) => {

            const matchesSearch =
                event.title
                    .toLowerCase()
                    .includes(search);


            const matchesCategory =
                category === 'All' ||
                event.category === category;


            return (
                matchesSearch &&
                matchesCategory
            );

        });


    displayEvents(filtered);

}


document.querySelector(
    '#searchInput'
).addEventListener(
    'input',
    filterEvents
);


document.querySelector(
    '#categoryFilter'
).addEventListener(
    'change',
    filterEvents
);


// ==================================================
// EVENT DETAILS
// ==================================================

function showEventDetails(event) {

    const modal =
        document.querySelector(
            '#eventModal'
        );


    const content =
        document.querySelector(
            '#modalContent'
        );


    content.innerHTML = `

        <img
            src="${getEventImage(event)}"
            alt="${event.title}"
            class="modal-event-image"
        >


        <h2>
            ${event.title}
        </h2>


        <p>
            ${event.description}
        </p>


        <p>
            <strong>
                Category:
            </strong>

            ${event.category || 'Not specified'}
        </p>


        <p>
            <strong>
                Date:
            </strong>

            ${new Date(
                event.date
            ).toLocaleDateString()}
        </p>


        <p>
            <strong>
                Location:
            </strong>

            ${event.location}
        </p>


        <p>
            <strong>
                Entry Fee:
            </strong>

            ₹${event.price}
        </p>


        <button
            id="modalRegisterBtn"
            class="registerBtn"
            type="button"
        >
            Register Now
        </button>

    `;


    modal.style.display = 'flex';


    document.querySelector(
        '#modalRegisterBtn'
    ).addEventListener(
        'click',
        () => {

            closeEventModal();

            selectEventForRegistration(event);

        }
    );

}


// ==================================================
// CLOSE MODAL
// ==================================================

function closeEventModal() {

    document.querySelector(
        '#eventModal'
    ).style.display = 'none';

}


document.querySelector(
    '#closeModal'
).addEventListener(
    'click',
    closeEventModal
);


document.querySelector(
    '#eventModal'
).addEventListener(
    'click',
    (event) => {

        if (
            event.target.id ===
            'eventModal'
        ) {

            closeEventModal();

        }

    }
);


// ==================================================
// SELECT EVENT FOR REGISTRATION
// ==================================================

function selectEventForRegistration(event) {

    selectedEvent =
        event;


    document.querySelector(
        '#registrationForm'
    ).style.display = 'block';


    document.querySelector(
        '#selectedEventInfo'
    ).innerHTML = `

        <strong>
            Selected Event:
        </strong>

        ${event.title}

        <br>

        <strong>
            Event Fee:
        </strong>

        ₹${event.price}

    `;


    document.querySelector(
        '#message'
    ).textContent = '';


    document.querySelector(
        '#upiRegistrationMessage'
    ).textContent = '';


    generateUPIQRCode(event);


    document.querySelector(
        '#registrationForm'
    ).scrollIntoView({
        behavior: 'smooth'
    });

}


// ==================================================
// COPY UPI ID
// ==================================================

document.querySelector(
    '#copyUpiButton'
).addEventListener(
    'click',
    async () => {

        const message =
            document.querySelector(
                '#upiRegistrationMessage'
            );


        try {

            await navigator.clipboard.writeText(
                MERCHANT_UPI_ID
            );


            message.textContent =
                '✅ UPI ID copied successfully.';

        }

        catch (error) {

            message.textContent =
                'UPI ID: ' +
                MERCHANT_UPI_ID;

        }

    }
);


// ==================================================
// UPI REGISTRATION
// ==================================================

document.querySelector(
    '#upiPaidButton'
).addEventListener(
    'click',
    async () => {

        const name =
            document.querySelector(
                '#name'
            ).value.trim();


        const email =
            document.querySelector(
                '#email'
            ).value.trim();


        const phone =
            document.querySelector(
                '#phone'
            ).value.trim();


        const message =
            document.querySelector(
                '#upiRegistrationMessage'
            );


        if (!selectedEvent) {

            message.textContent =
                'Please select an event first.';

            return;

        }


        if (
            !name ||
            !email ||
            !phone
        ) {

            message.textContent =
                'Please enter your name, email and phone number.';

            return;

        }


        try {

            message.textContent =
                'Saving registration...';


            const response =
                await fetch(
                    API_URL +
                    '/api/registrations',
                    {

                        method: 'POST',

                        headers: {

                            'Content-Type':
                                'application/json'

                        },

                        body:
                            JSON.stringify({

                                name:
                                    name,

                                email:
                                    email,

                                phone:
                                    phone,

                                eventName:
                                    selectedEvent.title

                            })

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                message.textContent =
                    data.message ||
                    'Registration failed.';

                return;

            }


            message.textContent =
                '🎉 UPI payment completed and registration saved!';


            document.querySelector(
                '#name'
            ).value = '';


            document.querySelector(
                '#email'
            ).value = '';


            document.querySelector(
                '#phone'
            ).value = '';


            await loadRegistrations();

        }

        catch (error) {

            console.error(
                'UPI registration error:',
                error
            );


            message.textContent =
                'Could not save registration.';

        }

    }
);


// ==================================================
// RAZORPAY PAYMENT
// ==================================================

document.querySelector(
    '#submitBtn'
).addEventListener(
    'click',
    async () => {

        const name =
            document.querySelector(
                '#name'
            ).value.trim();


        const email =
            document.querySelector(
                '#email'
            ).value.trim();


        const phone =
            document.querySelector(
                '#phone'
            ).value.trim();


        const message =
            document.querySelector(
                '#message'
            );


        if (
            !name ||
            !email ||
            !phone
        ) {

            message.textContent =
                'Please fill all fields.';

            return;

        }


        if (!selectedEvent) {

            message.textContent =
                'Please select an event first.';

            return;

        }


        try {

            message.textContent =
                'Preparing Razorpay payment...';


            const loaded =
                await loadRazorpayScript();


            if (!loaded) {

                message.textContent =
                    'Unable to load Razorpay.';

                return;

            }


            // CREATE RAZORPAY ORDER

            const orderResponse =
                await fetch(
                    API_URL +
                    '/api/payment/create-order',
                    {

                        method: 'POST',

                        headers: {

                            'Content-Type':
                                'application/json'

                        },

                        body:
                            JSON.stringify({

                                amount:
                                    Number(
                                        selectedEvent.price
                                    )

                            })

                    }
                );


            const orderData =
                await orderResponse.json();


            if (!orderResponse.ok) {

                message.textContent =
                    orderData.message ||
                    'Could not create payment order.';

                return;

            }


            // FRONTEND RAZORPAY KEY

            const razorpayKey =
                import.meta.env
                    .VITE_RAZORPAY_KEY_ID;


            if (!razorpayKey) {

                message.textContent =
                    'Razorpay Key ID is missing from frontend .env.';

                return;

            }


            // RAZORPAY OPTIONS

            const options = {

                key:
                    razorpayKey,

                amount:
                    orderData.order.amount,

                currency:
                    orderData.order.currency,

                name:
                    'EventHub',

                description:
                    selectedEvent.title,

                order_id:
                    orderData.order.id,

                prefill: {

                    name:
                        name,

                    email:
                        email,

                    contact:
                        phone

                },

                theme: {

                    color:
                        '#3399cc'

                },


                handler:
                    async function(response) {

                        try {

                            message.textContent =
                                'Verifying payment...';


                            // VERIFY RAZORPAY PAYMENT

                            const verifyResponse =
                                await fetch(
                                    API_URL +
                                    '/api/payment/verify',
                                    {

                                        method: 'POST',

                                        headers: {

                                            'Content-Type':
                                                'application/json'

                                        },

                                        body:
                                            JSON.stringify({

                                                razorpay_order_id:
                                                    response.razorpay_order_id,

                                                razorpay_payment_id:
                                                    response.razorpay_payment_id,

                                                razorpay_signature:
                                                    response.razorpay_signature

                                            })

                                    }
                                );


                            const verifyData =
                                await verifyResponse.json();


                            if (
                                !verifyResponse.ok
                            ) {

                                message.textContent =
                                    verifyData.message ||
                                    'Payment verification failed.';

                                return;

                            }


                            // SAVE REGISTRATION

                            const registrationResponse =
                                await fetch(
                                    API_URL +
                                    '/api/registrations',
                                    {

                                        method: 'POST',

                                        headers: {

                                            'Content-Type':
                                                'application/json'

                                        },

                                        body:
                                            JSON.stringify({

                                                name:
                                                    name,

                                                email:
                                                    email,

                                                phone:
                                                    phone,

                                                eventName:
                                                    selectedEvent.title

                                            })

                                    }
                                );


                            const registrationData =
                                await registrationResponse.json();


                            if (
                                !registrationResponse.ok
                            ) {

                                message.textContent =
                                    registrationData.message ||
                                    'Payment successful, but registration failed.';

                                return;

                            }


                            message.textContent =
                                '🎉 Payment successful! Registration completed.';


                            document.querySelector(
                                '#name'
                            ).value = '';


                            document.querySelector(
                                '#email'
                            ).value = '';


                            document.querySelector(
                                '#phone'
                            ).value = '';


                            await loadRegistrations();

                        }

                        catch (error) {

                            console.error(
                                'Payment verification error:',
                                error
                            );


                            message.textContent =
                                'Payment verification failed.';

                        }

                    }

            };


            const razorpay =
                new window.Razorpay(
                    options
                );


            razorpay.on(
                'payment.failed',
                function(response) {

                    console.error(
                        'Razorpay payment failed:',
                        response.error
                    );


                    message.textContent =
                        '❌ Payment failed. Please try again.';

                }
            );


            razorpay.open();


            message.textContent =
                'Complete your payment in Razorpay...';

        }

        catch (error) {

            console.error(
                'Razorpay error:',
                error
            );


            message.textContent =
                'Could not connect to payment server.';

        }

    }
);


// ==================================================
// LOAD REGISTRATION HISTORY
// ==================================================

async function loadRegistrations() {

    try {

        const response =
            await fetch(
                API_URL +
                '/api/registrations'
            );


        if (!response.ok) {

            throw new Error(
                'Failed to load registrations'
            );

        }


        const registrations =
            await response.json();


        const list =
            document.querySelector(
                '#registrationList'
            );


        if (
            !registrations.length
        ) {

            list.innerHTML =
                '<p>No registrations yet.</p>';

            return;

        }


        list.innerHTML = '';


        registrations.forEach(
            (
                registration,
                index
            ) => {

                const card =
                    document.createElement(
                        'div'
                    );


                card.className =
                    'registration-card';


                card.innerHTML = `

                    <h3>
                        Registration ${index + 1}
                    </h3>


                    <p>

                        <strong>
                            Name:
                        </strong>

                        ${registration.name}

                    </p>


                    <p>

                        <strong>
                            Email:
                        </strong>

                        ${registration.email}

                    </p>


                    <p>

                        <strong>
                            Phone:
                        </strong>

                        ${registration.phone}

                    </p>


                    <p>

                        <strong>
                            Event:
                        </strong>

                        ${registration.eventName}

                    </p>

                `;


                list.appendChild(card);

            }
        );

    }

    catch (error) {

        console.error(
            'Registration history error:',
            error
        );


        document.querySelector(
            '#registrationList'
        ).innerHTML = `

            <p>
                Could not load registrations.
            </p>

        `;

    }

}


// ==================================================
// START APPLICATION
// ==================================================

loadEvents();

loadRegistrations();


// ==================================================
// FOOTER
// ==================================================

app.insertAdjacentHTML(
    'beforeend',
    `

    <footer class="footer">

        <p>
            © 2026 EventHub
        </p>

        <p>
            Online Event Management System
        </p>

    </footer>

    `
);