"""Tests for Numerology Engine - Golden chart tests."""

from datetime import date
import pytest

from app.engines.numerology import NumerologyEngine


class TestLifePathCalculation:
    """Test Life Path number calculations with master number preservation."""

    def test_basic_life_path(self):
        """Test basic Life Path calculation."""
        # January 1, 2000
        # Day: 1, Month: 1, Year: 2+0+0+0 = 2
        # Total: 1 + 1 + 2 = 4
        dob = date(2000, 1, 1)
        result = NumerologyEngine.calculate_life_path(dob)
        assert result == 4

    def test_life_path_preserves_master_11_in_day(self):
        """Day 29 should reduce to master 11, preserved in calculation."""
        # November 29, 1990
        # Day: 29 → 2+9 = 11 (master, keep)
        # Month: 11 (master, keep)
        # Year: 1+9+9+0 = 19 → 1+9 = 10 → 1+0 = 1
        # Total: 11 + 11 + 1 = 23 → 2+3 = 5
        dob = date(1990, 11, 29)
        result = NumerologyEngine.calculate_life_path(dob)
        assert result == 5

    def test_life_path_preserves_master_11_in_month(self):
        """Month 11 (November) should be preserved as master number."""
        # November 1, 2000
        # Day: 1, Month: 11 (master), Year: 2
        # Total: 1 + 11 + 2 = 14 → 5
        dob = date(2000, 11, 1)
        result = NumerologyEngine.calculate_life_path(dob)
        assert result == 5

    def test_life_path_preserves_master_22_in_year(self):
        """Year summing to 22 should be preserved."""
        # April 4, 1984
        # Day: 4, Month: 4, Year: 1+9+8+4 = 22 (master, keep)
        # Total: 4 + 4 + 22 = 30 → 3
        dob = date(1984, 4, 4)
        result = NumerologyEngine.calculate_life_path(dob)
        assert result == 3

    def test_life_path_final_master_11(self):
        """Test when final result is master number 11."""
        # September 10, 1900
        # Day: 10 → 1+0 = 1, Month: 9, Year: 1+9+0+0 = 10 → 1
        # Total: 1 + 9 + 1 = 11 (master, preserve!)
        dob = date(1900, 9, 10)
        result = NumerologyEngine.calculate_life_path(dob)
        assert result == 11

    def test_life_path_final_master_22(self):
        """Test when final result is master number 22."""
        # August 3, 2009
        # Day: 3, Month: 8, Year: 2+0+0+9 = 11 (master, keep)
        # Total: 3 + 8 + 11 = 22 (master, preserve!)
        dob = date(2009, 8, 3)
        result = NumerologyEngine.calculate_life_path(dob)
        assert result == 22

    def test_life_path_deterministic(self):
        """Same input always gives same output."""
        dob = date(1985, 6, 15)
        result1 = NumerologyEngine.calculate_life_path(dob)
        result2 = NumerologyEngine.calculate_life_path(dob)
        assert result1 == result2


class TestDestinyNumber:
    """Test Destiny/Expression number calculations."""

    def test_destiny_john_doe(self):
        """Test Destiny number for 'John Doe'."""
        # J=1, O=6, H=8, N=5 = 20
        # D=4, O=6, E=5 = 15
        # Total = 35 → 8
        result = NumerologyEngine.calculate_destiny_number("John Doe")
        assert result == 8

    def test_destiny_case_insensitive(self):
        """Destiny calculation is case-insensitive."""
        lower = NumerologyEngine.calculate_destiny_number("john doe")
        upper = NumerologyEngine.calculate_destiny_number("JOHN DOE")
        mixed = NumerologyEngine.calculate_destiny_number("John Doe")
        assert lower == upper == mixed

    def test_destiny_ignores_spaces(self):
        """Spaces don't affect calculation."""
        with_space = NumerologyEngine.calculate_destiny_number("John Doe")
        without_space = NumerologyEngine.calculate_destiny_number("JohnDoe")
        assert with_space == without_space

    def test_destiny_ignores_special_chars(self):
        """Special characters are ignored."""
        plain = NumerologyEngine.calculate_destiny_number("John Doe")
        with_hyphen = NumerologyEngine.calculate_destiny_number("John-Doe")
        assert plain == with_hyphen


