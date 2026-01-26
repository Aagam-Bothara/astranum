"""
Geocoding Service - Convert place names to coordinates.

Uses OpenStreetMap Nominatim API for geocoding.
Includes fallback for common Indian cities.
"""

import httpx
from typing import Optional, Tuple, Dict
from functools import lru_cache


# Common Indian cities with their coordinates (fallback)
INDIAN_CITIES: Dict[str, Tuple[float, float, str]] = {
    # City name -> (latitude, longitude, timezone)
    "mumbai": (19.0760, 72.8777, "Asia/Kolkata"),
    "delhi": (28.6139, 77.2090, "Asia/Kolkata"),
    "new delhi": (28.6139, 77.2090, "Asia/Kolkata"),
    "bangalore": (12.9716, 77.5946, "Asia/Kolkata"),
    "bengaluru": (12.9716, 77.5946, "Asia/Kolkata"),
    "hyderabad": (17.3850, 78.4867, "Asia/Kolkata"),
    "chennai": (13.0827, 80.2707, "Asia/Kolkata"),
    "kolkata": (22.5726, 88.3639, "Asia/Kolkata"),
    "pune": (18.5204, 73.8567, "Asia/Kolkata"),
    "ahmedabad": (23.0225, 72.5714, "Asia/Kolkata"),
    "jaipur": (26.9124, 75.7873, "Asia/Kolkata"),
    "lucknow": (26.8467, 80.9462, "Asia/Kolkata"),
    "surat": (21.1702, 72.8311, "Asia/Kolkata"),
    "kanpur": (26.4499, 80.3319, "Asia/Kolkata"),
    "nagpur": (21.1458, 79.0882, "Asia/Kolkata"),
    "indore": (22.7196, 75.8577, "Asia/Kolkata"),
    "thane": (19.2183, 72.9781, "Asia/Kolkata"),
    "bhopal": (23.2599, 77.4126, "Asia/Kolkata"),
    "visakhapatnam": (17.6868, 83.2185, "Asia/Kolkata"),
    "patna": (25.5941, 85.1376, "Asia/Kolkata"),
    "vadodara": (22.3072, 73.1812, "Asia/Kolkata"),
    "ghaziabad": (28.6692, 77.4538, "Asia/Kolkata"),
    "ludhiana": (30.9010, 75.8573, "Asia/Kolkata"),
    "agra": (27.1767, 78.0081, "Asia/Kolkata"),
    "nashik": (19.9975, 73.7898, "Asia/Kolkata"),
    "faridabad": (28.4089, 77.3178, "Asia/Kolkata"),
    "meerut": (28.9845, 77.7064, "Asia/Kolkata"),
    "rajkot": (22.3039, 70.8022, "Asia/Kolkata"),
    "varanasi": (25.3176, 82.9739, "Asia/Kolkata"),
    "srinagar": (34.0837, 74.7973, "Asia/Kolkata"),
    "aurangabad": (19.8762, 75.3433, "Asia/Kolkata"),
    "dhanbad": (23.7957, 86.4304, "Asia/Kolkata"),
    "amritsar": (31.6340, 74.8723, "Asia/Kolkata"),
    "navi mumbai": (19.0330, 73.0297, "Asia/Kolkata"),
    "allahabad": (25.4358, 81.8463, "Asia/Kolkata"),
    "prayagraj": (25.4358, 81.8463, "Asia/Kolkata"),
    "ranchi": (23.3441, 85.3096, "Asia/Kolkata"),
    "howrah": (22.5958, 88.2636, "Asia/Kolkata"),
    "coimbatore": (11.0168, 76.9558, "Asia/Kolkata"),
    "jabalpur": (23.1815, 79.9864, "Asia/Kolkata"),
    "gwalior": (26.2183, 78.1828, "Asia/Kolkata"),
    "vijayawada": (16.5062, 80.6480, "Asia/Kolkata"),
    "jodhpur": (26.2389, 73.0243, "Asia/Kolkata"),
    "madurai": (9.9252, 78.1198, "Asia/Kolkata"),
    "raipur": (21.2514, 81.6296, "Asia/Kolkata"),
    "kota": (25.2138, 75.8648, "Asia/Kolkata"),
    "chandigarh": (30.7333, 76.7794, "Asia/Kolkata"),
    "guwahati": (26.1445, 91.7362, "Asia/Kolkata"),
    "solapur": (17.6599, 75.9064, "Asia/Kolkata"),
    "hubli": (15.3647, 75.1240, "Asia/Kolkata"),
    "mysore": (12.2958, 76.6394, "Asia/Kolkata"),
    "mysuru": (12.2958, 76.6394, "Asia/Kolkata"),
    "tiruchirappalli": (10.7905, 78.7047, "Asia/Kolkata"),
    "bareilly": (28.3670, 79.4304, "Asia/Kolkata"),
    "aligarh": (27.8974, 78.0880, "Asia/Kolkata"),
    "tiruppur": (11.1085, 77.3411, "Asia/Kolkata"),
    "moradabad": (28.8389, 78.7768, "Asia/Kolkata"),
    "jalandhar": (31.3260, 75.5762, "Asia/Kolkata"),
    "bhubaneswar": (20.2961, 85.8245, "Asia/Kolkata"),
    "salem": (11.6643, 78.1460, "Asia/Kolkata"),
    "warangal": (17.9784, 79.5941, "Asia/Kolkata"),
    "guntur": (16.3067, 80.4365, "Asia/Kolkata"),
    "bhiwandi": (19.2967, 73.0631, "Asia/Kolkata"),
    "saharanpur": (29.9680, 77.5510, "Asia/Kolkata"),
    "gorakhpur": (26.7606, 83.3732, "Asia/Kolkata"),
    "bikaner": (28.0229, 73.3119, "Asia/Kolkata"),
    "amravati": (20.9320, 77.7523, "Asia/Kolkata"),
    "noida": (28.5355, 77.3910, "Asia/Kolkata"),
    "jamshedpur": (22.8046, 86.2029, "Asia/Kolkata"),
    "bhilai": (21.2094, 81.4285, "Asia/Kolkata"),
    "cuttack": (20.4625, 85.8828, "Asia/Kolkata"),
    "firozabad": (27.1591, 78.3957, "Asia/Kolkata"),
    "kochi": (9.9312, 76.2673, "Asia/Kolkata"),
    "cochin": (9.9312, 76.2673, "Asia/Kolkata"),
    "nellore": (14.4426, 79.9865, "Asia/Kolkata"),
    "bhavnagar": (21.7645, 72.1519, "Asia/Kolkata"),
    "dehradun": (30.3165, 78.0322, "Asia/Kolkata"),
    "durgapur": (23.5204, 87.3119, "Asia/Kolkata"),
    "asansol": (23.6739, 86.9524, "Asia/Kolkata"),
    "nanded": (19.1383, 77.3210, "Asia/Kolkata"),
    "kolhapur": (16.7050, 74.2433, "Asia/Kolkata"),
    "ajmer": (26.4499, 74.6399, "Asia/Kolkata"),
    "gulbarga": (17.3297, 76.8343, "Asia/Kolkata"),
    "jamnagar": (22.4707, 70.0577, "Asia/Kolkata"),
    "ujjain": (23.1765, 75.7885, "Asia/Kolkata"),
    "loni": (28.7520, 77.2780, "Asia/Kolkata"),
    "siliguri": (26.7271, 88.6393, "Asia/Kolkata"),
    "jhansi": (25.4484, 78.5685, "Asia/Kolkata"),
    "ulhasnagar": (19.2183, 73.1631, "Asia/Kolkata"),
    # International cities
    "new york": (40.7128, -74.0060, "America/New_York"),
    "los angeles": (34.0522, -118.2437, "America/Los_Angeles"),
    "london": (51.5074, -0.1278, "Europe/London"),
    "paris": (48.8566, 2.3522, "Europe/Paris"),
    "tokyo": (35.6762, 139.6503, "Asia/Tokyo"),
    "sydney": (-33.8688, 151.2093, "Australia/Sydney"),
    "dubai": (25.2048, 55.2708, "Asia/Dubai"),
    "singapore": (1.3521, 103.8198, "Asia/Singapore"),
    "toronto": (43.6532, -79.3832, "America/Toronto"),
    "san francisco": (37.7749, -122.4194, "America/Los_Angeles"),
}


