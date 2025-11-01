from datetime import datetime
from extensions import db
from models import Sales, Expenses, EmployeeData, Profit
from sqlalchemy import func

def generate_profit_record(start_date_str, end_date_str, include_salaries=True, include_expenses=True, include_transport=True, save_to_db=True):
    """
    Calculate profits between start_date and end_date.
    Optionally save to DB or just return the calculated values.
    """
    # Convert strings to date
    try:
        start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
        end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()
    except ValueError:
        start_date = datetime.strptime(start_date_str, "%m/%d/%Y").date()
        end_date = datetime.strptime(end_date_str, "%m/%d/%Y").date()

    # Total sales
    total_sales = db.session.query(func.sum(Sales.final_amount))\
        .filter(Sales.date.between(start_date, end_date))\
        .scalar() or 0

    # Total expenses
    total_expenses = db.session.query(func.sum(Expenses.amount_spent))\
        .filter(Expenses.date.between(start_date, end_date))\
        .scalar() if include_expenses else 0
    total_expenses = total_expenses or 0

    # Total salaries
    total_salaries = db.session.query(func.sum(EmployeeData.salary)).scalar() if include_salaries else 0
    total_salaries = total_salaries or 0

    # Transport costs
    total_transport = db.session.query(func.sum(Sales.transport_costs))\
        .filter(Sales.date.between(start_date, end_date))\
        .scalar() if include_transport else 0
    total_transport = total_transport or 0

    # Calculate final profit
    profit_value = total_sales - (total_expenses + total_salaries + total_transport)

    result = {
        "start_date": start_date.strftime("%m/%d/%Y"),
        "end_date": end_date.strftime("%m/%d/%Y"),
        "total_sales": float(total_sales),
        "total_expenses": float(total_expenses + total_transport),
        "total_salaries": float(total_salaries),
        "profit": float(profit_value),
        "include_salaries": include_salaries,
        "include_expenses": include_expenses,
        "include_transport": include_transport
    }

    if save_to_db:
        # Remove previous profit for same date range (optional)
        existing = Profit.query.filter_by(start_date=start_date, end_date=end_date).first()
        if existing:
            db.session.delete(existing)
            db.session.commit()

        profit_record = Profit(
            start_date=start_date,
            end_date=end_date,
            total_sales=total_sales,
            total_expenses=total_expenses + total_transport,
            total_salaries=total_salaries,
            profit=profit_value,
            include_salaries=include_salaries,
            include_expenses=include_expenses,
            include_transport=include_transport
        )
        db.session.add(profit_record)
        db.session.commit()
        return profit_record.to_dict()

    return result