class TestSoulUrge:
    """Test Soul Urge (Heart's Desire) number calculations."""

    def test_soul_urge_john_doe(self):
        """Test Soul Urge for 'John Doe' - vowels only."""
        # Vowels: O, O, E
        # O=6, O=6, E=5 = 17 → 8
        result = NumerologyEngine.calculate_soul_urge("John Doe")
        assert result == 8

    def test_soul_urge_vowels_aeiou(self):
        """Test that A, E, I, O, U are counted as vowels."""
        # "AEIOU" = 1+5+9+6+3 = 24 → 6
        result = NumerologyEngine.calculate_soul_urge("AEIOU")
        assert result == 6

    def test_soul_urge_y_at_end_is_vowel(self):
        """Y at end of word is treated as vowel (Mary, Betty)."""
        # "Mary" vowels: A, Y (Y at end = vowel)
        # A=1, Y=7 = 8
        result = NumerologyEngine.calculate_soul_urge("Mary")
        assert result == 8  # A + Y counted


class TestPersonalityNumber:
    """Test Personality number calculations."""

    def test_personality_john_doe(self):
        """Test Personality for 'John Doe' - consonants only."""
        # Consonants: J, H, N, D
        # J=1, H=8, N=5, D=4 = 18 → 9
        result = NumerologyEngine.calculate_personality_number("John Doe")
        assert result == 9

    def test_personality_y_at_end_excluded(self):
        """Y at end of word is vowel, excluded from personality."""
        # "Mary" consonants: M, R (Y at end = vowel, excluded)
        # M=4, R=9 = 13 → 4
        result = NumerologyEngine.calculate_personality_number("Mary")
        assert result == 4


class TestFullComputation:
    """Test complete numerology computation."""

    def test_full_compute_returns_all_fields(self):
        """Test full computation returns all fields."""
        result = NumerologyEngine.compute("Jane Smith", date(1985, 6, 15))

        assert result.name_used == "Jane Smith"
        assert result.birth_day == 15
        assert 1 <= result.life_path <= 33
        assert 1 <= result.destiny_number <= 33
        assert 1 <= result.soul_urge <= 33
        assert 1 <= result.personality <= 33

    def test_deterministic_full_compute(self):
        """Full computation is deterministic."""
        name = "Test User"
        dob = date(1990, 1, 1)

        result1 = NumerologyEngine.compute(name, dob)
        result2 = NumerologyEngine.compute(name, dob)

        assert result1.life_path == result2.life_path
        assert result1.destiny_number == result2.destiny_number
        assert result1.soul_urge == result2.soul_urge
        assert result1.personality == result2.personality


class TestPythagoreanValues:
    """Test Pythagorean letter value mapping."""

    def test_all_letters_have_values(self):
        """All letters a-z have values 1-9."""
        for letter in 'abcdefghijklmnopqrstuvwxyz':
            assert letter in NumerologyEngine.LETTER_VALUES
            assert 1 <= NumerologyEngine.LETTER_VALUES[letter] <= 9

    def test_pythagorean_cycle(self):
        """Verify Pythagorean 9-cycle is correct."""
        # A=1, B=2, C=3, D=4, E=5, F=6, G=7, H=8, I=9
        # J=1 (cycles back), K=2, L=3...
        assert NumerologyEngine.LETTER_VALUES['a'] == 1
        assert NumerologyEngine.LETTER_VALUES['i'] == 9
        assert NumerologyEngine.LETTER_VALUES['j'] == 1  # Cycle restart
        assert NumerologyEngine.LETTER_VALUES['s'] == 1  # 3rd cycle
        assert NumerologyEngine.LETTER_VALUES['z'] == 8


class TestGoldenCharts:
    """
    Golden chart tests - reference calculations for regression testing.

    If these fail, the engine has a bug that breaks compatibility.
    """

    @pytest.mark.parametrize("dob,expected", [
        (date(2000, 1, 1), 4),       # Simple: 1 + 1 + 2 = 4
        (date(1900, 9, 10), 11),     # Master 11 result
        (date(2009, 8, 3), 22),      # Master 22 result
        (date(1990, 11, 29), 5),     # Master in components, regular result
    ])
    def test_golden_life_paths(self, dob, expected):
        """Verify golden life path calculations."""
        result = NumerologyEngine.calculate_life_path(dob)
        assert result == expected, f"DOB {dob}: expected {expected}, got {result}"

    @pytest.mark.parametrize("name,expected", [
        ("John Doe", 8),
        ("A", 1),
        ("AB", 3),   # A=1 + B=2 = 3
        ("ABC", 6),  # A=1 + B=2 + C=3 = 6
    ])
    def test_golden_destiny_numbers(self, name, expected):
        """Verify golden destiny calculations."""
        result = NumerologyEngine.calculate_destiny_number(name)
        assert result == expected, f"Name '{name}': expected {expected}, got {result}"