class GeocodingService:
    """Service for converting place names to coordinates."""

    NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"

    @classmethod
    async def geocode(cls, place_name: str) -> Optional[Tuple[float, float, str]]:
        """
        Convert a place name to coordinates.

        Args:
            place_name: Place name string (e.g., "Mumbai, India")

        Returns:
            Tuple of (latitude, longitude, timezone) or None if not found
        """
        if not place_name:
            return None

        # Normalize place name
        normalized = place_name.lower().strip()

        # Try fallback first for common cities
        result = cls._check_fallback(normalized)
        if result:
            return result

        # Try Nominatim API
        try:
            result = await cls._geocode_nominatim(place_name)
            if result:
                return result
        except Exception:
            pass

        return None

    @classmethod
    def geocode_sync(cls, place_name: str) -> Optional[Tuple[float, float, str]]:
        """
        Synchronous version of geocode for use in sync contexts.
        Only uses fallback data, doesn't call external APIs.
        """
        if not place_name:
            return None

        normalized = place_name.lower().strip()
        return cls._check_fallback(normalized)

    @classmethod
    def _check_fallback(cls, normalized_place: str) -> Optional[Tuple[float, float, str]]:
        """Check fallback dictionary for coordinates."""
        # Direct match
        if normalized_place in INDIAN_CITIES:
            return INDIAN_CITIES[normalized_place]

        # Check if any city name is contained in the place string
        for city, coords in INDIAN_CITIES.items():
            if city in normalized_place:
                return coords

        return None

    @classmethod
    async def _geocode_nominatim(cls, place_name: str) -> Optional[Tuple[float, float, str]]:
        """Use Nominatim API for geocoding."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                cls.NOMINATIM_URL,
                params={
                    "q": place_name,
                    "format": "json",
                    "limit": 1,
                },
                headers={
                    "User-Agent": "AstraVaani/1.0 (spiritual guidance app)",
                },
                timeout=5.0,
            )

            if response.status_code != 200:
                return None

            results = response.json()
            if not results:
                return None

            lat = float(results[0]["lat"])
            lon = float(results[0]["lon"])

            # Determine timezone based on location (simplified)
            timezone = cls._get_timezone_for_location(lat, lon)

            return (lat, lon, timezone)

    @classmethod
    def _get_timezone_for_location(cls, lat: float, lon: float) -> str:
        """
        Estimate timezone based on longitude.
        This is a simplified approximation.
        """
        # India (68-97 longitude)
        if 68 <= lon <= 97 and 6 <= lat <= 37:
            return "Asia/Kolkata"

        # Rough estimation based on longitude
        if 120 <= lon <= 150:  # East Asia/Australia
            if lat > 0:
                return "Asia/Tokyo"
            else:
                return "Australia/Sydney"
        elif 100 <= lon < 120:  # Southeast Asia
            return "Asia/Singapore"
        elif 50 <= lon < 68:  # Middle East
            return "Asia/Dubai"
        elif 0 <= lon < 50:  # Europe/Africa
            return "Europe/London"
        elif -130 <= lon < -60:  # Americas
            if lat > 35:
                return "America/New_York"
            else:
                return "America/Los_Angeles"

        return "UTC"


def get_timezone_offset(timezone: str) -> float:
    """Get timezone offset in hours from UTC."""
    # Common timezone offsets
    offsets = {
        "Asia/Kolkata": 5.5,
        "Asia/Tokyo": 9,
        "Asia/Singapore": 8,
        "Asia/Dubai": 4,
        "Europe/London": 0,
        "Europe/Paris": 1,
        "America/New_York": -5,
        "America/Los_Angeles": -8,
        "America/Toronto": -5,
        "Australia/Sydney": 11,
        "UTC": 0,
    }
    return offsets.get(timezone, 0)
