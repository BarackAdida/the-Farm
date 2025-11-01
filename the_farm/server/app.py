from flask import Flask, request, jsonify
from extensions import db, bcrypt, migrate, mail
from config import Config
from dotenv import load_dotenv
from models import User, Batch, EggProduction, Sales, Expenses, EmployeeData, Profit, Stock, VaccinationInfo, VaccinationSchedule, FeedRecord
from profits_util import generate_profit_record
from datetime import datetime, timedelta, timezone, date
from sqlalchemy import func
import pytz
from flask_cors import CORS
from flask_mail import Message
import random
from flask_jwt_extended import (JWTManager, create_access_token, jwt_required, get_jwt_identity, verify_jwt_in_request)
from functools import wraps

kenya_tz = pytz.timezone("Africa/Nairobi")
load_dotenv()

jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.config["JWT_TOKEN_LOCATION"] = ["headers"]
    app.config["JWT_HEADER_NAME"] = "Authorization"
    app.config["JWT_HEADER_TYPE"] = "Bearer"
    reset_codes = {}
    mail.init_app(app)
    jwt.init_app(app)
    db.init_app(app)
    bcrypt.init_app(app)
    migrate.init_app(app, db)
    CORS(app)
    
    def role_required(allowed_roles):
        """Restrict access based on user roles"""
        def decoder(fn):
            @wraps(fn)
            def wrapper(*args, **kwargs):
                verify_jwt_in_request()
                current_user = get_jwt_identity()
                if current_user["role"] not in allowed_roles:
                    return jsonify({"message": "Access forbidden: Insufficient permisions!"}), 403
                return fn(*args, **kwargs)
            return wrapper
        return decoder
    
    @app.route("/admin/data", methods=["GET"])
    @jwt_required()
    def admin_data():
        current_user = get_jwt_identity()
        
        if current_user["role"] != "admin":
            return jsonify({"message": "Access denied!!"})
        
        return jsonify({"data": "Sensitive admin data!"})
 
    @app.route("/signup", methods=["POST"])
    def signup():
        data = request.get_json()
        role = data.get("role")
        username = data.get("username").strip().lower()
        email = data.get("email").strip().lower()
        phone_number = data.get("phone_number").strip()
        password = data.get("password")
        admin_code = data.get("admin_code")

        if role == "admin":
            if admin_code != app.config["ADMIN_SIGNUP_CODE"]:
                return jsonify({"message": "Invalid admin signup code"}), 403

        existing_user = User.query.filter(
            (User.username == username)
            | (User.email == email)
            | (User.phone_number == phone_number)
        ).first()

        if existing_user:
            if existing_user.username == username:
                return jsonify({"message": "Username already exists"}), 400
            elif existing_user.email == email:
                return jsonify({"message": "Email already exists"}), 400
            elif existing_user.phone_number == phone_number:
                return jsonify({"message": "Phone number already exists"}), 400

        new_user = User(
            role=role,
            username=username,
            email=email,
            phone_number=phone_number,
            password=bcrypt.generate_password_hash(password).decode("utf-8"),
        )
        db.session.add(new_user)
        db.session.commit()
        
        try:
            msg = Message(
                subject="Welcome to Golden-Yolk",
                recipients =[email],
                body=f"Hello {username}, \n\nYour account has been created successfully!\n\nWelcome aboard 🚀"
            )
            mail.send(msg)
        except Exception as e:
            print("Email sending failed:", e)

        return jsonify({"message": f"{role.capitalize()} account created successfully, A confirmation email has been sent.!"}), 201

    @app.route("/login", methods=["POST"])
    def login():
        data = request.get_json()
        username_or_email = data.get("username_or_email")
        password = data.get("password")

        user = User.query.filter(
            (User.username == username_or_email) | (User.email == username_or_email)
        ).first()

        if not user or not bcrypt.check_password_hash(user.password, password):
            return jsonify({"message": "Invalid credentials"}), 401
        
        access_token = create_access_token(
            identity={"id": user.id, "role": user.role, "username": user.username}
        )

        return jsonify({
            "message": f"Welcome {user.username}!",
            "access_token": access_token,
            "role": user.role
        }), 200

    @app.route("/batch", methods=["POST", "GET"])
    def batch():
        if request.method == "POST":
            data = request.get_json()
            batch_name = data.get("batch_name")
            breed = data.get("breed")
            acquisition_date_str = data.get("acquisition_date")

            if not acquisition_date_str:
                return jsonify({"message": "Acquisition date is required"}), 400

            try:
                acquisition_date = datetime.strptime(acquisition_date_str, "%Y-%m-%d").date()
            except ValueError:
                try:
                    acquisition_date = datetime.strptime(acquisition_date_str, "%m/%d/%Y").date()
                except ValueError:
                    return jsonify({"message": "Invalid date format, use YYYY-MM-DD or MM/DD/YYYY"}), 400

            new_batch = Batch(
                batch_name=batch_name,
                breed=breed,
                acquisition_date=acquisition_date,
                initial_number=data.get("initial_number"),
                current_number=data.get("current_number"),
                status=data.get("status"),
            )
            db.session.add(new_batch)
            db.session.commit()
            return jsonify({"message": "Batch created successfully"})

        elif request.method == "GET":
            batches = Batch.query.all()
            if not batches:
                return jsonify([]), 200
            return jsonify([b.to_dict() for b in batches]), 200
        
    @app.route("/batches/<int:id>", methods=["PATCH", "DELETE"])
    def batches(id):
        if request.method == "PATCH":
            data = request.get_json()
            batch_id= data.get("id")
            
            batch = db.session.get(Batch, id)
            if not batch:
                return jsonify({"message": "Batch not found!"}), 404
            
            for field in ["batch_name", "breed", "acquisition_date", "initial_number", "current_number", "status"]:
                if field in data:
                    value = data[field]
                    if field  == "acquisition_date" and isinstance(value, str):
                        try:
                            value = datetime.strptime(value, "%Y-%m-%d").date()
                        except ValueError:
                            try:
                                value = datetime.strptime(value, "%m/%d/%Y").date()
                            except ValueError:
                                return jsonify({"message": "Invalid date format. Use YYYY-MM-DD."}), 400
                    setattr(batch, field, value)

            db.session.commit()
            return jsonify({"message": "Batch updated successfully!"})

        elif request.method == "DELETE":
            data = request.get_json()
            batch_id= data.get("id")
            
            if not batch_id:
                return jsonify({"message": "Please provide batch_id"}), 400
            
            batch = db.session.get(Batch, id)
            
            if not batch:
                return jsonify({"message": f"No batch found with name {batch_id}"}), 404

            db.session.delete(batch)
            db.session.commit()
            return jsonify({"message": "Batch deleted successfully"}), 200

    @app.route("/eggsproduction", methods=["POST", "GET"])
    def eggsproduction():
        if request.method == "POST":
            data = request.get_json()
            batch_id = data.get("batch_id")
            eggs_collected = int(data.get("eggs_collected", 0))
            broken_eggs = int(data.get("broken_eggs", 0))
            remarks = data.get("remarks")
            date_str = data.get("date")

            try:
                date = datetime.strptime(date_str, "%Y-%m-%d").date()
            except ValueError:
                try:
                    date = datetime.strptime(date_str, "%m/%d/%Y").date()
                except ValueError:
                    return jsonify({"message": "Invalid date format, use YYYY-MM-DD or MM/DD/YYYY"}), 400

            batch = Batch.query.filter_by(id=batch_id).first()
            if not batch:
                return jsonify({"message": "There is no batch with that ID"}), 404

            remaining_eggs = eggs_collected - broken_eggs

            prev_row = (
                EggProduction.query.filter_by(batch_id=batch_id)
                .order_by(EggProduction.date.desc())
                .first()
            )

            total_eggs = remaining_eggs + (prev_row.extra_eggs if prev_row else 0)
            quantity_in_crates = total_eggs // 30
            extra_eggs = total_eggs % 30

            stock = Stock.query.first()
            if not stock:
                stock = Stock(crates_in_store=0)
                db.session.add(stock)

            stock.crates_in_store += quantity_in_crates

            new_eggs = EggProduction(
                batch_id=batch_id,
                date=date,
                eggs_collected=eggs_collected,
                broken_eggs=broken_eggs,
                remaining_eggs=remaining_eggs,
                remarks=remarks,
                quantity_in_crates=quantity_in_crates,
                extra_eggs=extra_eggs,
            )
            db.session.add(new_eggs)
            db.session.commit()
            return jsonify({"message": "New eggs data added successfully"}), 200

        elif request.method == "GET":
            eggs_data = EggProduction.query.all()
            if not eggs_data:
                return jsonify([]), 200
            return jsonify([e.to_dict() for e in eggs_data]), 200

    @app.route("/eggsproduct/<int:id>", methods=["PATCH", "DELETE"])
    def eggsproduct(id):
        
        egg_col =db.session.get(EggProduction, id)
        if not egg_col:
            return jsonify({"message": "No collection info on that ID!"})
        
        stock = Stock.query.first()
        if not stock:
            stock = Stock(crates_in_store=0)
            db.session.add(stock)
            db.session.commit()
        
        if request.method == "PATCH":
            data = request.get_json()
            
            old_crates = egg_col.quantity_in_crates
            
            for field in ["date", "eggs_collected", "broken_eggs", "remarks"]:
                if field in data:
                    value = data[field]
                    if field  == "date" and isinstance(value, str):
                        try:
                            value = datetime.strptime(value, "%Y-%m-%d").date()
                        except ValueError:
                            try:
                                value = datetime.strptime(value, "%m/%d/%Y").date()
                            except ValueError:
                                return jsonify({"message": "Invalid date format. Use YYYY-MM-DD."}), 400                          
                                
                    setattr(egg_col, field, value)
                    
            egg_col.remaining_eggs = int(egg_col.eggs_collected) - int(egg_col.broken_eggs)
            total_eggs = egg_col.remaining_eggs
            egg_col.quantity_in_crates = total_eggs // 30
            egg_col.extra_eggs = total_eggs % 30
            
            new_crates = egg_col.quantity_in_crates
            stock.crates_in_store += (new_crates - old_crates)
            
            db.session.commit()
            return jsonify({"message": "Data and Stock updated successfully!"}), 200
        
        elif request.method == "DELETE":
            stock.crates_in_store -= egg_col.quantity_in_crates
            
            if stock.crates_in_store < 0:
                stock.crates_in_store = 0 
                
            db.session.delete(egg_col)
            db.session.commit()
            return jsonify({"message": "Deleted successfully"})

    @app.route("/sales", methods=["POST", "GET"])
    def sales():
        if request.method == "POST":
            data = request.get_json()
            date_str = data.get("date")

            if date_str:
                try:
                    date = datetime.strptime(date_str, "%Y-%m-%d").date()
                except ValueError:
                    try:
                        date = datetime.strptime(date_str, "%m/%d/%Y").date()
                    except ValueError:
                        return jsonify({"message": "Invalid date format, use MM/DD/YYYY"}), 400
            else:
                date = datetime.now(kenya_tz).date()

            buyer_name = data.get("buyer_name")
            quantity_in_crates = int(data.get("quantity_in_crates"))
            price_per_tray = float(data.get("price_per_tray"))
            transport_costs = float(data.get("transport_costs"))

            selling_price = quantity_in_crates * price_per_tray
            final_amount = selling_price

            stock = Stock.query.first()
            if stock:
                stock.crates_in_store -= quantity_in_crates
                if stock.crates_in_store < 0:
                    stock.crates_in_store = 0

            new_sales = Sales(
                date=date,
                buyer_name=buyer_name,
                quantity_in_crates=quantity_in_crates,
                price_per_tray=price_per_tray,
                transport_costs=transport_costs,
                selling_price=selling_price,
                final_amount=final_amount,
            )
            db.session.add(new_sales)
            db.session.commit()
            return jsonify({"message": "New Sale added successfully!"}), 201

        elif request.method == "GET":
            sales = Sales.query.all()
            if not sales:
                return jsonify({"message": "There are no sales records available"}), 404
            return jsonify([s.to_dict() for s in sales]), 200

    @app.route("/sale/<int:id>", methods=["PATCH", "DELETE"])
    def sale(id):
        sale = db.session.get(Sales, id)
        if not sale:
            return jsonify({"message": "No sale of that ID!"}), 404
        
        stock = Stock.query.first()
        if not stock:
            stock = Stock(crates_in_store = 0)
            db.session.add(stock)
            db.session.commit()
        
        
        if request.method == "PATCH":
            data = request.get_json()
            
            old_crates = sale.quantity_in_crates

            for field in ["date", "buyer_name", "quantity_in_crates", "price_per_tray", "transport_costs"]:
                if field in data:
                    value = data[field]
                    if field  == "date" and isinstance(value, str):
                        try:
                            value = datetime.strptime(value, "%Y-%m-%d").date()
                        except ValueError:
                            try:
                                value = datetime.strptime(value, "%m/%d/%Y").date()
                            except ValueError:
                                return jsonify({"message": "Invalid date format. Use YYYY-MM-DD."}), 400
                    setattr(sale, field, value)
                    
            sale.selling_price = sale.quantity_in_crates * sale.price_per_tray
            sale.final_amount = sale.selling_price - sale.transport_costs
            
            new_crates = sale.quantity_in_crates
            stock.crates_in_store += (old_crates - new_crates)
            if stock.crates_in_store < 0:
                stock.crates_in_store = 0

            db.session.commit()
            return jsonify({"message": "Sale updated successfully"}), 200
        
        elif request.method == "DELETE":
            stock.crates_in_store += sale.quantity_in_crates
            
            db.session.delete(sale)
            db.session.commit()
            return jsonify({"message": "Deleted Successfully"})
        
    @app.route("/stock", methods=["GET"])
    def get_stock():
        stock = Stock.query.all()
        if not stock:
            return jsonify([]), 200
        return jsonify([s.to_dict() for s in stock]), 200

    @app.route("/expenses", methods=["POST", "GET"])
    def expenses():
        if request.method == "POST":
            data = request.get_json()
            date_str = data.get("date")

            if date_str:
                try:
                    date = datetime.strptime(date_str, "%Y-%m-%d").date()
                except ValueError:
                    try:
                        date = datetime.strptime(date_str, "%m/%d/%Y").date()
                    except ValueError:
                        return jsonify({"message": "Invalid date format, use YYYY-MM-DD or MM/DD/YYYY"}), 400
            else:
                date = datetime.now(kenya_tz).date()

            category = data.get("category")
            amount_spent = data.get("amount_spent")
            description = data.get("description")

            new_expense = Expenses(
                date=date,
                category=category,
                amount_spent=amount_spent,
                description=description,
            )
            db.session.add(new_expense)
            db.session.commit()
            return jsonify({"message": "Expense added successfully!", "id": new_expense.id}), 201

        elif request.method == "GET":
            expenses = Expenses.query.all()
            if not expenses:
                return jsonify([]), 200
            return jsonify([e.to_dict() for e in expenses]), 200
        
    @app.route("/expenses/graph", methods=["GET"])
    def expense_graph():
        records = Expenses.query.order_by(Expenses.date.desc()).limit(8).all()
        data = []
        for  r in records:
            data.append({
                "date": r.date.strftime("%m/%d"),
                "category": r.category,
                "amount_spent": r.amount_spent
            })
        data.reverse()
        return jsonify(data), 200
        
    @app.route("/expense/<int:id>", methods=["PATCH", "DELETE"])
    @role_required(["admin"])
    def expense(id):
        if request.method == "PATCH":
            data = request.get_json()
            expense_id = data.get("id")

            if not expense_id:
                return jsonify({"message": "Expense ID is required"}), 400

            expense = Expenses.query.get(expense_id)
            if not expense:
                return jsonify({"message": "Expense not found"}), 404

            for field in ["date", "category", "amount_spent", "description"]:
                if field in data:
                    if field == "date" and isinstance(data["date"], str):
                        try:
                            data["date"] = datetime.strptime(data["date"], "%Y-%m-%d").date()
                        except ValueError:
                            try:
                                data["date"] = datetime.strptime(data["date"], "%m/%d/%Y").date()
                            except ValueError:
                                return jsonify({"message": "Invalid date format. Use YYYY-MM-DD."}), 400
                                                            
                    setattr(expense, field, data[field])

            db.session.commit()
            return jsonify({"message": "Expense updated successfully!"}), 200

        elif request.method == "DELETE":
            data = request.get_json()
            expense_id = data.get("id")

            if not expense_id:
                return jsonify({"message": "Expense ID is required"}), 400

            expense = db.session.get(Expenses, expense_id)
            if not expense:
                return jsonify({"message": f"No expense found with id {expense_id}"}), 404

            db.session.delete(expense)
            db.session.commit()
            return jsonify({"message": f"Expense with id {expense_id} deleted successfully!"}), 200
        
    @app.route("/vaccinationinfo", methods=["POST", "GET"])
    def vaccinationinfo():
        if request.method == "POST":
            data = request.get_json()
            batch_id = data.get("batch_id")
            date_str = data.get("date")
            if date_str:
                try:
                    date = datetime.strptime(date_str, "%Y-%m-%d").date()
                except ValueError:
                    try:
                        date = datetime.strptime(date_str, "%m/%d/%Y").date()
                    except ValueError:
                        return jsonify({"message": "Invalid date format, use MM/DD/YYYY"}), 400
            else:
                date = datetime.now(kenya_tz).date()
                
            drug_administered = data.get("drug_administered")
            veterinary_name = data.get("veterinary_name")
            comments = data.get("comments")
            
            new_vacc = VaccinationInfo(
                batch_id=batch_id,
                date=date,
                drug_administered=drug_administered,
                veterinary_name=veterinary_name,
                comments=comments
            )
            db.session.add(new_vacc)
            db.session.commit()
            return jsonify({"message": "New vaccination data added!"}), 201
        
        elif request.method == "GET":
            vaccination = VaccinationInfo.query.all()
            if not vaccination:
                return jsonify([]), 200
            return jsonify([v.to_dict() for v in vaccination]), 200
        
    @app.route("/vaccination/<int:id>", methods=["PATCH", "DELETE"])
    def vaccination(id):
        data = request.get_json(silent=True) or {}
        vaccine = db.session.get(VaccinationInfo, id)
        if not vaccine:
            return jsonify({"message": "Vaccination info not found!"})
        
        if request.method == "PATCH":
            for field in ["batch_id", "date", "drug_administered", "veterinary_name", "comments"]:
                if field in data:
                    if field == "date" and isinstance(data["date"], str):
                        try:
                            data["date"] = datetime.strptime(data["date"], "%Y-%m-%d").date()
                        except ValueError:
                            try:
                                data["date"] = datetime.strptime(data["date"], "%m/%d/%Y").date()
                            except ValueError:
                                return jsonify({"message": "Invalid date format. Use YYYY-MM-DD."}), 400
                            
                    setattr(vaccine, field, data[field]) 
                    
            db.session.commit()
            return jsonify({"message": "Vaccination info updated successfully!"}), 200
        
        elif request.method == "DELETE":
            db.session.delete(vaccine)
            db.session.commit()
            
            return jsonify({"message": "Vaccination info deleted successfully!"}), 200
            
    @app.route("/employeedata", methods=["POST", "GET"])
    def employeedata():
        if request.method == "POST":
            data = request.get_json()
            name = data.get("name")
            phone_number = data.get("phone_number")
            email = data.get("email")
            role = data.get("role")
            salary = data.get("salary")

            existing = EmployeeData.query.filter_by(name=name).first()
            if existing:
                return jsonify({"message": "Employee already exists"}), 400

            new_employee = EmployeeData(
                name=name,
                phone_number=phone_number,
                email=email,
                role=role,
                salary=salary,
            )
            db.session.add(new_employee)
            db.session.commit()
            return jsonify({"message": "Employee added successfully!"}), 201

        elif request.method == "GET":
            employees = EmployeeData.query.all()
            if not employees:
                return jsonify([]), 200
            return jsonify([e.to_dict() for e in employees]), 200
        
    @app.route("/employeeinfo/<int:id>", methods=["PATCH", "DELETE"])
    def employeeinfo(id):
        if request.method == "PATCH":
            data = request.get_json()
            emp_id = data.get("id")

            if not emp_id:
                return jsonify({"message": "Employee ID required"}), 400

            employee = db.session.get(EmployeeData, id)
            if not employee:
                return jsonify({"message": "Employee not found"}), 404

            for field in ["name", "phone_number", "email", "role", "salary"]:
                if field in data:
                    setattr(employee, field, data[field])

            db.session.commit()
            return jsonify({"message": "Employee updated successfully!"}), 200
        
        elif request.method == "DELETE":
            data = request.get_json()
            emp_id = data.get("id")
            
            if not emp_id:
                return jsonify({"message": "Enter ID!"}), 400
            
            employee = EmployeeData.query.get(emp_id)
            if not employee:
                return jsonify({"message": "No eployee with that id"})
            
            db.session.delete(employee)
            db.session.commit()
            return jsonify({"Employee deleted successfully"})

    @app.route("/profits", methods=["POST"])
    def calculate_and_store_profit():
        data = request.get_json()
        start_date = data.get("start_date")
        end_date = data.get("end_date")
        include_salaries = data.get("include_salaries", True)
        include_expenses = data.get("include_expenses", True)
        include_transport = data.get("include_transport", True)
        
        if not start_date or not end_date:
            return jsonify({"error": "start_date and end_date are required"}), 400
        
        result = generate_profit_record(
            start_date,
            end_date,
            include_salaries=include_salaries,
            include_expenses=include_expenses,
            include_transport=include_transport,
            save_to_db=False
        )
        
        return jsonify(result), 201
    
    @app.route("/forgot-password", methods=["POST"])
    def forgot_password():
        data = request.get_json()
        email = data.get("email")
        
        if not email:
            return jsonify({"message" : "Email is required!"}), 400
        
        user = User.query.filter_by(email=email).first()
        if not user: 
            return jsonify({"message": "No user with that email!"}), 404
        
        reset_code = random.randint(100000, 999999)
        expiry_time = datetime.now(timezone.utc) + timedelta(minutes=10)
        reset_codes[email] = {"code": reset_code, "expires": expiry_time}
        
        try:
            msg = Message(
                subject="Password Reset code - Golden Yolk",
                recipients=[email],
                body=f"Hello {user.username},\n\nYour password reset code is: {reset_code}\n\nThis code will expire in 10 minutes.\n\nGolden Yolk 🐣"           
            )
            mail.send(msg)
            return jsonify({"message": "Reset code sent to your email."}), 200
        except Exception as e:
            print(f"Email sending failed: {e}")
            return jsonify({"message": "Failed to send email, please reenter your email or ensure your email is valid"}), 500
        
    @app.route("/reset-password", methods=["POST"])
    def reset_password():
        data = request.get_json()
        email = data.get("email")
        code = data.get("code")
        new_password = data.get("new_password")
        
        if not all([email, code, new_password]):
            return ({"message": "Please enter all the needed details: email, code and new password"})
        
        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({"message": "User not found"}), 404

        if email not in reset_codes:
            return jsonify({"message": "No reset request found for this email"}), 400

        reset_info = reset_codes[email]

        if str(reset_info["code"]) != str(code):
            return jsonify({"message": "Invalid reset code"}), 400


        if datetime.now(timezone.utc) > reset_info["expires"]:
            del reset_codes[email]
            return jsonify({"message": "Reset code expired"}), 400

        user.password = bcrypt.generate_password_hash(new_password).decode("utf-8")
        db.session.commit()


        del reset_codes[email]

        return jsonify({"message": "Password has been reset successfully"}), 200
    
    @app.route("/eggproduction/chartdata", methods=["GET"])
    def eggproduction_chart():
        records = EggProduction.query.order_by(EggProduction.date.desc()).limit(8).all()
        
        data = [] 
        for r in records:
            data.append({
                "date": r.date.strftime("%m/%d"),
                "eggs": r.eggs_collected,
                "broken": r.broken_eggs,
            })
        data.reverse()
        return jsonify(data), 200
    
    @app.route("/sales/graph", methods=["GET"])
    def sales_graph():
        records = Sales.query.order_by(Sales.date.desc()).limit(8).all()
        data = []
        for r in records:
            data.append({
                "date": r.date.strftime("%m/%d"),
                "quantity in crates": r.quantity_in_crates
            })
        data.reverse()
        return jsonify(data), 200
    
    @app.route("/batch/<int:batch_id>/population_graph", methods=["GET"])
    def population_graph(batch_id):
        batch = Batch.query.get_or_404(batch_id)

        acquisition = batch.acquisition_date
        today = date.today()

        data = [
            {
                "date": acquisition.strftime("%Y-%m-%d"),
                "birds": batch.initial_number
            },
            {
                "date": today.strftime("%Y-%m-%d"),
                "birds": batch.current_number
            }
        ]

        return jsonify(data), 200
    
    @app.route("/batches", methods=["GET"])
    def get_batches():
        batches = Batch.query.all()
        return jsonify([
            {
                "id": batch.id,
                "name": batch.batch_name
            } for batch in batches
    ])
        
    @app.route("/vaccination/upcoming", methods=["GET"])
    def get_upcoming_vaccinations():
        today = datetime.today().date()
        
        schedules = schedules = VaccinationSchedule.query.filter(VaccinationSchedule.vaccination_date >= today).order_by(VaccinationSchedule.vaccination_date).all()
        
        return jsonify([s.to_dict() for s in schedules]), 200
    
    @app.route("/batch/<int:batch_id>/vaccinations", methods=["GET"])
    def get_batch_vaccinations(batch_id):
        schedules = VaccinationSchedule.query.filter_by(batch_id=batch_id).all()
        return jsonify([s.to_dict() for s in schedules]), 200
    
    @app.route("/vaccination/add", methods=["POST"])
    def add_vaccination():
        data = request.get_json()
        new = VaccinationSchedule(
            batch_id=data['batch_id'],
            vaccination_name=data['vaccination_name'],
            vaccination_date=datetime.strptime(data['vaccination_date'], "%Y-%m-%d").date()
        )
        db.session.add(new)
        db.session.commit()
        return jsonify({"message": "Vacination schedule added!"}), 201
    
    @app.route("/vaccination/clean", methods=["DELETE"])
    def clean_vaccin():
        today = datetime.today().date()
        
        expired = VaccinationSchedule.query.filter(VaccinationSchedule.vaccination_date < today).all()
        
        for e in expired:
            db.session.delete(e)
            
        db.session.commit()
        return jsonify({"message": "Expired Schedules cleaned!"})
    
    @app.route("/feeds/use/<int:feed_id>", methods=["POST"])
    def use_feed(feed_id):
        feed = FeedRecord.query.get_or_404(feed_id)
        
        if feed.sacks_in_storage <= 0:
            return jsonify({"message": "No sacks left!"})
        
        feed.sacks_in_storage -= 1
        feed.sacks_used += 1
        
        db.session.commit()
        
        return jsonify({"message": "Feeds records updated successfully!"}), 200
    
    @app.route("/feeds", methods=["GET"])
    def get_feeds():
        feeds = FeedRecord.query.all()
        return jsonify([
            {
                "id": feed.id,
                "feed_name": feed.feed_name,
                "sacks_in_storage": feed.sacks_in_storage,
                "sacks_used": feed.sacks_used
            } for feed in feeds
        ])
        
    @app.route("/feeds", methods=["POST"])
    def new_feed():
        data = request.get_json()
        feed = FeedRecord(
            feed_name = data.get("feed_name"),
            sacks_in_storage = data.get("sacks_in_storage"),
            sacks_used = 0
        )
        
        db.session.add(feed)
        db.session.commit()
        return jsonify({"message": "New feed added successfully!"}), 201

    @app.route("/feeds/<int:id>", methods=["PATCH", "DELETE"])
    def patch_and_delete(id):
        feed = db.session.get(FeedRecord, id)
        if not feed:
            return jsonify({"message": "No feed of that ID!"}), 404
        
        if request.method == "PATCH":
            data = request.get_json()
            
            for field in ["feed_name", "sacks_in_storage"]:
                if field in data: 
                    setattr(feed, field, data[field])      
            
            db.session.commit()
            return jsonify({"message": "Feed updated successfully"}), 200
        
        if request.method == "DELETE":
            db.session.delete(feed)
            db.session.commit()
            return jsonify({"message": "Feed deleted succesfully!"}), 200
   
    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
