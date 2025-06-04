from flask import Flask, render_template, redirect, url_for, session, request
from pymongo import MongoClient

app = Flask(__name__)
app.secret_key = 'your_random_secure_key_here'  # Change this to a random secure key

# ✅ MongoDB Setup
client = MongoClient('mongodb://localhost:27017/')
db = client['hoteldb']  # Your database name
users_col = db['users']
bookings_col = db['roombookings']
food_orders_col = db['food_orders']

@app.route('/delete_user', methods=['POST'])
def delete_user():
    if 'username' not in session or session.get('role') != 'admin':
        return redirect(url_for('login'))

    username_to_delete = request.json.get('username')
    result = users_col.delete_one({'username': username_to_delete})
    if result.deleted_count == 0:
        return {'success': False, 'message': 'User not found'}
    return {'success': True}

@app.route('/update_booking', methods=['POST'])
def update_booking():
    data = request.json
    username = data['username']
    new_status = data['status']
    result = bookings_col.update_one(
        {'username': username},
        {'$set': {'status': new_status}}
    )
    if result.matched_count == 0:
        return {'success': False, 'message': 'Booking not found'}
    return {'success': True}

@app.route('/cancel_order', methods=['POST'])
def cancel_order():
    username = request.json.get('username')
    food_item = request.json.get('food_item')
    table_no = request.json.get('table_no')
    result = food_orders_col.delete_one({
        'username': username,
        'food_item': food_item,
        'table_no': table_no
    })
    return {'success': True}

# -----------------------------
# User Login
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        # ✅ Simulate login (replace with DB authentication in future)
        if username == 'admin' and password == 'adminpass':
            session['username'] = username
            session['role'] = 'admin'
            return redirect(url_for('admin'))
        elif username and password:
            session['username'] = username
            session['role'] = 'user'
            return redirect(url_for('landing_page', user_name=username))
        else:
            return render_template('login.html', error="Invalid credentials")
    return render_template('login.html')

# -----------------------------
# Landing Page
@app.route('/')
def landing():
    if 'username' in session:
        return render_template('landing.html', error=None)
    return redirect(url_for('login'))

@app.route('/landing')
def landing_page():
    return render_template('landing.html')

# -----------------------------
# Room Booking Page
@app.route('/rooms')
def rooms():
    if 'username' not in session:
        return redirect(url_for('login'))
    return render_template('rooms.html', error=None)

# -----------------------------
# Restaurant Page
@app.route('/restaurant')
def restaurant():
    if 'username' not in session:
        return redirect(url_for('login'))
    return render_template('restaurant.html', error=None)

# -----------------------------
# Handle Room Booking
@app.route('/book_room', methods=['POST'])
def book_room():
    if 'username' not in session:
        return redirect(url_for('login'))
    user_name = request.form['userName']
    user_contact = request.form['contactNumber']
    room_type = request.form['roomType']
    room_price = request.form['roomPrice']
    checkin_date = request.form['checkin']
    checkout_date = request.form['checkout']
    guests = request.form['guests']
    result = bookings_col.insert_one({
        'username': user_name,
        'contact': user_contact,
        'room_type': room_type,
        'room_price': room_price,
        'checkin': checkin_date,
        'checkout': checkout_date,
        'guests': guests,
        'status': 'Confirmed'
    })
    if result.acknowledged:
        return render_template('payment.html', user_name=user_name, user_contact=user_contact, order_type='room', 
        room_type=room_type, room_price=room_price, checkin_date=checkin_date, checkout_date=checkout_date, guests=guests)

@app.route('/order_food', methods=['POST'])
def order_food():
    if 'username' not in session:
        return redirect(url_for('login'))
    food_name = request.form['food_name']
    food_price = request.form['food_price']
    user_name = session['username']  # Using logged-in username
    user_contact = ''  # Add logic to retrieve contact if available
    result = food_orders_col.insert_one({
        'username': user_name,
        'contact': user_contact,
        'food_name': food_name,
        'food_price': food_price,
        'status': 'Confirmed',
        'order_type': 'food'
    })
    if result.acknowledged:
        return render_template('payment.html', user_name=user_name, order_type='food', 
        food_name=food_name, food_price=food_price, quantity=1)

# -----------------------------
# Handle Payment
@app.route('/payment', methods=['POST'])
def payment():
    # Handle payment logic
    return redirect(url_for('confirmation', user_name=request.form.get("user_name"), user_contact=request.form.get("user_contact"), order_type=request.form.get("order_type")))

# -----------------------------
@app.route("/confirmation", methods=["POST"])
def confirmation():
    order_type = request.form["order_type"]
    if order_type is None:
        return render_template('payment.html', error="Order type is required.")

    context = { 
        "error": None,
        "user_name": request.form["user_name"],
        "user_contact": request.form["user_contact"],
        "order_type": order_type
    }
    if order_type == "room":
        context.update({
            "room_type": request.form["room_type"],
            "checkin_date": request.form["checkin_date"],
            "checkout_date": request.form["checkout_date"],
            "guests": request.form["guests"],
            "room_price": request.form["room_price"]
        })
    elif order_type == "food":
        context.update({
            "food_name": request.form["food_name"],
            "quantity": request.form["quantity"],
            "food_price": request.form["food_price"],
        })

    return render_template("conformation.html", **context) 

# -----------------------------
# Admin Dashboard
@app.route('/admin')
def admin():
    if 'username' not in session or session.get('role') != 'admin':
        return redirect(url_for('login'))

    # ✅ Fetch from DB
    users = list(users_col.find({}, {'_id': 0, 'username': 1})) 
    bookings = list(bookings_col.find({}, {'_id': 0}))
    food_orders = list(food_orders_col.find({}, {'_id': 0}))
    print(food_orders)
    return render_template('admin.html', users=users, bookings=bookings, food_orders=food_orders)

# Logout
@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

# -----------------------------
@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        # handle registration logic
        username = request.form["username"]
        password = request.form["password"]
        # Save to DB, etc.
        return redirect(url_for('login'))
    return render_template("register.html")

if __name__ == '__main__':
    app.run(debug=True)
