from extensions import db
from datetime import datetime

class User(db.Model):
    __tablename__ = "user"

    id = db.Column(db.Integer, primary_key=True)
    role = db.Column(db.String, default='user')
    username = db.Column(db.String, nullable=False)
    email = db.Column(db.String, nullable=False)
    phone_number = db.Column(db.String, nullable=False)
    password = db.Column(db.String, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'role': self.role,
            'username': self.username,
            'email': self.email,
            'phone_number': self.phone_number,
            'password': self.password
        }


class Batch(db.Model):
    __tablename__ = "batch"

    id = db.Column(db.Integer, primary_key=True)
    batch_name = db.Column(db.String, nullable=False)
    breed = db.Column(db.String, nullable=False)
    acquisition_date = db.Column(db.Date, nullable=False)
    initial_number = db.Column(db.Integer, nullable=False)
    current_number = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String, nullable=False, default="Active")

    egg_productions = db.relationship("EggProduction", back_populates="batch", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'batch_name': self.batch_name,
            'breed': self.breed,
            'acquisition_date': self.acquisition_date.strftime("%Y-%m-%d") if self.acquisition_date else None,
            'initial_number': self.initial_number,
            'current_number': self.current_number,
            'status': self.status,
        }


class EggProduction(db.Model):
    __tablename__ = "egg_production"

    id = db.Column(db.Integer, primary_key=True)
    batch_id = db.Column(db.Integer, db.ForeignKey("batch.id", name="fk_batch_id"), nullable=False)
    date = db.Column(db.Date, nullable=False)
    eggs_collected = db.Column(db.Integer, nullable=False)
    broken_eggs = db.Column(db.Integer, nullable=False)
    remaining_eggs = db.Column(db.Integer, nullable=False)
    quantity_in_crates = db.Column(db.Integer, nullable=False)
    remarks = db.Column(db.String, nullable=False)
    extra_eggs = db.Column(db.Integer, nullable=False, default=0)  

    batch = db.relationship("Batch", back_populates="egg_productions")

    def to_dict(self):
        return {
            'id': self.id,
            'batch_id': self.batch_id,
            'date': self.date.strftime("%m/%d/%Y") if self.date else None,
            'eggs_collected': self.eggs_collected,
            'broken_eggs': self.broken_eggs,
            'remaining_eggs': self.remaining_eggs,
            'quantity_in_crates': self.quantity_in_crates,
            'remarks': self.remarks,
            'extra_eggs': self.extra_eggs
        }
        
class Stock(db.Model):
    __tablename__ = "stock"
    
    id = db.Column(db.Integer, primary_key=True)
    crates_in_store = db.Column(db.Integer, nullable = False, default = 0)
    
    def to_dict(self):
        return {
            'id': self.id,
            'crates_in_store': self.crates_in_store
        }

class Sales(db.Model):
    __tablename__ = "sales"

    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False)
    buyer_name = db.Column(db.String, nullable=False)
    quantity_in_crates = db.Column(db.Integer, nullable=False)
    price_per_tray = db.Column(db.Numeric(12, 2), nullable=False)
    transport_costs = db.Column(db.Numeric(12, 2), nullable=False)
    selling_price = db.Column(db.Numeric(12, 2), nullable=False)
    final_amount = db.Column(db.Numeric(12, 2), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date.strftime("%m/%d/%Y") if self.date else None,
            'buyer_name': self.buyer_name,
            'quantity_in_crates': self.quantity_in_crates,
            'price_per_tray': float(self.price_per_tray),
            'transport_costs': float(self.transport_costs),
            'selling_price': float(self.selling_price),
            'final_amount': float(self.final_amount)
        }


class Expenses(db.Model):
    __tablename__ = "expenses"

    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False)
    category = db.Column(db.String, nullable=False)
    amount_spent = db.Column(db.Numeric(12, 2), nullable=False)
    description = db.Column(db.String, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date.strftime("%Y-%m-%d") if self.date else None,
            'category': self.category,
            'amount_spent': self.amount_spent,
            'description': self.description
        }


class EmployeeData(db.Model): 
    __tablename__ = "employee_data"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    phone_number = db.Column(db.String, nullable=False)
    email = db.Column(db.String, nullable=False)
    role = db.Column(db.String, nullable=False)
    salary = db.Column(db.Numeric(12, 2), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'phone_number': self.phone_number,
            'email': self.email,
            'role': self.role,
            'salary': self.salary
        }
        
class VaccinationInfo(db.Model):
    __tablename__ = "Vaccination_data"
    
    id = db.Column(db.Integer, primary_key=True)
    batch_id = db.Column(db.Integer, db.ForeignKey("batch.id", name="fk_batch_id"), nullable=False)
    date = db.Column(db.Date, nullable=False)
    drug_administered = db.Column(db.String, nullable=False)
    veterinary_name = db.Column(db.String, nullable=False)
    comments = db.Column(db.String, nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'batch_id': self.batch_id,
            'date': self.date.strftime("%Y-%m-%d") if self.date else None,
            'drug_administered': self.drug_administered,
            'veterinary_name': self.veterinary_name,
            'comments': self.comments
        }
    
class VaccinationSchedule(db.Model):
    __tablename__ = "Vaccination_Schedule"
    
    id = db.Column(db.Integer, primary_key=True)
    batch_id = db.Column(db.Integer, db.ForeignKey("batch.id"), nullable=False)
    vaccination_name = db.Column(db.String, nullable=False)
    vaccination_date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.Date, default=datetime.utcnow)

    batch = db.relationship("Batch", backref="vaccination_schedules")

    def to_dict(self):
        return {
            "id": self.id,
            "batch_id": self.batch_id,
            "batch_name": self.batch.batch_name,
            "vaccination_name": self.vaccination_name,
            "vaccination_date": self.vaccination_date.strftime("%Y-%m-%d")
        }
        
class FeedRecord(db.Model):
    __tablename__ = "Feed_records"
    
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    feed_name = db.Column(db.String, nullable=False)  
    sacks_in_storage = db.Column(db.Integer, nullable=False)
    sacks_used = db.Column(db.Integer, default = 0)
    
    def to_dict(self):
        return {
            "id": self.id,
            "feed_name": self.feed_name,
            "sacks_in_storage": self.sacks_in_storage,
            "sacks_used": self.sacks_used
        }       
        
        
class Profit(db.Model):
    __tablename__ = "profit"

    id = db.Column(db.Integer, primary_key=True)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    total_sales = db.Column(db.Numeric(12, 2), nullable=False)
    total_expenses = db.Column(db.Numeric(12, 2), nullable=False)
    total_salaries = db.Column(db.Numeric(12, 2), nullable=False)
    profit = db.Column(db.Numeric(12, 2), nullable=False)

    include_salaries = db.Column(db.Boolean, default=True)
    include_expenses = db.Column(db.Boolean, default=True)
    include_transport = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            'id': self.id,
            'start_date': self.start_date.strftime("%m/%d/%Y") if self.start_date else None,
            'end_date': self.end_date.strftime("%m/%d/%Y") if self.end_date else None,
            'total_sales': float(self.total_sales),
            'total_expenses': float(self.total_expenses),
            'total_salaries': float(self.total_salaries),
            'profit': float(self.profit),
            'include_salaries': self.include_salaries,
            'include_expenses': self.include_expenses,
            'include_transport': self.include_transport
        }