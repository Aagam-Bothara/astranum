"""
Numerology Engine - Pure mathematical computations.

This is a deterministic engine. Given the same inputs, it ALWAYS produces the same outputs.
The LLM layer only interprets these numbers - it never generates them.

Supports:
- Core Numbers: Life Path, Destiny, Soul Urge, Personality
- Advanced Numbers: Maturity, Personal Year, Birthday
- Karmic Debt: 13, 14, 16, 19 detection
- Pinnacle & Challenge cycles
"""

from datetime import date
from typing import Dict, List, Optional, Tuple

from app.schemas.chart import NumerologyData


class NumerologyEngine:
    """
    Numerology computation engine.

    Computes:
    - Life Path Number (from DOB) - Your life's purpose
    - Destiny/Expression Number (from full name) - Your talents and abilities
    - Soul Urge Number (from vowels in name) - Your inner desires
    - Personality Number (from consonants in name) - How others see you
    - Maturity Number (Life Path + Destiny) - Goals for later life
    - Personal Year Number - Current year's theme
    - Birthday Number - Special talents from birth date
    - Karmic Debt Numbers - Lessons to learn
    - Pinnacle Numbers - Four major life cycles
    - Challenge Numbers - Obstacles to overcome
    """

    # Letter to number mapping (Pythagorean system)
    LETTER_VALUES: Dict[str, int] = {
        'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5, 'f': 6, 'g': 7, 'h': 8, 'i': 9,
        'j': 1, 'k': 2, 'l': 3, 'm': 4, 'n': 5, 'o': 6, 'p': 7, 'q': 8, 'r': 9,
        's': 1, 't': 2, 'u': 3, 'v': 4, 'w': 5, 'x': 6, 'y': 7, 'z': 8,
    }

    VOWELS = set('aeiou')
    MASTER_NUMBERS = {11, 22, 33}

    # Karmic Debt Numbers - Numbers that indicate karmic lessons
    KARMIC_DEBT_NUMBERS = {13, 14, 16, 19}

    @classmethod
    def _is_y_vowel(cls, name: str, position: int) -> bool:
        """
        Determine if Y at the given position should be treated as a vowel.

        Rules for Y as vowel:
        - Y at the end of a word/name is usually a vowel (Mary, Betty, Tommy)
        - Y between consonants is usually a vowel (Lynn, Cynthia, Flynn)
        - Y is NOT a vowel when it starts a syllable before another vowel (Yes, Yellow)
        - Y is NOT a vowel when immediately followed by another vowel (Mayor, Yolanda)

        Args:
            name: The full name (lowercase)
            position: Index of Y in the name

        Returns:
            True if Y should be treated as a vowel
        """
        name = name.lower()
        if position < 0 or position >= len(name) or name[position] != 'y':
            return False

        # Check if Y is at start of a word
        is_word_start = position == 0 or not name[position - 1].isalpha()

        # Check if next character is a vowel
        has_vowel_after = (
            position + 1 < len(name) and
            name[position + 1].isalpha() and
            name[position + 1] in cls.VOWELS
        )

        # Y at start of word followed by vowel = consonant (Yes, Yellow, Yolanda)
        if is_word_start and has_vowel_after:
            return False

        # Y immediately followed by another vowel = consonant (Mayor, Coyote)
        if has_vowel_after:
            return False

        # Y at end of word = vowel (Mary, Betty, Tommy)
        is_word_end = position == len(name) - 1 or not name[position + 1].isalpha()
        if is_word_end:
            return True

        # Y between consonants = vowel (Lynn, Cynthia, Flynn, Glynis)
        has_consonant_before = (
            position > 0 and
            name[position - 1].isalpha() and
            name[position - 1] not in cls.VOWELS
        )
        has_consonant_after = (
            position + 1 < len(name) and
            name[position + 1].isalpha() and
            name[position + 1] not in cls.VOWELS
        )
        if has_consonant_before and has_consonant_after:
            return True

        # Default: Y is consonant
        return False

    @classmethod
    def _get_vowels_from_name(cls, name: str) -> str:
        """Extract vowels from name, treating Y appropriately."""
        name_lower = name.lower()
        vowels = []
        for i, c in enumerate(name_lower):
            if c in cls.VOWELS:
                vowels.append(c)
            elif c == 'y' and cls._is_y_vowel(name_lower, i):
                vowels.append(c)
        return ''.join(vowels)

    @classmethod
    def _get_consonants_from_name(cls, name: str) -> str:
        """Extract consonants from name, treating Y appropriately."""
        name_lower = name.lower()
        consonants = []
        for i, c in enumerate(name_lower):
            if not c.isalpha():
                continue
            if c in cls.VOWELS:
                continue
            if c == 'y' and cls._is_y_vowel(name_lower, i):
                continue  # Y is a vowel here, skip
            consonants.append(c)
        return ''.join(consonants)

    @classmethod
    def compute(cls, full_name: str, date_of_birth: date, current_date: Optional[date] = None) -> NumerologyData:
        """
        Compute all numerology numbers for a person.

        Args:
            full_name: Person's full name (as used commonly)
            date_of_birth: Birth date
            current_date: Current date for personal year calculation (defaults to today)

        Returns:
            NumerologyData with all computed numbers
        """
        if current_date is None:
            current_date = date.today()

        life_path = cls.calculate_life_path(date_of_birth)
        destiny = cls.calculate_destiny_number(full_name)
        soul_urge = cls.calculate_soul_urge(full_name)
        personality = cls.calculate_personality_number(full_name)
        maturity = cls.calculate_maturity_number(life_path, destiny)
        personal_year = cls.calculate_personal_year(date_of_birth, current_date)
        birthday_number = cls.calculate_birthday_number(date_of_birth.day)

        # Calculate karmic debt
        karmic_debt = cls.detect_karmic_debt(date_of_birth, full_name)

        # Calculate pinnacles and challenges
        pinnacles = cls.calculate_pinnacles(date_of_birth)
        challenges = cls.calculate_challenges(date_of_birth)

        # Get current pinnacle and challenge based on age
        age = (current_date - date_of_birth).days // 365
        current_pinnacle, current_pinnacle_number = cls.get_current_pinnacle(pinnacles, life_path, age)
        current_challenge, current_challenge_number = cls.get_current_challenge(challenges, life_path, age)

        return NumerologyData(
            life_path=life_path,
            destiny_number=destiny,
            soul_urge=soul_urge,
            personality=personality,
            birth_day=date_of_birth.day,
            name_used=full_name,
            # Extended fields
            maturity_number=maturity,
            personal_year=personal_year,
            birthday_number=birthday_number,
            karmic_debt=karmic_debt,
            current_pinnacle=current_pinnacle_number,
            current_pinnacle_period=current_pinnacle,
            current_challenge=current_challenge_number,
            current_challenge_period=current_challenge,
        )

    @classmethod
    def calculate_life_path(cls, dob: date) -> int:
        """
        Calculate Life Path number from date of birth.

        Method: Reduce each component (day, month, year) to single digit
        (preserving master numbers 11, 22), then add and reduce final sum.

        Example: November 29, 1990
        - Day: 29 → 2+9 = 11 (master, keep)
        - Month: 11 (master, keep)
        - Year: 1990 → 1+9+9+0 = 19 → 1+9 = 10 → 1+0 = 1
        - Total: 11 + 11 + 1 = 23 → 2+3 = 5
        """
        day = cls._reduce_to_single(dob.day, preserve_master=True)
        month = cls._reduce_to_single(dob.month, preserve_master=True)
        year = cls._reduce_to_single(dob.year, preserve_master=True)

        total = day + month + year
        return cls._reduce_to_single(total, preserve_master=True)

    @classmethod
    def calculate_destiny_number(cls, name: str) -> int:
        """
        Calculate Destiny/Expression number from full name.

        Method: Sum all letter values and reduce to single digit.
        """
        total = cls._name_to_number(name)
        return cls._reduce_to_single(total, preserve_master=True)

    @classmethod
    def calculate_soul_urge(cls, name: str) -> int:
        """
        Calculate Soul Urge number from vowels in name.

        Method: Sum values of all vowels (including Y when it acts as vowel)
        and reduce to single digit.
        """
        vowels_only = cls._get_vowels_from_name(name)
        total = cls._name_to_number(vowels_only)
        return cls._reduce_to_single(total, preserve_master=True)

    @classmethod
    def calculate_personality_number(cls, name: str) -> int:
        """
        Calculate Personality number from consonants in name.

        Method: Sum values of all consonants (Y is consonant only when not acting as vowel)
        and reduce to single digit.
        """
        consonants_only = cls._get_consonants_from_name(name)
        total = cls._name_to_number(consonants_only)
        return cls._reduce_to_single(total, preserve_master=True)

    @classmethod
    def _name_to_number(cls, name: str) -> int:
        """Convert name to number by summing letter values."""
        return sum(
            cls.LETTER_VALUES.get(c.lower(), 0)
            for c in name
            if c.isalpha()
        )

    @classmethod
    def _reduce_to_single(cls, num: int, preserve_master: bool = False) -> int:
        """
        Reduce a number to a single digit.

        Args:
            num: Number to reduce
            preserve_master: If True, keep 11, 22, 33 as-is

        Returns:
            Single digit (1-9) or master number (11, 22, 33)
        """
        while num > 9:
            if preserve_master and num in cls.MASTER_NUMBERS:
                return num
            num = sum(int(d) for d in str(num))
        return num

    @classmethod
    def calculate_maturity_number(cls, life_path: int, destiny: int) -> int:
        """
        Calculate Maturity Number (Life Path + Destiny).

        The Maturity Number reveals goals and direction for the second half of life.
        It becomes increasingly influential after age 35-40.
        """
        total = life_path + destiny
        return cls._reduce_to_single(total, preserve_master=True)

    @classmethod
    def calculate_personal_year(cls, dob: date, current_date: date) -> int:
        """
        Calculate Personal Year Number.

        Personal Year runs from birthday to birthday.
        Formula: Birth Month + Birth Day + Current Year (reduced)

        The 9-year cycle:
        1 - New beginnings, 2 - Partnerships, 3 - Creativity
        4 - Foundation, 5 - Change, 6 - Responsibility
        7 - Introspection, 8 - Achievement, 9 - Completion
        """
        month = cls._reduce_to_single(dob.month)
        day = cls._reduce_to_single(dob.day)
        year = cls._reduce_to_single(current_date.year)

        total = month + day + year
        return cls._reduce_to_single(total)

    @classmethod
    def calculate_birthday_number(cls, day: int) -> int:
        """
        Calculate Birthday Number.

        The day you were born indicates special talents and abilities.
        It's a minor influence but adds flavor to your core numbers.
        """
        return cls._reduce_to_single(day, preserve_master=True)

    @classmethod
    def detect_karmic_debt(cls, dob: date, full_name: str) -> List[int]:
        """
        Detect Karmic Debt Numbers in the chart.

        Karmic Debt Numbers (13, 14, 16, 19) appear before reduction
        and indicate lessons carried from past lives.

        - 13/4: Laziness in past life, need to work hard
        - 14/5: Abuse of freedom, need for moderation
        - 16/7: Ego issues, need for humility
        - 19/1: Abuse of power, need for self-reliance

        Traditional detection method:
        1. Birth day directly (most common) - if born on 13, 14, 16, or 19
        2. Life Path total intermediate - if day+month+year sum passes through karmic number
        3. Destiny number intermediate - if name total passes through karmic number
        """
        karmic_debts = []

        # === Primary Source: Birth Day ===
        # If born on 13th, 14th, 16th, or 19th - this is the most common karmic debt source
        day = dob.day
        if day in cls.KARMIC_DEBT_NUMBERS:
            karmic_debts.append(day)

        # === Secondary Source: Life Path Total Intermediate ===
        # Calculate Life Path using traditional method: reduce components, add, reduce total
        # Check if the TOTAL passes through a karmic debt number during reduction
        day_reduced = cls._reduce_to_single(day, preserve_master=True)
        month_reduced = cls._reduce_to_single(dob.month, preserve_master=True)
        year_reduced = cls._reduce_to_single(dob.year, preserve_master=True)

        total = day_reduced + month_reduced + year_reduced

        # Check intermediate values during total reduction
        # Example: total=32 → not karmic, total=19 → karmic debt 19
        while total > 9 and total not in cls.MASTER_NUMBERS:
            if total in cls.KARMIC_DEBT_NUMBERS:
                karmic_debts.append(total)
            total = sum(int(d) for d in str(total))

        # === Tertiary Source: Destiny Number Intermediate ===
        # Check if name total passes through a karmic debt number
        name_total = cls._name_to_number(full_name)

        while name_total > 9:
            if name_total in cls.KARMIC_DEBT_NUMBERS:
                karmic_debts.append(name_total)
            name_total = sum(int(d) for d in str(name_total))

        return sorted(set(karmic_debts))

    @classmethod
    def calculate_pinnacles(cls, dob: date) -> List[Tuple[int, int, int]]:
        """
        Calculate the four Pinnacle Numbers and their periods.

        Pinnacles represent opportunities and environments during major life phases.

        Returns:
            List of (start_age, end_age, pinnacle_number) tuples
        """
        month = cls._reduce_to_single(dob.month)
        day = cls._reduce_to_single(dob.day)
        year = cls._reduce_to_single(dob.year)
        life_path = cls.calculate_life_path(dob)

        # First pinnacle ends at 36 - life_path
        first_end = 36 - life_path
        if first_end < 27:
            first_end = 27  # Minimum first pinnacle length

        pinnacles = []

        # First Pinnacle: Month + Day
        p1 = cls._reduce_to_single(month + day, preserve_master=True)
        pinnacles.append((0, first_end, p1))

        # Second Pinnacle: Day + Year (next 9 years)
        p2 = cls._reduce_to_single(day + year, preserve_master=True)
        pinnacles.append((first_end + 1, first_end + 9, p2))

        # Third Pinnacle: First + Second (next 9 years)
        p3 = cls._reduce_to_single(p1 + p2, preserve_master=True)
        pinnacles.append((first_end + 10, first_end + 18, p3))

        # Fourth Pinnacle: Month + Year (rest of life)
        p4 = cls._reduce_to_single(month + year, preserve_master=True)
        pinnacles.append((first_end + 19, 99, p4))

        return pinnacles

    @classmethod
    def calculate_challenges(cls, dob: date) -> List[Tuple[int, int, int]]:
        """
        Calculate the four Challenge Numbers and their periods.

        Challenges represent obstacles to overcome during major life phases.

        Returns:
            List of (start_age, end_age, challenge_number) tuples
        """
        month = cls._reduce_to_single(dob.month)
        day = cls._reduce_to_single(dob.day)
        year = cls._reduce_to_single(dob.year)
        life_path = cls.calculate_life_path(dob)

        # Use same periods as pinnacles
        first_end = 36 - life_path
        if first_end < 27:
            first_end = 27

        challenges = []

        # First Challenge: |Month - Day|
        c1 = abs(month - day)
        challenges.append((0, first_end, c1))

        # Second Challenge: |Day - Year|
        c2 = abs(day - year)
        challenges.append((first_end + 1, first_end + 9, c2))

        # Third Challenge: |First - Second|
        c3 = abs(c1 - c2)
        challenges.append((first_end + 10, first_end + 18, c3))

        # Fourth Challenge: |Month - Year|
        c4 = abs(month - year)
        challenges.append((first_end + 19, 99, c4))

        return challenges

    @classmethod
    def get_current_pinnacle(
        cls,
        pinnacles: List[Tuple[int, int, int]],
        life_path: int,
        age: int,
    ) -> Tuple[int, int]:
        """
        Get the current pinnacle period and number based on age.

        Returns:
            Tuple of (period_number 1-4, pinnacle_number)
        """
        for i, (start, end, number) in enumerate(pinnacles, 1):
            if start <= age <= end:
                return (i, number)
        return (4, pinnacles[-1][2])  # Default to 4th pinnacle

    @classmethod
    def get_current_challenge(
        cls,
        challenges: List[Tuple[int, int, int]],
        life_path: int,
        age: int,
    ) -> Tuple[int, int]:
        """
        Get the current challenge period and number based on age.

        Returns:
            Tuple of (period_number 1-4, challenge_number)
        """
        for i, (start, end, number) in enumerate(challenges, 1):
            if start <= age <= end:
                return (i, number)
        return (4, challenges[-1][2])  # Default to 4th challenge
