# pip install easyocr (1.6.2)
# pip install editdistance

from easyocr import Reader
import cv2
import editdistance
import numpy as np
import os
import sys

class Textbox:
    box = [[-1, -1], [-1, -1], [-1, -1], [-1, -1]]
    center = [-1, -1]
    text = ''
    confidence = 0
    area = 0
    value = None

    def __init__(self, entry=None):
        if entry == None:
            return
        self.box = entry[0]
        self.text = entry[1]
        self.confidence = entry[2]
        self.area = self.shoelace_area(entry[0])
        self.center = self.box_center(entry[0])

    def shoelace_area(self, box):
        p1 = box[0][0]*box[1][1] + box[1][0]*box[2][1] + box[2][0]*box[3][1] + box[3][0]*box[0][1]
        p2 = box[1][0]*box[0][1] + box[2][0]*box[1][1] + box[3][0]*box[2][1] + box[0][0]*box[3][1]
        area = abs(0.5 * (p1 - p2))
        return area

    def box_center(self, box):
        xmean = np.mean([box[0][0], box[1][0], box[2][0], box[3][0]])
        ymean = np.mean([box[0][1], box[1][1], box[2][1], box[3][1]])
        return [xmean, ymean]
    
    def copy(self):
        return Textbox((self.box, self.text, self.confidence))

def filter_image(image, alpha, beta):
    """
    pixel' = alpha*pixel + beta
        alpha = contrast filter value
        beta = brightness filter value
    """
    # green channel looks good for contrasting text with background
    green_channel = image[:,:,1]
    filter = alpha*green_channel - beta
    filter[filter>255] = 255
    filter[filter<0] = 0
    filter = filter.astype("uint8")
    return filter

def filterProjectedOutliers(digits, axis, tol=0.75):
    """
    *********************************************************
    axis=0 for x-axis, axis=1 for y-axis
    *********************************************************
    returns with:
    - a filtered output of the input 'digits' list
    - the remaining entries of the input 'digits' list
    *********************************************************
    """

    # retrieve box means
    centers = [entry.center[axis] for entry in digits]
    
    # get statistics for preservation boundaries
    center = 0.5*np.mean(centers) + 0.5*np.median(centers)
    stdev = np.std(centers)
    upper = center + tol*stdev
    lower = center - tol*stdev

    # identify outlier indices
    outliers = list(map(lambda p: p < lower or p > upper, centers))
    outlier_idxs = [idx for idx, bool_val in enumerate(outliers) if bool_val]

    # create the filtered list
    filtered_list = []
    excluded_list = []
    for idx, entry in enumerate(digits):
        if idx in outlier_idxs:
            excluded_list.append(entry)
        else:
            filtered_list.append(entry)
    
    return (filtered_list, excluded_list)

def findDisplacementOutliers(digits, axis, tol=1.5):
    """
    *********************************************************
    axis=0 for x-axis, axis=1 for y-axis
    *********************************************************
    returns with a filtered output of the input 'digits' list
    *********************************************************
    """

    # retrieve box mean displacements
    centers = [entry.center[axis] for entry in digits]
    centers = np.diff(centers)
    center = 0.5*np.mean(centers) + 0.5*np.median(centers)

    # identify outlier indices
    outliers = list(map(lambda p: p > tol*center, centers))
    outlier_idxs = [idx for idx, bool_val in enumerate(outliers) if bool_val]

    # using displacements shifts deletion index; shift it back before next step
    outlier_idxs = [x + 1 for x in outlier_idxs]
    return outlier_idxs

def filterDisplacementOutliers(digits, axis, tol=3):
    """
    *********************************************************
    axis=0 for x-axis, axis=1 for y-axis
    *********************************************************
    returns with:
    - a filtered output of the input 'digits' list
    - the remaining entries of the input 'digits' list
    - whether or not any outliers were found
    *********************************************************
    """

    outlier_idxs = findDisplacementOutliers(digits, axis, tol)

    # create the filtered list
    filtered_list = []
    excluded_list = []
    for idx, entry in enumerate(digits):
        if idx in outlier_idxs:
            excluded_list.append(entry)
        else:
            filtered_list.append(entry)
    
    return (filtered_list, excluded_list, len(outlier_idxs) > 0)

