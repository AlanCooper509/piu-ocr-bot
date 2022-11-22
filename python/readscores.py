# pip install easyocr (1.6.2)

from easyocr import Reader
import cv2
import numpy as np
import os
import sys

# local imports
from preprocess import filter
from postprocess import categorizer
from resources import constants as c
from resources import params
from resources.textbox import Textbox

def post_process(results, debug=False):
    # defining the template to fill out during this function
    template = {key: Textbox(entry=None) for key in c.ALL_WORDS}

    # post-processing: remove low-confidence text
    confident_results = [result for result in results if result[2] > params.CONFIDENCE]
    
    # categorize remaining text results
    (template, digits, remaining_results) = categorizer.categorize_results(confident_results, template)
    
    # filter digits for score values using 1D projections of positions
    (score_numbers, remaining_digits) = categorizer.assign_digits(digits, debug)
    
    # match scores with their template word's values
    if len(c.SCORE_WORDS) == len(score_numbers):
        for idx, word in enumerate(c.SCORE_WORDS):
            template[word].value = score_numbers[idx]
    
    # get chart name
    chart_name = categorizer.guess_chartname(remaining_results, remaining_digits, template)
    template[c.CHART] = chart_name
    template[c.CHART].text = chart_name.text.upper()
    template[c.CHART].value = chart_name.text.upper()
    if chart_name.text != '':
        remaining_results = [r for r in remaining_results if r.text != chart_name.text]
    
    # get grade
    grade = categorizer.guess_grade(remaining_results, template)
    template[c.GRADE] = grade
    template[c.GRADE].value = grade.text
    
    # get chart difficulty
    chart_diff = categorizer.guess_chart_diff(remaining_digits, template)
    template[c.DIFFICULTY] = chart_diff
    if chart_diff.text != '':
        template[c.DIFFICULTY].value = int(chart_diff.text)
    
    # get single or double
    (found_type, type_idx) = categorizer.guess_chart_type(remaining_results, template)
    template[c.TYPE] = found_type.copy()
    if found_type.text != '':
        template[c.TYPE].value = c.CHART_TYPES[type_idx]
    
    # get username
    username = categorizer.guess_username(remaining_results, template, debug)
    template[c.USER] = username
    template[c.USER].value = username.text.upper()
    if username.text != '':
        remaining_results = [r for r in remaining_results if r.text != username.text]
    
    return (template, remaining_results)

def print_findings(template, remaining_results):
    print("======================")
    print(f'PLAYER: {template[c.USER].value}')
    print(f'CHART: {template[c.CHART].value} | {template[c.TYPE].value} {template[c.DIFFICULTY].value}')
    print(f'GRADE: {template[c.GRADE].value}')
    
    print("----------------------")
    for word in c.SCORE_WORDS:
        try:
            print(f'{word}: {template[word].value.text}')
        except:
            print(f'{word}: NOT FOUND')
    print("----------------------")
    print([r.text for r in remaining_results])
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
    (template, remaining_results) = post_process(results, debug=True)
    
    # debugging purposes (for now)
    print_findings(template, remaining_results)

if __name__ == "__main__":
    args = sys.argv[1:]
    if len(args) == 1:
        dir = os.path.dirname(os.path.dirname(__file__))
        fname = os.path.join(dir, "input_images", args[0])
        main(fname)
    elif len(args) > 1:
        print(f"{os.path.basename(__file__)}: Too many input args")
    else:
        print(f"{os.path.basename(__file__)}: Need to include filename")
