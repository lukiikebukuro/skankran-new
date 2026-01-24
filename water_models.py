# water_models.py - PostgreSQL Models dla Danych Wodnych
# Import: from water_models import define_water_models

from datetime import datetime
from sqlalchemy import Index, UniqueConstraint, CheckConstraint
from sqlalchemy.dialects.postgresql import JSON
import json


def define_water_models(db):
    """
    Definiuje modele bazy danych dla systemu Skankran.
    Wywołaj to z app.py po utworzeniu instancji SQLAlchemy.
    
    Args:
        db: Instancja Flask-SQLAlchemy
    
    Returns:
        dict: Słownik z klasami modeli
    """
    
    class City(db.Model):
        """Miasto z danymi o wodzie"""
        __tablename__ = 'cities'
        
        id = db.Column(db.Integer, primary_key=True)
        name = db.Column(db.String(100), unique=True, nullable=False, index=True)
        info = db.Column(db.Text)
        fun_facts = db.Column(JSON)
        created_at = db.Column(db.DateTime, default=datetime.utcnow)
        updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
        
        # Relacje
        stations = db.relationship('Station', back_populates='city', lazy='dynamic', cascade='all, delete-orphan')
        measurement_points = db.relationship('MeasurementPoint', back_populates='city', lazy='dynamic', cascade='all, delete-orphan')
        zones = db.relationship('CityZone', back_populates='city', lazy='dynamic', cascade='all, delete-orphan')
        averages = db.relationship('CityAverage', back_populates='city', uselist=False, cascade='all, delete-orphan')
        
        def __repr__(self):
            return f'<City {self.name}>'
        
        def to_dict(self):
            return {
                'name': self.name,
                'info': self.info,
                'fun_facts': self.fun_facts,
                'average': self.averages.to_dict() if self.averages else {},
                'stations': [s.to_dict() for s in self.stations],
                'measurementPoints': [mp.to_dict() for mp in self.measurement_points],
                'zones': {z.zone_name: z.station_name for z in self.zones}
            }
    
    
    class Station(db.Model):
        """Stacja Uzdatniania Wody (SUW)"""
        __tablename__ = 'stations'
        
        id = db.Column(db.Integer, primary_key=True)
        city_id = db.Column(db.Integer, db.ForeignKey('cities.id'), nullable=False, index=True)
        name = db.Column(db.String(200), nullable=False)
        address = db.Column(db.String(300))
        latitude = db.Column(db.Float, nullable=False)
        longitude = db.Column(db.Float, nullable=False)
        created_at = db.Column(db.DateTime, default=datetime.utcnow)
        updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
        
        city = db.relationship('City', back_populates='stations')
        measurements = db.relationship('WaterMeasurement', back_populates='station', lazy='dynamic', cascade='all, delete-orphan')
        
        __table_args__ = (
            UniqueConstraint('city_id', 'name', name='uq_city_station_name'),
            Index('idx_station_coords', 'latitude', 'longitude'),
        )
        
        def get_latest_measurements(self):
            latest = {}
            for measurement in self.measurements.order_by(WaterMeasurement.measurement_date.desc()):
                if measurement.parameter not in latest:
                    latest[measurement.parameter] = measurement
            return latest
        
        def to_dict(self, include_measurements=True):
            result = {
                'name': self.name,
                'coords': [self.latitude, self.longitude],
                'address': self.address,
            }
            if include_measurements:
                measurements = self.get_latest_measurements()
                
                # If station has no measurements, use city averages as fallback
                if not measurements and self.city and self.city.averages:
                    city_avg = self.city.averages.to_dict()
                    result['data'] = city_avg
                else:
                    result['data'] = {param: meas.format_value() for param, meas in measurements.items()}
                
                result['history'] = []
            return result

    
    
    class MeasurementPoint(db.Model):
        """Punkt pomiarowy (nie SUW)"""
        __tablename__ = 'measurement_points'
        
        id = db.Column(db.Integer, primary_key=True)
        city_id = db.Column(db.Integer, db.ForeignKey('cities.id'), nullable=False, index=True)
        name = db.Column(db.String(200), nullable=False)
        address = db.Column(db.String(300))
        latitude = db.Column(db.Float, nullable=False)
        longitude = db.Column(db.Float, nullable=False)
        created_at = db.Column(db.DateTime, default=datetime.utcnow)
        updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
        
        city = db.relationship('City', back_populates='measurement_points')
        measurements = db.relationship('WaterMeasurement', back_populates='measurement_point', lazy='dynamic', cascade='all, delete-orphan')
        
        __table_args__ = (UniqueConstraint('city_id', 'name', name='uq_city_point_name'),)
        
        def get_latest_measurements(self):
            latest = {}
            for measurement in self.measurements.order_by(WaterMeasurement.measurement_date.desc()):
                if measurement.parameter not in latest:
                    latest[measurement.parameter] = measurement
            return latest
        
        def to_dict(self):
            measurements = self.get_latest_measurements()
            return {
                'name': self.name,
                'coords': [self.latitude, self.longitude],
                'address': self.address,
                'data': {param: meas.format_value() for param, meas in measurements.items()}
            }
    
    
    class WaterMeasurement(db.Model):
        """Pomiar parametru wody - NULL = brak, 0.0001 = zero (Poznań hack)"""
        __tablename__ = 'water_measurements'
        
        id = db.Column(db.Integer, primary_key=True)
        station_id = db.Column(db.Integer, db.ForeignKey('stations.id'), nullable=True, index=True)
        measurement_point_id = db.Column(db.Integer, db.ForeignKey('measurement_points.id'), nullable=True, index=True)
        parameter = db.Column(db.String(50), nullable=False, index=True)
        value = db.Column(db.Float, nullable=True)
        unit = db.Column(db.String(20), nullable=False)
        measurement_date = db.Column(db.Date, nullable=False, index=True)
        below_detection_limit = db.Column(db.Boolean, default=False)
        created_at = db.Column(db.DateTime, default=datetime.utcnow)
        
        station = db.relationship('Station', back_populates='measurements')
        measurement_point = db.relationship('MeasurementPoint', back_populates='measurements')
        
        __table_args__ = (
            CheckConstraint('(station_id IS NOT NULL AND measurement_point_id IS NULL) OR (station_id IS NULL AND measurement_point_id IS NOT NULL)', 
                           name='chk_measurement_source'),
            Index('idx_measurement_date_param', 'measurement_date', 'parameter'),
        )
        
        def format_value(self):
            if self.value is None:
                return "Brak danych"
            if self.below_detection_limit:
                return f"<{self.value}"
            return str(self.value)
    
    
    class CityZone(db.Model):
        """Dzielnica miasta przypisana do SUW"""
        __tablename__ = 'city_zones'
        
        id = db.Column(db.Integer, primary_key=True)
        city_id = db.Column(db.Integer, db.ForeignKey('cities.id'), nullable=False, index=True)
        zone_name = db.Column(db.String(200), nullable=False)
        station_name = db.Column(db.String(200), nullable=False)
        
        city = db.relationship('City', back_populates='zones')
        
        __table_args__ = (UniqueConstraint('city_id', 'zone_name', name='uq_city_zone'),)
    
    
    class CityAverage(db.Model):
        """Średnie wartości parametrów dla miasta"""
        __tablename__ = 'city_averages'
        
        id = db.Column(db.Integer, primary_key=True)
        city_id = db.Column(db.Integer, db.ForeignKey('cities.id'), unique=True, nullable=False, index=True)
        
        # Parametry (wszystkie nullable dla elastyczności)
        pH = db.Column(db.Float, nullable=True)
        twardosc = db.Column(db.Float, nullable=True)
        azotany = db.Column(db.Float, nullable=True)
        zelazo = db.Column(db.Float, nullable=True)
        fluorki = db.Column(db.Float, nullable=True)
        chlor = db.Column(db.Float, nullable=True)
        chlorki = db.Column(db.Float, nullable=True)
        siarczany = db.Column(db.Float, nullable=True)
        potas = db.Column(db.Float, nullable=True)
        magnez = db.Column(db.Float, nullable=True)
        metnosc = db.Column(db.Float, nullable=True)
        barwa = db.Column(db.Float, nullable=True)
        mangan = db.Column(db.Float, nullable=True)
        olow = db.Column(db.Float, nullable=True)
        rtec = db.Column(db.Float, nullable=True)
        
        updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
        
        city = db.relationship('City', back_populates='averages')
        
        def to_dict(self):
            return {
                'pH': self.pH if self.pH is not None else 0,
                'twardosc': self.twardosc if self.twardosc is not None else 0,
                'azotany': self.azotany if self.azotany is not None else 0,
                'zelazo': self.zelazo if self.zelazo is not None else 0,
                'fluorki': self.fluorki if self.fluorki is not None else 0,
                'chlor': self.chlor if self.chlor is not None else 0,
                'chlorki': self.chlorki if self.chlorki is not None else 0,
                'siarczany': self.siarczany if self.siarczany is not None else 0,
                'potas': self.potas if self.potas is not None else 0,
                'metnosc': self.metnosc if self.metnosc is not None else 0,
                'barwa': self.barwa if self.barwa is not None else 0,
                'mangan': self.mangan if self.mangan is not None else 0,
                'magnez': self.magnez if self.magnez is not None else 0,
                'olow': self.olow if self.olow is not None else 0,
                'rtec': self.rtec if self.rtec is not None else 0,
            }
    
    
    # Helper functions
    def get_water_data_from_db():
        """Pobiera dane w formacie waterAnalysis.json"""
        try:
            cities = City.query.all()
            return {city.name: city.to_dict() for city in cities}
        except Exception as e:
            print(f"[ERROR] Failed to load water data from database: {e}")
            return {}
    
    
    def get_city_averages_from_db():
        """Pobiera średnie w formacie averages.json"""
        try:
            cities = City.query.all()
            result = {}
            for city in cities:
                if city.averages:
                    result[city.name] = city.averages.to_dict()
            return result
        except Exception as e:
            print(f"[ERROR] Failed to load city averages from database: {e}")
            return {}
    
    
    def get_city_water_data(city_name):
        """
        Pobiera dane dla pojedynczego miasta (case-insensitive).
        
        Args:
            city_name: Nazwa miasta (np. 'Grudziądz', 'grudziądz')
        
        Returns:
            dict: Dane miasta w formacie to_dict() lub None jeśli nie znaleziono
        """
        try:
            # Case-insensitive search
            city = City.query.filter(City.name.ilike(city_name)).first()
            if city:
                return city.to_dict()
            return None
        except Exception as e:
            print(f"[ERROR] Failed to load city '{city_name}' from database: {e}")
            return None

    
    
    # Zwróć wszystkie klasy
    return {
        'City': City,
        'Station': Station,
        'MeasurementPoint': MeasurementPoint,
        'WaterMeasurement': WaterMeasurement,
        'CityZone': CityZone,
        'CityAverage': CityAverage,
        'get_water_data_from_db': get_water_data_from_db,
        'get_city_averages_from_db': get_city_averages_from_db,
        'get_city_water_data': get_city_water_data
    }