def main(fname):
    # load the input image from disk
    alpha = 2.0
    beta = 150
    confidence_threshold = 0.1
    x_tol = 0.75
    y_tol = 3
    gap_tol = 1.3
    score_min = 10000

    image = cv2.imread(fname)
    if image is None:
        print(f'unable to find {fname}')
        return

    filtered = filter_image(image, alpha, beta)

    # OCR the input image using EasyOCR
    print("[INFO] OCR'ing input image...")
    reader = Reader(['en'], gpu=True)
    results = reader.readtext(filtered)

    # post-processing: remove low-confidence text
    confident_results = [result for result in results if result[2] > confidence_threshold]

    # post-processing: categorize template text, digits, and remaining text
    score_words = ["PERFECT", "GREAT", "GOOD", "BAD", "MISS", "MAX COMBO", "TOTAL SCORE"]
    template_words = score_words + ["CALORIE(KCAL)", "MY BEST", "MACHINE BEST", "FOOTER"]
    template = {key: Textbox(entry=None) for key in template_words}
    digits = []
    remaining_results = []
    for result in confident_results:
        template_entry = result[1].upper()
        if template_entry in template_words:
            # expected template words
            template[template_entry] = Textbox(result)
        elif template_entry.isdigit():
            # other numbers text
            digits.append(Textbox(result))
        elif template_entry == "FREE PLAY" or "CREDIT(S)" in template_entry:
            # nothing of interest below the footer text on-screen
            template["FOOTER"] = Textbox(result)
            break
        else:
            # uncategorized text
            remaining_results.append(Textbox(result))

    # filter outliers using x-axis projections
    rval = filterProjectedOutliers(digits, axis=0, tol=x_tol)
    filtered_numbers = rval[0]
    remaining_digits = rval[1]

    # filter outliers using y-axis displacements
    loop = True
    score_numbers = filtered_numbers.copy()
    while loop:
        rval = filterDisplacementOutliers(score_numbers, axis=1, tol=y_tol)
        score_numbers = rval[0]
        remaining_digits += rval[1]
        loop = rval[2]

    # find any missing (inbetween) entries
    outliers = findDisplacementOutliers(score_numbers, axis=1, tol=gap_tol)

    # check last entry (TOTAL SCORE), hacky since assumes player scores > 10000
    if len(score_numbers) + len(outliers) < 7:
        if int(score_numbers[-1].text) < score_min:
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
    for idx, word in enumerate(score_words):
        template[word].value = score_numbers[idx]
    
    # get song name using PERFECT text as a reference
    chart_name = None
    template["CHART"] = Textbox(entry = None)
    if template["PERFECT"].area > 0:
        reference = template["PERFECT"].center

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

        template["CHART"] = chart_name
        template["CHART"].text = chart_name.text.upper()
        template["CHART"].value = chart_name.text.upper()
    
    # get grade
    gradelist = ["SSS", "SS", "S", "A", "B", "C", "D", "F"]
    grade = Textbox(entry = None)

    # use entry that matches gradelist text with maximum size (box area)
    max_area = -1
    for entry in remaining_results:
        if entry.area > max_area and entry.text in gradelist:
            max_area = entry.area
            grade = entry

    # quick validation check(s) go here
    if template["PERFECT"].area > grade.area:
        grade = Textbox(entry = None)
    if template["MISS"].value:
        try:
            if grade.text in ["SSS", "SS", "S"] and int(template["MISS"].value.text) > 0:
                grade = Textbox(entry = None)
        except:
            pass

    template["GRADE"] = grade
    template["GRADE"].value = grade.text
    
    # get chart difficulty
    chart_diff = Textbox(entry = None)
    double_digits = []
    for entry in remaining_digits:
        if len(entry.text) == 2:
            double_digits.append(entry)

    double_filtered = []
    if template["PERFECT"].area > 0 and template["GRADE"].text != '':
        # should be closer to GRADE than to PERFECT, also should be lower than both
        for entry in double_digits:
            x_pos = entry.center[0]
            y_pos = entry.center[1]
            grade_dist_x = abs(x_pos - template["GRADE"].center[0])
            perf_dist_x = abs(x_pos - template["PERFECT"].center[0])
            if grade_dist_x > perf_dist_x:
                continue
            if y_pos < template["GRADE"].center[1]:
                continue
            # should be above the footer text
            if template["FOOTER"].area > 0 and y_pos > template["FOOTER"].center[1]:
                continue
            double_filtered.append(entry)

    # not ideal, but just pick smallest y-value filtered two-digit number result
    if len(double_filtered) > 0:
        chart_diff = double_filtered[0]

    template["DIFFICULTY"] = chart_diff
    if chart_diff.text != '':
        template["DIFFICULTY"].value = int(chart_diff.text)
    
    # get single or double
    found_type = Textbox(entry = None)

    if template["DIFFICULTY"].area > 0:
        # find closest remaining Textbox to the "difficulty" text
        reference = template["DIFFICULTY"].center
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
    chart_types = ["SINGLE", "DOUBLE", "CO-OP", "SINGLE P.", "DOUBLE P."]
    found_type.text = found_type.text.upper()
    if found_type != '':
        diff = 99
        type_idx = -1
        for idx, exp_type in enumerate(chart_types):
            d = editdistance.eval(exp_type, found_type.text)
            if d < diff:
                type_idx = idx
                diff = d

    template["TYPE"] = found_type.copy()
    if found_type.text != '':
        template["TYPE"].value = chart_types[type_idx]
    
    # get username
    # finds closest word to expected distance directly above perfect score value
    # specified with a magnitude of perfect score value - miss score value
    username = Textbox(entry = None)

    p = template["PERFECT"].value
    m = template["MISS"].value
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

    template["USER"] = username
    template["USER"].value = username.text.upper()
    
    print(f'PLAYER: {template["USER"].value}')
    print(f'CHART: {template["CHART"].value} | {template["TYPE"].value} {template["DIFFICULTY"].value}')
    print(f'GRADE: {template["GRADE"].value}')

    print("======================")
    for word in score_words:
        try:
            print(f'{word}: {template[word].value.text}')
        except:
            print(f'{word}: NOT FOUND')
    print("======================")

if __name__ == "__main__":
    args = sys.argv[1:]
    if len(args) > 0:
        dir = os.path.dirname(__file__)
        fname = os.path.join(dir, "input_images", args[0])
        main(fname)
