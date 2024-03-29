# pip install editdistance==0.6.0
# pip install numpy==1.23.3

import editdistance
import numpy as np
import os

# local imports
from postprocess import projection_filters
from resources import constants as c
from resources import params
from resources.debugger import Debugger
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
            assigned = False
            for idx, exp_word in enumerate(c.TEMPLATE_WORDS):
                if editdistance.eval(exp_word, template_entry) <= params.FUZZY_EDIT_TEMPLATE_TOL:
                    template[exp_word] = Textbox(result)
                    assigned = True
                    break
            # uncategorized text
            if not assigned:
                other.append(Textbox(result))
    
    return (template, digits, other)

def assign_digits(digits, remaining_results, debug=False):
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
    if debug:
        frame = f'{os.path.basename(__file__)}:{assign_digits.__name__}()'
        debugger = Debugger(frame)
        debugger.start_frame()
        debugger.write_comment("input digits (text field)")
        print(f'[DEBUG] \t- digits: {[n.text for n in digits]}')
        debugger.blank_line()
    
    score_numbers = []
    remaining_digits = []
    
    # score numbers should have string length 3+ (using 2 for some flexibility)
    for d in digits:
        if len(d.text) >= 2:
            score_numbers.append(d)
        else:
            remaining_digits.append(d)
    
    # score numbers should all be above the "CALORIE" textbox if it was found
    calorie_results = [result for result in remaining_results if "calorie" in result.text.lower()]
    if len(calorie_results) > 0:
        # get the y threshold using the bottom left corner
        calorie_bottom_bound = calorie_results[-1].box[3][1]
        
        # find entries to filter out by comparing y-values
        new_score_numbers = []
        for d in score_numbers:
            if d.center[1] < calorie_bottom_bound:
                new_score_numbers.append(d)
            else:
                remaining_digits.append(d)
        score_numbers = new_score_numbers
    
    if debug:
        debugger.write_comment("after CALORIE filtering")
        print(f'[DEBUG] \t- score_numbers (text): {[n.text for n in score_numbers]}')
        print(f'[DEBUG] \t- score_numbers (x-pos): {[n.center[0] for n in score_numbers]}')
        print(f'[DEBUG] \t- remaining_digits (text): {[n.text for n in remaining_digits]}')
        print(f'[DEBUG] \t- remaining_digits (x-pos): {[n.center[0] for n in remaining_digits]}')
        debugger.blank_line()
    
    # filter outliers using x-axis projections
    (score_numbers, outliers) = projection_filters.filter_outliers(score_numbers, axis=0, tol=params.X_TOL, debug=debug)
    remaining_digits += outliers
    
    if debug:
        debugger.write_comment("after x-axis projection")
        print(f'[DEBUG] \t- score_numbers (text): {[n.text for n in score_numbers]}')
        print(f'[DEBUG] \t- score_numbers (x-pos): {[n.center[0] for n in score_numbers]}')
        print(f'[DEBUG] \t- remaining_digits (text): {[n.text for n in remaining_digits]}')
        print(f'[DEBUG] \t- remaining_digits (x-pos): {[n.center[0] for n in remaining_digits]}')
        debugger.blank_line()
    
    # try to filter out stuff below the (TOTAL SCORE) entry, hacky since assumes player scores > 10000
    if len(score_numbers) > 0:
        # these are sorted from top to bottom already by easyOCR
        total_score = None
        skip_start_entries = 4 # padding in case username or BGA above scores has some numbers
        for d in score_numbers:
            if int(d.text) > params.SCORE_MIN and skip_start_entries <= 0:
                # using first "total score" contender for filtering threshold
                total_score = d
                break;
            skip_start_entries -= 1
        
        if total_score is not None:
            # filter out the stuff below the "total score" contender
            new_score_numbers = []
            for d in score_numbers:
                if d.center[1] <= total_score.center[1]:
                    new_score_numbers.append(d)
                else:
                    remaining_digits.append(d)
            score_numbers = new_score_numbers
    
    if debug:
        debugger.write_comment("after params.SCORE_MIN filtering")
        print(f'[DEBUG] \t- score_numbers (text): {[n.text for n in score_numbers]}')
        print(f'[DEBUG] \t- score_numbers (x-pos): {[n.center[0] for n in score_numbers]}')
        print(f'[DEBUG] \t- remaining_digits (text): {[n.text for n in remaining_digits]}')
        print(f'[DEBUG] \t- remaining_digits (x-pos): {[n.center[0] for n in remaining_digits]}')
        debugger.blank_line()
    
    # filter outliers using y-axis displacements (note starting condition of loop differs from repeat iterations
    loop = len(score_numbers) > 7
    while loop:
        (score_numbers, more_outliers) = projection_filters.filter_displacement_outliers(score_numbers, axis=1, tol=params.Y_TOL, debug=debug)
        remaining_digits += more_outliers
        loop = len(more_outliers) > 0
    
    # find any missing (inbetween) entries
    (gap_indices, gap_sizes) = projection_filters.find_displacement_outliers(score_numbers, axis=1, tol=params.GAP_TOL)
    
    if debug:
        debugger.write_comment("after y-axis projection")
        print(f'[DEBUG] \t- score_numbers: {[n.text for n in score_numbers]}')
        print(f'[DEBUG] \t- remaining_digits: {[n.text for n in remaining_digits]}')
        print(f'[DEBUG] \t- gap_indices: {[n for n in gap_indices]}')
        print(f'[DEBUG] \t- gap_sizes: {[n for n in gap_sizes]}')
        debugger.blank_line()
    
    # adjust gap indices based on gap sizes
    gap_indices_adjusted = []
    offset = 0
    for idx, gap in enumerate(gap_indices):
        gapsize = gap_sizes[idx]
        while (gapsize > 1):
            gap_indices_adjusted.append(gap + offset)
            offset += 1
            gapsize -= 1
        gap_indices_adjusted.append(gap + offset)
    gap_indices = gap_indices_adjusted
    
    # check last entry (TOTAL SCORE), hacky since assumes player scores > 10000
    if len(score_numbers) + len(gap_indices) < 7 and len(score_numbers) > 0:
        if int(score_numbers[-1].text) < params.SCORE_MIN:
            gap_indices.append(6)
    
    # if still gaps, assuming missing scores from top to bottom
    iterator = 0
    while len(score_numbers) + len(gap_indices) < 7:
        if iterator not in gap_indices:
            gap_indices.append(iterator)
        iterator += 1
    
    for idx in gap_indices:
        artificial_entry = Textbox(entry=None)
        artificial_entry.text = "000"
        score_numbers.insert(idx, artificial_entry)
    
    if debug:
        debugger.write_comment("after identifying gaps")
        print(f'[DEBUG] \t- score_numbers: {[n.text for n in score_numbers]}')
        print(f'[DEBUG] \t- remaining_digits: {[n.text for n in remaining_digits]}')
        debugger.end_frame()
    
    return (score_numbers, remaining_digits)

