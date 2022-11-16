# pip install editdistance

import editdistance
import numpy as np
import os

# local imports
from postprocess import projection_filters
from resources import constants as c
from resources import params
from resources.textbox import Textbox

def categorize_results(confident_results, template):
    """
    post-processing: categorize template text, digits, and remaining text
    
    input: array of tuples returned from easyOCR, to be formatted as Textbox objects
    output: three categories of data found
    - template: template words
    - digits: any text containing only integers/numbers
    - other: the "leftover" text after categorizing
    """
    digits = []
    other = []
    
    for result in confident_results:
        template_entry = result[1].upper()
        if template_entry in c.TEMPLATE_WORDS:
            # expected template words
            template[template_entry] = Textbox(result)
        elif template_entry.isdigit():
            # other numbers text
            digits.append(Textbox(result))
        elif template_entry == c.FREE_PLAY or template_entry == c.EVENT or c.CREDITS in template_entry:
            # nothing of interest below the footer text on-screen
            template[c.FOOTER] = Textbox(result)
            break
        else:
            # uncategorized text
            other.append(Textbox(result))
    
    return (template, digits, other)

def assign_digits(digits, debug=False):
    """
    *********************************************************
    determine the seven entries from the input param 'digits'
        that represent score_numbers by using the textbox
        center (x,y) locations from each entry in 'digits'
        and utilizing that they will have roughly the same
        x-position and similar y-displacements from each
        adjacent, sequential value (if OCR'd successfully)
    stuff the rest from the input into remaining_digits
    
    The seven entries of interest are grouped together as:
    - PERFECT number value
    - GREAT number value
    - GOOD number value
    - BAD number value
    - MISS number value
    - COMBO number value
    - TOTAL SCORE number value
    
    note, kcal value is not included since it is assumed
        to be parsed as a string, not as an integer (digit)
        this is due to the ',' or '.' interpreted char in
        the format of the screen's capture value xxx.xxx
    *********************************************************
    'digits' input is treated as a list of Textbox objects
        where each Textbox.text value was parseable as int
    *********************************************************
    """
    frame = f'{os.path.basename(__file__)}:{assign_digits.__name__}()'
    if debug:
        print("=====================================")
        print(f'Start: {frame}')
        print("-------------------------------------")
        
        comment = "input digits (text field)"
        print(frame)
        print(f'- {comment}')
        print(f'\t- digits: {[n.text for n in digits]}\n')
    
    score_numbers = []
    remaining_digits = []
    
    # score numbers should have string length 3+
    for d in digits:
        if len(d.text) >= 3:
            score_numbers.append(d)
        else:
            remaining_digits.append(d)
    
    # filter outliers using x-axis projections
    (score_numbers, outliers) = projection_filters.filter_outliers(score_numbers, axis=0, tol=params.X_TOL)
    remaining_digits += outliers
    
    if debug:
        comment = "after x-axis projection"
        print(frame)
        print(f'- {comment}')
        print(f'\t- score_numbers: {[n.text for n in score_numbers]}')
        print(f'\t- remaining_digits: {[n.text for n in remaining_digits]}\n')
    
    # filter outliers using y-axis displacements
    loop = True
    while loop:
        (score_numbers, more_outliers) = projection_filters.filter_displacement_outliers(score_numbers, axis=1, tol=params.Y_TOL)
        remaining_digits += more_outliers
        loop = len(more_outliers) > 0
    
    if debug:
        comment = "after y-axis projection"
        print(frame)
        print(f'- {comment}')
        print(f'\t- score_numbers: {[n.text for n in score_numbers]}')
        print(f'\t- remaining_digits: {[n.text for n in remaining_digits]}\n')
    
    # find any missing (inbetween) entries
    gapIndices = projection_filters.find_displacement_outliers(score_numbers, axis=1, tol=params.GAP_TOL)
    
    # check last entry (TOTAL SCORE), hacky since assumes player scores > 10000
    if len(score_numbers) + len(gapIndices) < 7:
        if int(score_numbers[-1].text) < params.SCORE_MIN:
            gapIndices.append(6)
    
    # if still gaps, assuming missing scores from top to bottom
    iterator = 0
    while len(score_numbers) + len(gapIndices) < 7:
        if iterator not in gapIndices:
            gapIndices.append(iterator)
        iterator += 1
    
    for idx in gapIndices:
        score_numbers.insert(idx, Textbox(entry=None))
    
    if debug:
        comment = "after identifying gaps"
        print(frame)
        print(f'- {comment}')
        print(f'\t- score_numbers: {[n.text for n in score_numbers]}')
        print(f'\t- remaining_digits: {[n.text for n in remaining_digits]}')
        
        print("-------------------------------------")
        print(f'End: {frame}')
        print("=====================================")
    
    return (score_numbers, remaining_digits)

def guess_chartname(reference, remaining_results, remaining_digits):
    # find closest Textbox to the "PERFECT" template text
    chart_name = Textbox(entry=None)
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
    return chart_name

def guess_grade(remaining_results, template):
    grade = Textbox(entry = None)

    # use entry that matches GRADE_LIST text with maximum size (box area)
    max_area = -1
    for entry in remaining_results:
        if entry.area > max_area and entry.text in c.GRADE_LIST:
            max_area = entry.area
            grade = entry

    # quick validation check(s) go here
    if template[c.PERFECT].area > grade.area:
        grade = Textbox(entry = None)
    if template[c.MISS].value:
        try:
            if grade.text in c.NO_MISS and int(template[c.MISS].value.text) > 0:
                grade = Textbox(entry = None)
        except:
            pass
    
    return grade

def guess_chart_diff(remaining_digits, template):
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
    
    return chart_diff

def guess_chart_type(remaining_results, template):
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
    type_idx = -1
    if found_type.text != '':
        diff = 99
        for idx, exp_type in enumerate(c.CHART_TYPES):
            d = editdistance.eval(exp_type, found_type.text)
            if d < diff:
                type_idx = idx
                diff = d
    
    return (found_type, type_idx)

def guess_username(remaining_results, template):
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
    
    return username
