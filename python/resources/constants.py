"""This module defines project-level constants."""

# score words
PERFECT = "PERFECT"
GREAT = "GREAT"
GOOD = "GOOD"
BAD = "BAD"
MISS = "MISS"
MAX_COMBO = "MAX COMBO"
TOTAL_SCORE = "TOTAL SCORE"

# other template words
CALORIE_KCAL = "CALORIE(KCAL)"
CREDITS = "CREDIT(S)"
FREE_PLAY = "FREE PLAY"
EVENT = "EVENT"
MACHINE_BEST = "MACHINE BEST"
MY_BEST = "MY BEST"

# user-defined template keys
CHART = "CHART"
DIFFICULTY = "DIFFICULTY"
FOOTER = "FOOTER"
GRADE = "GRADE"
TYPE = "TYPE"
USER = "USER"

# lists of interest
CHART_TYPES = ["SINGLE", "DOUBLE", "CO-OP", "SINGLE P.", "DOUBLE P."]
GRADE_LIST = ["SSS", "SS", "S", "A", "B", "C", "D", "F"]
NO_MISS = ["SSS", "SS", "S"]
SCORE_WORDS = [PERFECT, GREAT, GOOD, BAD, MISS, MAX_COMBO, TOTAL_SCORE]
TEMPLATE_WORDS = SCORE_WORDS + [CALORIE_KCAL, MY_BEST, MACHINE_BEST, FOOTER]
ALL_WORDS = SCORE_WORDS + TEMPLATE_WORDS + [CHART, DIFFICULTY, FOOTER, GRADE, TYPE, USER]
