"""This module defines project-level params. They can be tweaked as needed"""

# for inputs to preprocess.filter.filter_image()
ALPHA = 2.0
BETA = 150

# for filtering out results from OCR Reader
CONFIDENCE = 0.1

# for stdev tolerance in postprocess.projection_filters.*
X_TOL = 0.75
Y_TOL = 3
GAP_TOL = 1.3

# for alignment and score validation (expected minimum score)
SCORE_MIN = 10000