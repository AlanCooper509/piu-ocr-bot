# pip install easyocr (1.6.2)
# pip install editdistance

from easyocr import Reader
import cv2
import editdistance
import numpy as np
import os
import sys

# local imports
from preprocess import filter
from postprocess import projection_filters
from resources import constants as c
from resources.constants import ALL_WORDS
from resources.constants import CHART_TYPES
from resources.constants import GRADE_LIST
from resources.constants import NO_MISS
from resources.constants import SCORE_WORDS
from resources.constants import TEMPLATE_WORDS
from resources import params
from resources.textbox import Textbox

def post_process(results):
    # post-processing: remove low-confidence text
    confident_results = [result for result in results if result[2] > params.CONFIDENCE]

    # post-processing: categorize template text, digits, and remaining text
    template = {key: Textbox(entry=None) for key in ALL_WORDS}
    digits = []
    remaining_results = []

    for result in confident_results:
        template_entry = result[1].upper()
        if template_entry in TEMPLATE_WORDS:
            # expected template words
            template[template_entry] = Textbox(result)
        elif template_entry.isdigit():
            # other numbers text
            digits.append(Textbox(result))
        elif template_entry == c.FREE_PLAY or c.CREDITS in template_entry:
            # nothing of interest below the footer text on-screen
            template[c.FOOTER] = Textbox(result)
            break
        else:
            # uncategorized text
            remaining_results.append(Textbox(result))

    # filter outliers using x-axis projections
    rval = projection_filters.filter_outliers(digits, axis=0, tol=params.X_TOL)
    filtered_numbers = rval[0]
    remaining_digits = rval[1]

    # filter outliers using y-axis displacements
    loop = True
    score_numbers = filtered_numbers.copy()
    while loop:
        rval = projection_filters.filter_displacement_outliers(score_numbers, axis=1, tol=params.Y_TOL)
        score_numbers = rval[0]
        remaining_digits += rval[1]
        loop = rval[2]

    # find any missing (inbetween) entries
    outliers = projection_filters.find_displacement_outliers(score_numbers, axis=1, tol=params.GAP_TOL)

    # check last entry (TOTAL SCORE), hacky since assumes player scores > 10000
    if len(score_numbers) + len(outliers) < 7:
        if int(score_numbers[-1].text) < params.SCORE_MIN:
            outliers.append(6)

    # if still gaps, assuming missing scores from top to bottom
    iterator = 0
    while len(score_numbers) + len(outliers) < 7:
        if iterator not in outliers:
            outliers.append(iterator)
        iterator += 1

    for idx in outliers:
        score_numbers.insert(idx, Textbox(entry=None))

    # match scores with their template word's values
    for idx, word in enumerate(SCORE_WORDS):
        template[word].value = score_numbers[idx]
    
    # get song name using PERFECT text as a reference
    chart_name = None
    template[c.CHART] = Textbox(entry = None)
    if template[c.PERFECT].area > 0:
        reference = template[c.PERFECT].center

        # find closest Textbox to the "PERFECT" template text
        min = float("inf")
        for entry in remaining_results:
            if entry.center[1] < reference[1]:
                # avoid unnecessary sqrt operation
                vectors = np.subtract(reference, entry.center)
                dist2 = np.square(vectors)
                euclidean2 = np.sum(dist2)
                if euclidean2 < min:
                    chart_name = entry
                    min = euclidean2
        # pesky chart names like 1949 and 1950
        for entry in remaining_digits:
            if entry.center[1] < reference[1]:
                # avoid unnecessary sqrt operation
                vectors = np.subtract(reference, entry.center)
                dist2 = np.square(vectors)
                euclidean2 = np.sum(dist2)
                if euclidean2 < min:
                    chart_name = entry
                    min = euclidean2

        template[c.CHART] = chart_name
        template[c.CHART].text = chart_name.text.upper()
        template[c.CHART].value = chart_name.text.upper()
    
    # get grade
    grade = Textbox(entry = None)

    # use entry that matches GRADE_LIST text with maximum size (box area)
    max_area = -1
    for entry in remaining_results:
        if entry.area > max_area and entry.text in GRADE_LIST:
            max_area = entry.area
            grade = entry

    # quick validation check(s) go here
    if template[c.PERFECT].area > grade.area:
        grade = Textbox(entry = None)
    if template[c.MISS].value:
        try:
            if grade.text in NO_MISS and int(template[c.MISS].value.text) > 0:
                grade = Textbox(entry = None)
        except:
            pass

    template[c.GRADE] = grade
    template[c.GRADE].value = grade.text
    
    # get chart difficulty
    chart_diff = Textbox(entry = None)
    double_digits = []
    for entry in remaining_digits:
        if len(entry.text) == 2:
            double_digits.append(entry)

    double_filtered = []
    if template[c.PERFECT].area > 0 and template[c.GRADE].text != '':
        # should be closer to GRADE than to PERFECT, also should be lower than both
        for entry in double_digits:
            x_pos = entry.center[0]
            y_pos = entry.center[1]
            grade_dist_x = abs(x_pos - template[c.GRADE].center[0])
            perf_dist_x = abs(x_pos - template[c.PERFECT].center[0])
            if grade_dist_x > perf_dist_x:
                continue
            if y_pos < template[c.GRADE].center[1]:
                continue
            # should be above the footer text
            if template[c.FOOTER].area > 0 and y_pos > template[c.FOOTER].center[1]:
                continue
            double_filtered.append(entry)

    # not ideal, but just pick smallest y-value filtered two-digit number result
    if len(double_filtered) > 0:
        chart_diff = double_filtered[0]

    template[c.DIFFICULTY] = chart_diff
    if chart_diff.text != '':
        template[c.DIFFICULTY].value = int(chart_diff.text)
    
    # get single or double
    found_type = Textbox(entry = None)

    if template[c.DIFFICULTY].area > 0:
        # find closest remaining Textbox to the "difficulty" text
        reference = template[c.DIFFICULTY].center
        min = float("inf")
        for entry in remaining_results:
            # avoid unnecessary sqrt operation
            vectors = np.subtract(reference, entry.center)
            dist2 = np.square(vectors)
            euclidean2 = np.sum(dist2)
            if euclidean2 < min:
                found_type = entry
                min = euclidean2

    # match the found word to most likely candidate of chart types
    found_type.text = found_type.text.upper()
    if found_type != '':
        diff = 99
        type_idx = -1
        for idx, exp_type in enumerate(CHART_TYPES):
            d = editdistance.eval(exp_type, found_type.text)
            if d < diff:
                type_idx = idx
                diff = d

    template[c.TYPE] = found_type.copy()
    if found_type.text != '':
        template[c.TYPE].value = CHART_TYPES[type_idx]
    
    # get username
    # finds closest word to expected distance directly above perfect score value
    # specified with a magnitude of perfect score value - miss score value
    username = Textbox(entry = None)

    p = template[c.PERFECT].value
    m = template[c.MISS].value
    if p and m:
        if p.text != '' and m.text != '':
            disp = np.subtract(m.center, p.center)
            expected = np.subtract(p.center, disp)
            min = float("inf")
            for entry in remaining_results:
                # avoid unnecessary sqrt operation
                vectors = np.subtract(expected, entry.center)
                dist2 = np.square(vectors)
                euclidean2 = np.sum(dist2)
                if euclidean2 < min:
                    username = entry
                    min = euclidean2

    template[c.USER] = username
    template[c.USER].value = username.text.upper()
    
    print(f'PLAYER: {template[c.USER].value}')
    print(f'CHART: {template[c.CHART].value} | {template[c.TYPE].value} {template[c.DIFFICULTY].value}')
    print(f'GRADE: {template[c.GRADE].value}')

    print("======================")
    for word in SCORE_WORDS:
        try:
            print(f'{word}: {template[word].value.text}')
        except:
            print(f'{word}: NOT FOUND')
    print("======================")

def main(fname):
    # load the input image from disk
    image = cv2.imread(fname)
    if image is None:
        print(f'unable to find {fname}')
        return
    
    # preprocess the image
    filtered = filter.filter_image(image, params.ALPHA, params.BETA)
    
    # OCR the input image using EasyOCR
    print("[INFO] OCR'ing input image...")
    reader = Reader(['en'], gpu=True)
    results = reader.readtext(filtered)
    
    # postprocess the text results
    post_process(results)

if __name__ == "__main__":
    args = sys.argv[1:]
    if len(args) > 0:
        dir = os.path.dirname(os.path.dirname(__file__))
        fname = os.path.join(dir, "input_images", args[0])
        main(fname)
    else:
        print("Need to include filename")
