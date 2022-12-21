"""This module defines project-level params. They can be tweaked as needed"""

# for inputs to preprocess.filter.filter_image()
ALPHA = 2.0
BETA = 150

# compressing input image for speed considerations
MAX_IMG_SIZE = (2000, 2000)

# for filtering out results from OCR Reader
CONFIDENCE = 0.1

# for stdev tolerance in postprocess.projection_filters.*
X_TOL = 0.75
Y_TOL = 2
NAME_X_TOL = 5
GAP_TOL = 1.3

# for alignment and score validation (expected minimum score)
SCORE_MIN = 10000