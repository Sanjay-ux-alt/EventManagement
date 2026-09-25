import './style.css';

const API_URL = 'https://eventmanagement-backend-8inb.onrender.com';

let events = [];
let editingEventId = null;

/* ================================
   ADMIN PAGE
================================ */

document.querySelector('#app').innerHTML = `

    <nav class="navbar">

        <div class="logo">
            🎓 EventHub Admin
        </div>

        <div class="nav-links">

            <a href="/">Home</a>

            <button id="logoutBtn">
                Logout
            </button>

        </div>

    </nav>


    <div class="container">

        <h1>Admin Dashboard</h1>

        <p>Manage your events</p>


        <!-- ADD / EDIT EVENT -->

        <div class="registration-form">

            <h2 id="formTitle">
                Add New Event
            </h2>


            <!-- EVENT TITLE -->

            <input
                type="text"
                id="title"
                placeholder="Event Title"
            >


            <!-- DESCRIPTION -->

            <textarea
                id="description"
                placeholder="Event Description"
                rows="4"
            ></textarea>


            <!-- CATEGORY -->

            <select id="category">

                <option value="">
                    Select Category
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


            <!-- DATE -->

            <input
                type="date"
                id="date"
            >


            <!-- LOCATION -->

            <input
                type="text"
                id="location"
                placeholder="Event Location"
            >


            <!-- PRICE -->

            <input
                type="number"
                id="price"
                placeholder="Event Price"
                min="0"
            >


            <!-- IMAGE -->

            <input
                type="text"
                id="image"
                placeholder="Image filename e.g. tech-fest.jpeg"
            >


            <!-- BUTTONS -->

            <button id="saveEventBtn">
                Add Event
            </button>

            <button
                id="cancelEditBtn"
                style="display: none;"
            >
                Cancel Edit
            </button>


            <!-- MESSAGE -->

            <p id="message"></p>

        </div>


        <!-- ALL EVENTS -->

        <h2>All Events</h2>

        <div id="eventContainer">

            <p>Loading events...</p>

        </div>

    </div>


    <!-- FOOTER -->

    <footer class="footer">

        <p>© 2026 EventHub</p>

        <p>
            Online Event Management System
        </p>

    </footer>

`;


/* ================================
   FORM ELEMENTS
================================ */

const titleInput =
    document.querySelector('#title');

const descriptionInput =
    document.querySelector('#description');

const categoryInput =
    document.querySelector('#category');

const dateInput =
    document.querySelector('#date');

const locationInput =
    document.querySelector('#location');

const priceInput =
    document.querySelector('#price');

const imageInput =
    document.querySelector('#image');

const saveEventBtn =
    document.querySelector('#saveEventBtn');

const cancelEditBtn =
    document.querySelector('#cancelEditBtn');

const message =
    document.querySelector('#message');

const eventContainer =
    document.querySelector('#eventContainer');

const formTitle =
    document.querySelector('#formTitle');

const logoutBtn =
    document.querySelector('#logoutBtn');


/* ================================
   LOAD EVENTS
================================ */

async function loadEvents() {

    try {

        const response =
            await fetch(`${API_URL}/api/events`);

        if (!response.ok) {
            throw new Error('Unable to load events');
        }

        events = await response.json();

        displayEvents();

    } catch (error) {

        console.error('Load events error:', error);

        eventContainer.innerHTML = `
            <p>
                ❌ Unable to load events.
            </p>
        `;

    }

}


/* ================================
   EVENT IMAGE
================================ */

function getEventImage(event) {

    if (event.image) {

        return '/' + event.image;

    }

    if (
        event.title &&
        event.title.toLowerCase().includes('tech')
    ) {

        return '/tech-fest.jpeg';

    }

    return '/college-fest.jpeg';

}


/* ================================
   DISPLAY EVENTS
================================ */

function displayEvents() {

    if (events.length === 0) {

        eventContainer.innerHTML = `
            <p>No events available.</p>
        `;

        return;

    }


    eventContainer.innerHTML = events.map(event => `

        <div class="event-card">

            <img
                src="${getEventImage(event)}"
                alt="${event.title}"
            >

            <div class="event-content">

                <h3>
                    ${event.title}
                </h3>

                <p>
                    ${event.description}
                </p>

                <p>
                    📂 <strong>Category:</strong>
                    ${event.category || 'Not specified'}
                </p>

                <p>
                    📅 ${formatDate(event.date)}
                </p>

                <p>
                    📍 ${event.location}
                </p>

                <p>
                    💰 ₹${event.price}
                </p>

                <div class="event-actions">

                    <button
                        onclick="editEvent('${event._id}')"
                    >
                        ✏️ Edit
                    </button>

                    <button
                        onclick="deleteEvent('${event._id}')"
                    >
                        🗑️ Delete
                    </button>

                </div>

            </div>

        </div>

    `).join('');

}