def guess_chartname(remaining_results, remaining_digits, template):
    chart_name = Textbox(entry = None)
    
    if template[c.PERFECT].area != 0:
        reference = template[c.PERFECT].center
    elif template[c.GREAT].area != 0:
        reference = template[c.GREAT].center
    else:
        return chart_name

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

def guess_chart_diff(remaining_digits, template, debug=False):
    if debug:
        frame = f'{os.path.basename(__file__)}:{guess_chart_diff.__name__}()'
        debugger = Debugger(frame)
        debugger.start_frame()
        debugger.write_comment("Remaining Digits")
        print(f'[DEBUG] \t- remaining_digits: {[r.text for r in remaining_digits]}')
        debugger.blank_line()

    chart_diff = Textbox(entry = None)
    double_digits = []
    for entry in remaining_digits:
        if len(entry.text) == 2:
            double_digits.append(entry)

    if debug:
        debugger.write_comment("Double Digit Entries (text_field)")
        print(f'[DEBUG] \t- double_digits.text: {[d.text for d in double_digits]}')
        debugger.blank_line()

    double_filtered = []
    for entry in double_digits:
        x_pos = entry.center[0]
        y_pos = entry.center[1]

        # should be above the footer text
        if template[c.FOOTER].area > 0 and y_pos > template[c.FOOTER].center[1]:
            continue

        if template[c.PERFECT].area > 0 and template[c.GRADE].text != '':
            # should be horizontally closer to GRADE than to PERFECT, also should be lower than both
            grade_dist_x = abs(x_pos - template[c.GRADE].center[0])
            perf_dist_x = abs(x_pos - template[c.PERFECT].center[0])
            if grade_dist_x > perf_dist_x:
                continue
            if y_pos < template[c.GRADE].center[1]:
                continue
            double_filtered.append(entry)

        if template[c.PERFECT].area > 0 and template[c.MISS].area > 0:
            # should be vertically closer to MISS than to PERFECT, also should be lower than both
            miss_dist_y = abs(y_pos - template[c.MISS].center[1])
            perf_dist_y = abs(y_pos - template[c.MISS].center[1])
            if miss_dist_y > perf_dist_y:
                continue
            if y_pos < template[c.TOTAL_SCORE].center[1]:
                continue

        if template[c.PERFECT].area > 0 and template[c.TOTAL_SCORE].area > 0:
            # should be vertically closer to TOTAL_SCORE than to PERFECT, also should be lower than both
            total_dist_y = abs(y_pos - template[c.TOTAL_SCORE].center[1])
            perf_dist_y = abs(y_pos - template[c.PERFECT].center[1])
            if total_dist_y > perf_dist_y:
                continue
            if y_pos < template[c.TOTAL_SCORE].center[1]:
                continue

        double_filtered.append(entry)

    if debug:
        debugger.write_comment("Filtered Entries (text_field)")
        print(f'[DEBUG] \t- double_filtered.text: {[d.text for d in double_filtered]}')
        debugger.blank_line()

    # not ideal, but just pick smallest y-value filtered two-digit number result
    if len(double_filtered) > 0:
        chart_diff = double_filtered[0]
    
    if debug:
        debugger.write_comment("chosen result (text field)")
        print(f'[DEBUG] \t- chart_diff.text: {chart_diff.text}')
        debugger.end_frame()

    return chart_diff

