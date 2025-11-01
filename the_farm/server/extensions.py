from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate
from flask_mail import Mail

mail = Mail()
db = SQLAlchemy()
bcrypt = Bcrypt()
migrate = Migrate()