/* ================================
   DATE
================================ */

function formatDate(date) {

    if (!date) {
        return 'Date not available';
    }

    return new Date(date)
        .toLocaleDateString('en-IN');

}


/* ================================
   ADD / UPDATE EVENT
================================ */

saveEventBtn.addEventListener(
    'click',
    async () => {

        const title =
            titleInput.value.trim();

        const description =
            descriptionInput.value.trim();

        const category =
            categoryInput.value;

        const date =
            dateInput.value;

        const location =
            locationInput.value.trim();

        const price =
            priceInput.value;

        const image =
            imageInput.value.trim();


        /* VALIDATION */

        if (
            !title ||
            !description ||
            !category ||
            !date ||
            !location ||
            price === ''
        ) {

            message.textContent =
                '⚠️ Please fill all required fields.';

            return;

        }


        const eventData = {

            title: title,

            description: description,

            category: category,

            date: date,

            location: location,

            price: Number(price),

            image: image

        };


        try {

            let response;


            /* UPDATE */

            if (editingEventId) {

                response = await fetch(
                    `${API_URL}/api/events/${editingEventId}`,
                    {
                        method: 'PUT',

                        headers: {
                            'Content-Type':
                                'application/json'
                        },

                        body:
                            JSON.stringify(eventData)
                    }
                );

            }


            /* ADD */

            else {

                response = await fetch(
                    `${API_URL}/api/events`,
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type':
                                'application/json'
                        },

                        body:
                            JSON.stringify(eventData)
                    }
                );

            }


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    'Something went wrong'
                );

            }


            message.textContent =
                editingEventId
                    ? '✅ Event updated successfully!'
                    : '✅ Event added successfully!';


            resetForm();

            await loadEvents();


        } catch (error) {

            console.error('Save event error:', error);

            message.textContent =
                '❌ ' + error.message;

        }

    }
);


/* ================================
   EDIT EVENT
================================ */

window.editEvent = function (id) {

    const event =
        events.find(
            item => item._id === id
        );


    if (!event) {
        return;
    }


    editingEventId = id;


    formTitle.textContent =
        'Edit Event';


    saveEventBtn.textContent =
        'Update Event';


    cancelEditBtn.style.display =
        'inline-block';


    titleInput.value =
        event.title || '';

    descriptionInput.value =
        event.description || '';

    categoryInput.value =
        event.category || '';

    locationInput.value =
        event.location || '';

    priceInput.value =
        event.price ?? '';

    imageInput.value =
        event.image || '';


    if (event.date) {

        dateInput.value =
            new Date(event.date)
                .toISOString()
                .split('T')[0];

    }


    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });

};


/* ================================
   DELETE EVENT
================================ */

window.deleteEvent = async function (id) {

    const confirmDelete =
        confirm(
            'Are you sure you want to delete this event?'
        );


    if (!confirmDelete) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/events/${id}`,
                {
                    method: 'DELETE'
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                'Failed to delete event'
            );

        }


        message.textContent =
            '✅ Event deleted successfully!';


        await loadEvents();


    } catch (error) {

        console.error('Delete event error:', error);

        message.textContent =
            '❌ ' + error.message;

    }

};


/* ================================
   CANCEL EDIT
================================ */

cancelEditBtn.addEventListener(
    'click',
    () => {

        resetForm();

    }
);


/* ================================
   RESET FORM
================================ */

function resetForm() {

    editingEventId = null;

    formTitle.textContent =
        'Add New Event';

    saveEventBtn.textContent =
        'Add Event';

    cancelEditBtn.style.display =
        'none';

    titleInput.value = '';

    descriptionInput.value = '';

    categoryInput.value = '';

    dateInput.value = '';

    locationInput.value = '';

    priceInput.value = '';

    imageInput.value = '';

    message.textContent = '';

}


/* ================================
   LOGOUT
================================ */

logoutBtn.addEventListener(
    'click',
    () => {

        window.location.href = '/';

    }
);


/* ================================
   START ADMIN PAGE
================================ */

loadEvents();