def guess_chart_type(remaining_results, template, debug=False):
    if debug:
        frame = f'{os.path.basename(__file__)}:{guess_chart_type.__name__}()'
        debugger = Debugger(frame)
        debugger.start_frame()
        debugger.write_comment("Remaining Results")
        print(f'[DEBUG] \t- remaining_results: {[r.text for r in remaining_results]}')
        debugger.blank_line()

    found_type = Textbox(entry = None)
    type_idx = -1

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
        if found_type.text != '':
            diff = 99
            for idx, exp_type in enumerate(c.CHART_TYPES):
                d = editdistance.eval(exp_type, found_type.text.upper())
                if d < diff:
                    type_idx = idx
                    diff = d
    else:
        # no proximity shortcuts, just iterate through all remaining results to find the best text match
        diff = 99
        for result in remaining_results:
            for idx, exp_type in enumerate(c.CHART_TYPES):
                d = editdistance.eval(exp_type, result.text.upper())
                if d < diff:
                    type_idx = idx
                    diff = d
                    found_type = result

    if diff >= 5:
        # last index of c.CHART_TYPES should be the custom error text
        not_found = Textbox()
        not_found.text = "UNKNOWN"

        if debug:
            debugger.write_comment("chosen results (text field)")
            print(f'[DEBUG] \t- not_found.text: {found_type.text}')
            debugger.end_frame()

        return (not_found, -1)

    if debug:
        debugger.write_comment("chosen results (text field)")
        print(f'[DEBUG] \t- found_type.text: {found_type.text}')
        debugger.end_frame()

    return (found_type, type_idx)

def guess_username(textboxes, template, debug=False):
    """
    Guess the username by utilizing the fact its x-axis proximity should be close to the score values.
    """
    if debug:
        frame = f'{os.path.basename(__file__)}:{guess_username.__name__}()'
        debugger = Debugger(frame)
        debugger.start_frame()
        debugger.write_comment("input guesses (text field)")
        print(f'[DEBUG] \t- textboxes: {[r.text for r in textboxes]}')
        debugger.blank_line()
    
    username = Textbox(entry = None)
    
    # assumes score values have been assigned to the template already
    p = template[c.PERFECT].value
    m = template[c.MISS].value
    if p and p.area != 0 and m and m.area != 0:
        # method 1:
            # finds closest word to expected distance directly above score values
            # specified with a magnitude of (PERFECT score value) - (MISS score value)
        disp = np.subtract(m.center, p.center)
        expected = np.subtract(p.center, disp)
        min = float("inf")
        for entry in textboxes:
            # avoid unnecessary sqrt operation
            vectors = np.subtract(expected, entry.center)
            dist2 = np.square(vectors)
            euclidean2 = np.sum(dist2)
            if euclidean2 < min:
                username = entry
                min = euclidean2
        if debug:
            debugger.write_comment("first method: chosen result (text field)")
            print(f'[DEBUG] \t- disp: {m.center} - {p.center} = {disp}')
            print(f'[DEBUG] \t- expected: {p.center} - {disp} = {expected}')
            print(f'[DEBUG] \t- username: {username.text}')
            print(f'[DEBUG] \t- coordinates: {username.center}')
    else:
        # method 2:
            # just find closest text directly above the highest available score words or score values
            # using a x-axis filtering with a certain tolerance and y-axis comparisons
        score_values = [template[entry].value for entry in c.SCORE_WORDS]
        centers = [entry.center[0] for entry in score_values if entry.center[0] > 0]
        center = 0.5*np.mean(centers) + 0.5*np.median(centers)
        stdev = np.std(centers)
        
        # x-axis filtering
        outliers = projection_filters.find_outliers(textboxes, axis=0, tol=params.NAME_X_TOL, reference=(center, stdev))
        contenders = [entry for idx, entry in enumerate(textboxes) if idx not in outliers]
        
        if debug:
            debugger.write_comment("second method: x-axis filtered results (text field)")
            print(f'[DEBUG] \t- contenders: {[contender.text for contender in contenders]}')
            debugger.blank_line()
        
        # set the y boundary for further filtering
        y_bound = float("inf")

        # username y-pos should be above chart name's y-pos
        if template[c.CHART].center[1] > 0:
            y_bound = template[c.CHART].center[1]

        for possible_reference in c.SCORE_WORDS:
            # username y-pos should be above all score words' y-pos
            if template[possible_reference].center[1] > 0 and template[possible_reference].center[1] < y_bound:
                y_bound = template[possible_reference].center[1]
                break
            # same for the score words' numeric values' y-pos
            if template[possible_reference].value.center[1] > 0 and template[possible_reference].value.center[1] < y_bound:
                y_bound = template[possible_reference].value.center[1]
                break
        
        if debug:
            debugger.write_comment("second method: using y-axis threshold:")
            print(f'[DEBUG] \t- y_bound: {y_bound}')
            debugger.blank_line()
        
        # choose the word closest to the y_bound that's not below it
        min = float("inf")
        for entry in contenders:
            if entry.center[1] < y_bound and (y_bound - entry.center[0]) < min:
                username = entry
                min = y_bound - entry.center[0]
        if debug:
            debugger.write_comment("second method: chosen result (text field)")
            print(f'[DEBUG] \t- username: {username.text}')
            print(f'[DEBUG] \t- coordinates: {username.center}')
    
    if debug:
        debugger.end_frame()
    
    return username
